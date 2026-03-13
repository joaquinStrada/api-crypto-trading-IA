import { Request, Response } from 'express'
import { User, ProfileImage, LoginUser, RefreshToken } from '../interfaces/User.interface'
import { loginSchema, registerSchema } from '../zod/user.schema'
import { getConnection } from '../database'
import bcrypt from 'bcrypt'
import path from 'path'
import { Jimp } from 'jimp'
import { uploadFile } from '../utils/minio'
import { responseTokens, responseAccessToken } from '../utils/responseTokens'
import jwt from 'jsonwebtoken'
import { config } from '../utils/config'

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  const user: LoginUser = req.body

  try {
    // Validamos los campos
    const validateInputs = await loginSchema.safeParseAsync(user)

    if (validateInputs.error) {
      return res.status(400).json({
        error: true,
        message: 'Error en el envio de datos',
        details: JSON.parse(validateInputs.error.message)
      })
    }

    // Verificamos la conexion a la BD
    const conn = getConnection()

    if (!conn) throw new Error('Error al conectarse a la BD')
    
    // Validamos que el usuario exista
    const [ userResult ] = await conn.query('SELECT BIN_TO_UUID(id) as id, email, password FROM users WHERE email = ?', [user.email])

    if ((userResult as User[]).length != 1 || (userResult as User[])[0]?.email !== user.email) {
      return res.status(400).json({
        error: true,
        message: 'Credenciales inválidas'
      })
    }

    // Validamos el password
    const validPassword = await bcrypt.compare(user.password, (userResult as User[])[0]?.password || '')

    if (!validPassword) {
      return res.status(400).json({
        error: true,
        message: 'Credenciales inválidas'
      })
    }

    // Respondemos los tokens al usuario
    responseTokens(res, (userResult as User[])[0]?.id || '', user.remember)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: true,
      message: 'Error al loggear al usuario'
    })
  }
}

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  const newUser: User = req.body

  try {
    // Validamos los campos
    const validateInputs = await registerSchema.safeParseAsync(newUser)
    
    if (validateInputs.error) {
      return res.status(400).json({
        error: true,
        message: 'Error en el envio de datos',
        details: JSON.parse(validateInputs.error.message)
      })
    }
    
    // Verificamos la conexion a la BD
    const conn = getConnection()

    if (!conn) throw new Error('Error al conectarse a la BD')

    // Validamos que el email no exista
    const [ isEmailExist ] = await conn.query('SELECT COUNT(*) FROM users WHERE email = ?', [newUser.email])

    if ((isEmailExist as any[])[0]['COUNT(*)'] > 0) {
      return res.status(422).json({
        error: true,
        message: 'El email ya está registrado'
      })
    }

    // Encriptamos el password del usuario
    newUser.password = await bcrypt.hash(newUser.password, 10)

    // Procesamos la foto de perfil
    const [ uuidResult ] = await conn.query('SELECT UUID() uuid;')
    newUser.id = (uuidResult as any[])[0].uuid

    if (req.files?.image) {
      const { image } = req.files as ProfileImage
      const newName = path.format({ 
        name: newUser.id, 
        ext: path.extname(image?.name || '') || '.jpg' 
      })
      newUser.imageBig = 'big_' + newName
      newUser.imageMedium = 'medium_' + newName
      newUser.imageSmall = 'small_' + newName

      // Paths
      const pathBig: string = path.resolve(newUser.imageBig)
      const pathMedium: string = path.resolve(newUser.imageMedium)
      const pathSmall: string = path.resolve(newUser.imageSmall)

      // Cargamos la imagen con Jimp
      const Image = await Jimp.read(image?.data || Buffer.alloc(0))

      // Redimensionamos y guardamos las imágenes
      await Image.clone().resize({
        w: 300,
        h: 300
      }).write(pathBig as `${string}.${string}`)

      await Image.clone().resize({
        w: 50,
        h: 50
      }).write(pathMedium as `${string}.${string}`)

      await Image.clone().resize({
        w: 20,
        h: 20
      }).write(pathSmall as `${string}.${string}`)
      
      // Subir los archivos a Minio
      await uploadFile(pathBig, `Profiles/${newUser.imageBig}`)
      await uploadFile(pathMedium, `Profiles/${newUser.imageMedium}`)
      await uploadFile(pathSmall, `Profiles/${newUser.imageSmall}`)
    } else {
      newUser.imageBig = null
      newUser.imageMedium = null
      newUser.imageSmall = null
    }

    // Registramos el usuario
    await conn.query(`INSERT INTO users (id, fullname, email, password,	imageBig, imageMedium, imageSmall)
                      VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`, [newUser.id, newUser.fullname, newUser.email, newUser.password, newUser.imageBig, newUser.imageMedium, newUser.imageSmall])
    
    // Respondemos los tokens al usuario
    responseTokens(res, newUser.id || '', true)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: true,
      message: 'Error al registrar el usuario'
    })
  }
}

export const refresh = async (req: Request, res: Response): Promise<Response | void> => {
  const token: string = req.cookies.refreshToken

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Acceso denegado'
    })
  }

  try {
    const data = jwt.verify(token, config.jwt.refreshTokenSecret) as RefreshToken

    // Verificamos la conexion a la BD
    const conn = getConnection()

    if (!conn) throw new Error('Error al conectarse a la BD')

    // Validamos que el usuario exista
    const [ userResult ] = await conn.query('SELECT COUNT(*) AS count FROM `users` WHERE `id` = UUID_TO_BIN(?);', [data.userId])

    if ((userResult as any[])[0].count != 1) throw new Error('Usuario no encontrado')
    
    // Generamos los tokens
    if (data.remember) {
      responseTokens(res, data.userId, true)
    } else {
      responseAccessToken(res, data.userId)
    }
  } catch (err) {
    console.error(err)
    res.status(401).json({
      error: true,
      message: 'Acceso denegado'
    })
  }
}

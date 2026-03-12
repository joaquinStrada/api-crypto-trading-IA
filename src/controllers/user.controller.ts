import { Request, Response } from 'express'
import { User, ProfileImage } from '../interfaces/User.interface'
import { registerSchema } from '../zod/user.schema'
import { getConnection } from '../database'
import bcrypt from 'bcrypt'
import path from 'path'
import { Jimp } from 'jimp'
import jwt from 'jsonwebtoken'
import { uploadFile } from '../utils/minio'
import { config } from '../utils/config'
import parseExpiressIn from '../utils/parseExpiressIn'

export const login = (req: Request, res: Response): Response | void => {
  res.json({ message: 'Login endpoint' })
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
    
    // Verificamos law conexion a la BD
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
    
    // Generamos los tokens de authenticacion
    const accessToken = jwt.sign({ userId: newUser.id || '' }, config.jwt.accessTokenSecret as string, { 
      expiresIn: config.jwt.accessTokenExpiration 
    } as any)

    const refreshToken = jwt.sign({ userId: newUser.id || '' }, config.jwt.refreshTokenSecret as string, { 
      expiresIn: config.jwt.refreshTokenExpiration 
    } as any)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.express.secure,
      sameSite: config.express.sameSite
    }).json({
      error: false,
      data: {
        accessToken,
        expiressInAccessToken: parseExpiressIn(config.jwt.accessTokenExpiration),
        expiressInRefreshToken: parseExpiressIn(config.jwt.refreshTokenExpiration)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: true,
      message: 'Error al registrar el usuario'
    })
  }
}

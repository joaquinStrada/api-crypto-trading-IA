import { Request, Response } from 'express'
import { User, ProfileImage, LoginUser, RefreshToken } from '../interfaces/User.interface'
import { loginSchema, registerSchema, editSchema } from '../zod/user.schema'
import { getConnection } from '../database'
import bcrypt from 'bcrypt'
import path from 'path'
import { Jimp } from 'jimp'
import { uploadFile, getFile, deleteFile } from '../utils/minio'
import { responseTokens, responseAccessToken } from '../utils/responseTokens'
import jwt from 'jsonwebtoken'
import { config } from '../utils/config'
import mime from 'mime-types'
import { pipeline } from 'stream/promises'

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
      message: 'Error al authenticar al usuario'
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
      const pathBig = path.resolve(newUser.imageBig) as `${string}.${string}`
      const pathMedium = path.resolve(newUser.imageMedium) as `${string}.${string}`
      const pathSmall = path.resolve(newUser.imageSmall) as `${string}.${string}`

      // Cargamos la imagen con Jimp
      const Image = await Jimp.read(image?.data || Buffer.alloc(0))

      // Redimensionamos y guardamos las imágenes
      await Image.clone().resize({
        w: 300,
        h: 300
      }).write(pathBig)

      await Image.clone().resize({
        w: 50,
        h: 50
      }).write(pathMedium)

      await Image.clone().resize({
        w: 20,
        h: 20
      }).write(pathSmall)
      
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

export const getUser = (req: Request, res: Response): void => {
  res.json({
    error: false,
    data: req.user
  })
}

export const getProfileImage = async (req: Request, res: Response): Promise<Response | void> => {
  const imageName = String(req.params.imageName) 
  const { imageBig, imageMedium, imageSmall } = req.user || {
    imageBig: '', 
    imageMedium: '',
    imageSmall: ''
  }

  if (imageName !== imageBig && imageName !== imageMedium && imageName !== imageSmall) {
    return res.status(404).json({
      error: true,
      message: 'La imagen no existe'
    })
  }

  try {
    const result = await getFile(`Profiles/${imageName}`)

    // Seteamos los headers
    const ext = path.extname(imageName)

    res.header('Content-Type', String(mime.lookup(ext)))

    // Respondemos la imagen
    if (result.Body) await pipeline(result.Body as NodeJS.ReadableStream, res)
    else throw new Error('No se pudo leer el archivo')
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: true,
      message: 'Error al recuperar la imagen'
    })
  }
}

export const editUser = async (req: Request, res: Response): Promise<Response | void> => {
  const editUser: User = req.body
  const userId = req.user?.id

  try {
    // Validamos los campos
    const validateInputs = await editSchema.safeParseAsync(editUser)
    
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
    const [ isEmailExist ] = await conn.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ?', [editUser.email])

    if ((isEmailExist as User[]).length > 1 || ((isEmailExist as User[]).length == 1 && (isEmailExist as User[])[0]?.id !== userId)) {
      return res.status(422).json({
        error: true,
        message: 'El email ya está registrado'
      })
    }

    // Encriptamos la contraseña
    if (editUser.password) editUser.password = await bcrypt.hash(editUser.password, 10)
    
    // Subir la imagen de perfil
    if (req.files?.image) {
      const { image } = req.files as ProfileImage

      const newName = path.format({
        name: userId,
        ext: path.extname(image?.name || '') || '.jpg'
      })

      editUser.imageBig = 'big_' + newName
      editUser.imageMedium = 'medium_' + newName
      editUser.imageSmall = 'small_' + newName

      // Crear los paths
      const pathBig = path.resolve(editUser.imageBig) as `${string}.${string}`
      const pathMedium = path.resolve(editUser.imageMedium) as `${string}.${string}`
      const pathSmall = path.resolve(editUser.imageSmall) as `${string}.${string}`

      // Cargamos la imagen con Jimp
      const Image = await Jimp.read(image?.data || Buffer.alloc(0))
      
      // Redimensionamos y guardamos las imágenes
      await Image.clone().resize({
        w: 300,
        h: 300
      }).write(pathBig)

      await Image.clone().resize({
        w: 50,
        h: 50
      }).write(pathMedium)

      await Image.clone().resize({
        w: 20,
        h: 20
      }).write(pathSmall)

      // Eliminamos los archivos de minio
      const { imageBig, imageMedium, imageSmall } = req.user || {
        imageBig: null, 
        imageMedium: null,
        imageSmall: null
      }

      if (imageBig && imageMedium && imageSmall) {
        await deleteFile(`Profiles/${imageBig}`)
        await deleteFile(`Profiles/${imageMedium}`)
        await deleteFile(`Profiles/${imageSmall}`)
      }

      // Subir los archivos a Minio
      await uploadFile(pathBig, `Profiles/${editUser.imageBig}`)
      await uploadFile(pathMedium, `Profiles/${editUser.imageMedium}`)
      await uploadFile(pathSmall, `Profiles/${editUser.imageSmall}`)
    } else {
      delete editUser.imageBig
      delete editUser.imageMedium
      delete editUser.imageSmall
    }

    // Editamos el usuario
    await conn.query('UPDATE users SET ? WHERE id = UUID_TO_BIN(?)', [editUser, userId])

    // Responder al cliente
    const [ user ] = await conn.query('SELECT BIN_TO_UUID(id) as id, createdAt, fullname, email, imageBig, imageMedium, imageSmall FROM users WHERE id = UUID_TO_BIN(?)', [userId])

    res.json({
      error: false,
      data: (user as User[])[0] || null
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: true,
      message: 'Error al editar el usuario'
    })
  }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('refreshToken')
  res.sendStatus(204)
}
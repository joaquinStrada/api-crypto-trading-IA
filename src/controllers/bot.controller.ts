import { Request, Response } from 'express'
import { Bot } from '../interfaces/Bot.interface'
import botSchema from '../zod/bot.schema'
import { getConnection } from '../database'
import { config } from '../utils/config'
import fs from 'fs/promises'
import path from 'path'
import { UploadedFile } from 'express-fileupload'
import { lookup } from 'mime-types'
import { pipeline } from 'stream/promises'
import { uploadFile, deleteFile, getFiles, getFile as GetFile, isExistFile, uploadBufferFile } from '../utils/minio'

export const getBots = async (req: Request, res: Response): Promise<void> => {
    const userId = String(req.user?.id)

    try {
        // Validamos la conexion
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')

        // Recuperamos los bots
        const [Bots] = await conn.query('SELECT BIN_TO_UUID(id) as id, createdAt, name, description, model FROM bots WHERE userId = UUID_TO_BIN(?)', [userId])

        res.json({
            error: false,
            count: (Bots as Bot[]).length,
            data: Bots as Bot[]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha ocurrido un error al recuperar los bots'
        })
    }
}

export const getBot = async (req: Request, res: Response): Promise<Response | void> => {
    const botId = String(req.params.id)

    try {
        // Validamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')

        // Recuperamos el bot
        const [Bot] = await conn.query('SELECT BIN_TO_UUID(id) as id, createdAt, name, description, model FROM bots WHERE id = UUID_TO_BIN(?)', [botId])

        res.json({
            error: false,
            data: (Bot as Bot[])[0]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha ocurrido un error al recuperar el bot'
        })
    }
}

export const createBot = async (req: Request, res: Response): Promise<Response | void> => {
    const newBot: Bot = req.body
    const userId = String(req.user?.id)

    try {
        // Validamos los campos
        const validateInputs = await botSchema.safeParseAsync(newBot)

        if (validateInputs.error) {
            return res.status(400).json({
                error: true,
                message: 'Error en el envio de datos',
                datails: JSON.parse(validateInputs.error.message)
            })
        }

        // Validamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')

        // Validamos que el usuario no tenga un bot con el mismo nombre
        const [BotExist] = await conn.query('SELECT COUNT(*) as count FROM bots WHERE LOWER(name) = LOWER(?) AND userId = UUID_TO_BIN(?)', [newBot.name, userId])

        if ((BotExist as any[])[0].count > 0) {
            return res.status(422).json({
                error: true,
                message: 'Ya tienes un bot registrado con el mismo nombre'
            })
        }

        // Generar un UUID
        const [UUIDResult] = await conn.query('SELECT UUID() uuid')
        newBot.id = (UUIDResult as any[])[0].uuid

        // Registramos el bot en la BD
        await conn.query(`INSERT INTO bots (id, name, description, model, userId)
            VALUES (UUID_TO_BIN(?), ?, ?, ?, UUID_TO_BIN(?))`,
            [newBot.id, newBot.name, newBot.description, newBot.model, userId])

        // Subir los archivos a minio
        const dir = await fs.opendir(config.bots.pathRootData)

        for await (const dirent of dir) {
            if (dirent.isFile()) {
                await uploadFile(path.join(config.bots.pathRootData, dirent.name),
                    `bots/${newBot.id}/${dirent.name}`, false)
            }
        }

        // Responder al usuario
        const [BotDb] = await conn.query('SELECT BIN_TO_UUID(id) as id, createdAt, name, description, model FROM bots WHERE id = UUID_TO_BIN(?)', [newBot.id])

        res.json({
            error: false,
            data: (BotDb as Bot[])[0]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha occurrido un error al crear el bot'
        })
    }
}

export const updateBot = async (req: Request, res: Response): Promise<Response | void> => {
    const editBot: Bot = req.body || {}
    editBot.id = String(req.params.id)
    const userId = String(req.user?.id)

    try {
        // Validamos los campos
        const validateInputs = await botSchema.safeParseAsync(editBot)

        if (validateInputs.error) {
            return res.status(400).json({
                error: true,
                message: 'Error en el envio de datos',
                details: JSON.parse(validateInputs.error.message)
            })
        }

        // Validamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')

        // Validamos que el usuario no tenga un bot con el mismo nombre
        const [isNameExist] = await conn.query('SELECT BIN_TO_UUID(id) as id FROM bots WHERE LOWER(name) = LOWER(?) AND userId = UUID_TO_BIN(?)', [editBot.name, userId])

        if ((isNameExist as any[]).length > 1 || ((isNameExist as any[]).length == 1 && (isNameExist as any[])[0]?.id !== editBot.id)) {
            return res.status(422).json({
                error: true,
                message: 'Ya tienes un bot registrado con el mismo nombre'
            })
        }

        // Editamos el bot
        await conn.query('UPDATE bots SET name = ?,description = ?,model = ? WHERE id = UUID_TO_BIN(?)',
            [editBot.name, editBot.description, editBot.model, editBot.id])

        // Respondemos con el bot editado
        const [botBD] = await conn.query('SELECT BIN_TO_UUID(id) as id, createdAt, name, description, model FROM bots WHERE id = UUID_TO_BIN(?)', [editBot.id])

        res.json({
            error: false,
            data: (botBD as Bot[])[0]
        })
    } catch (err) {
        if ((err as any).code == 'ER_WRONG_VALUE_FOR_TYPE') {
            res.status(404).json({
                error: true,
                message: 'Bot no encontrado'
            })
        } else {
            console.error(err)
            res.status(500).json({
                error: true,
                message: 'Ha ocurrido un error al editar el bot'
            })
        }
    }
}

export const deleteBot = async (req: Request, res: Response): Promise<void> => {
    const botId = String(req.params.id)

    try {
        // Validamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')
        
        // Eliminamos los archivos de minio
        const listedFiles = await getFiles(`bots/${botId}`)

        if (!listedFiles.Contents || listedFiles.Contents.length == 0) throw new Error('No existe la carpeta en minio')
        
        for await (const Content of listedFiles.Contents) {
            await deleteFile(Content.Key || '')
        }

        // Eliminamos el bot de la Base de datos
        await conn.query('DELETE FROM bots WHERE id = UUID_TO_BIN(?)', [botId])

        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha ocurrido un error al eliminar el bot'
        })
    }
}

export const getListedFiles = async (req: Request, res: Response): Promise<void> => {
    const botId = String(req.params.id)

    try {
        const listedFiles = await getFiles(`bots/${botId}`)

        if (!listedFiles.Contents || listedFiles.Contents.length == 0) throw new Error('Error al recuperar la carpeta del bot')

        const data = listedFiles.Contents.map(file => {
            const { Key, LastModified, Size } = file
            const name = path.basename(Key || '')
            const ext = path.extname(name).replace('.', '') // Readme.md -> .md

            return {
                name,
                ext,
                lastModified: LastModified,
                size: Size
            }
        })

        res.json({
            error: false,
            data
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha ocurrido un error al recuperar los archivos'
        })
    }
}

export const getFile = async (req: Request, res: Response): Promise<void> => {
    const botId = String(req.params.id)
    const filename = String(req.params.filename)

    try {
       const file = await GetFile(`bots/${botId}/${filename}`)
       
       // Seteamos los headers
       if (path.extname(filename) == '') res.header('Content-Type', 'text/x-dockerfile; charset=utf-8')
       else if (path.extname(filename) == '.py') res.header('Content-Type', 'text/x-python; charset=utf-8')
       else res.header('Content-type', String(lookup(path.extname(filename))) + '; charset=utf-8')
    
       // Devolvemos el archivo
       if (file.Body) await pipeline(file.Body as NodeJS.ReadableStream, res)
       else throw new Error('No se pudo leer el archivo')
    } catch (err) {
        if ((err as any).message = 'The specified key does not exist.') {
            res.status(400).json({
                error: true,
                message: 'Archivo no encontrado'
            })
        } else {
            console.error(err)
            res.status(500).json({
                error: true,
                message: 'Ha ocurrido un error al recuperar el archivo'
            })
        }
    }
}

export const updateFile = async (req: Request, res: Response): Promise<Response | void> => {
    const botId = String(req.params.id)
    const filename = String(req.params.filename)
    const File:UploadedFile | UploadedFile[] | undefined = req.files?.file

    if (!File) {
        return res.status(400).json({
            error: true,
            message: 'Debe enviar un archivo'
        })
    } else if (Array.isArray(File)) {
        return res.status(400).json({
            error: true,
            message: 'Unicamente puede enviar un archivo'
        })
    } else if (path.extname(filename) != path.extname(File.name || '')) {
        return res.status(400).json({
            error: true,
            message: 'las extensiones no coinciden'
        })
    } else if (File.size > config.bots.maxFileSize) {
        return res.status(400).json({
            error: true,
            message: 'El archivo es demasiado grande'
        })
    }    

    try {
        const keyFile = `bots/${botId}/${filename}`
        const isFileExist = await isExistFile(keyFile)

        if (!isFileExist) {
            return res.status(400).json({
                error: true,
                message: 'No se ha encontrado el archivo'
            })
        }

        // Eliminar el archivo
        await deleteFile(keyFile)

        // Subir el nuevo archivo
        await uploadBufferFile(keyFile, File.data)

        res.json({
            error: false,
            data: {
                name: filename,
                ext: path.extname(filename).replace('.', ''),
                lastModified: new Date(),
                size: File.size
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha ocurrido un error al editar un archivo'
        })
    }
}
import { Request, Response } from 'express'
import deploySchema from '../zod/deploy.schema'
import { Deploy } from '../interfaces/Deploy.interface'
import { getConnection } from '../database'
import createDeployAsync from '../utils/createDeploy'

export const getDeploys = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Get deploys' })
}

export const getDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Get deploy' })
}

export const createDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    const newDeploy: Deploy = req.body

    try {
        // Validamos los campos
        const validateInputs = await deploySchema.safeParseAsync(newDeploy)

        if (validateInputs.error) {
            return res.status(400).json({
                error: true,
                message: 'Error en el envio de datos',
                datails: JSON.parse(validateInputs.error.message)
            })
        }

        // Validamos la conexion con la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')
        
        // Asignamos el botId
        newDeploy.botId = req.botId || ''

        if (!newDeploy.botId) throw new Error('Error en la ruta')

        // Verificamos que el bot no tenga un deploy con el mismo nombe
        const [ existingDeploy ] = await conn.query('SELECT COUNT(*) AS count FROM deploys WHERE LOWER(name) = LOWER(?) AND botId = UUID_TO_BIN(?)', [newDeploy.name, newDeploy.botId])

        if ((existingDeploy as any[])[0]?.count > 0) {
            return res.status(422).json({
                error: true,
                message: 'Ya tienes un deploy registrado con ese nombre en el bot'
            })
        }

        // Registramos el nuevo deploy
        const [ UUIDResult ] = await conn.query('SELECT UUID() as uuid')
        newDeploy.id = (UUIDResult as any[])[0].uuid

        await conn.query('INSERT INTO deploys (id, name, description, botId) VALUES (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?))', [ newDeploy.id, newDeploy.name, newDeploy.description, newDeploy.botId ])

        // Respondemos al usuario
        const [ deployDB ] = await conn.query('SELECT BIN_TO_UUID(id) AS id, createdAt, name, description, status, BIN_TO_UUID(botId) AS botId FROM deploys WHERE id = UUID_TO_BIN(?)', [newDeploy.id])
        const deploy = (deployDB as Deploy[])[0]
        if (!deploy) throw new Error('Deploy no encontrado despues de crearlo')

        createDeployAsync(deploy)
        res.status(202).json({
            error: false,
            data: deploy
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: 'Ha ocurrido un error al crear el deploy'
        })
    }
}

export const updateDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Update deploy' })
}

export const deleteDeploy = async (req: Request, res: Response): Promise<Response | void> => {
    res.json({ message: 'Delete deploy' })
}
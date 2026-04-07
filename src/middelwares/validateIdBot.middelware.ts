import { Request, Response, NextFunction } from 'express'
import { getConnection } from '../database'

const validateIdBot = async (req: Request, res: Response, next: NextFunction): Promise <Response | void> => {
    if (!req.params?.id) return next()

    const botId = String(req.params.id)
    const userId = String(req.user?.id)

    try {
        // Validamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')
        
        // Validamos que el bot exista y sea del usuario
        const [ isBotExist ] = await conn.query('SELECT BIN_TO_UUID(userId) as userId FROM bots WHERE id = UUID_TO_BIN(?)', [botId])

        if ((isBotExist as any[]).length !== 1 || (isBotExist as any[])[0].userId !== userId) {
            return res.status(404).json({
                error: true,
                message: 'Bot no encontrado'
            })
        }

        next()
    } catch (err) {
        if ((err as any).code == 'ER_WRONG_VALUE_FOR_TYPE') {
            res.status(404).json({
                error: true,
                message: 'Bot no encontrado'
            })
        } else {
            next()
        }
    }
}

export default validateIdBot
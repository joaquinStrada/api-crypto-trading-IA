import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../utils/config'
import { AccessToken, User } from '../interfaces/User.interface'
import { getConnection } from '../database'

const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const header = req.headers.authorization as string

    if (!header || (header && !header.startsWith('Bearer '))) {
        return res.status(401).json({
            error: true,
            message: 'Acceso denegado'
        })
    }

    const token = header.slice(7)

    try {
        const data = jwt.verify(token, config.jwt.accessTokenSecret) as AccessToken

        // Verificamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')
        
        // Verificar y Obtener la informacion del usuario
        const [ user ] = await conn.query('SELECT BIN_TO_UUID(id) as id, createdAt, fullname, email, imageBig, imageMedium, imageSmall FROM users WHERE id = UUID_TO_BIN(?)', [data.userId])

        if (!user || (user as any[]).length !== 1) throw new Error('Usuario no encontrado')
        
        // Seguir con la peticion
        req.user = user[0] as any
        next()
    } catch (err) {
        console.error(err)
        res.status(401).json({
            error: true,
            message: 'Acceso denegado'
        })
    }
}

export default validateToken
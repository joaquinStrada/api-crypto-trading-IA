import { Server } from 'socket.io'
import { CustomSocket, DataToken } from './interfaces/SockeIo.interface'
import jwt from 'jsonwebtoken'
import { config } from './utils/config'
import { getConnection } from './database'

let socketServer: Server | null = null

const authenticateSocket = async (socket: CustomSocket, next: (err?: Error) => void): Promise<void> => {
    const token = String(socket.handshake.auth?.token || '')

    if (!token) {
        console.error(new Error('Token no proporcionado'))
        return next(new Error('Acceso denegado'))
    }

    try {
        const { userId } = jwt.verify(token, config.jwt.accessTokenSecret) as DataToken

        // Verificamos la conexion a la BD
        const conn = getConnection()

        if (!conn) throw new Error('Error al conectarse a la BD')
        
        // Validamos que el usuario exista
        const [ isUserExist ] = await conn.query('SELECT COUNT(*) as count FROM users WHERE id = UUid_TO_BIN(?)', [userId]) as [{ count: number }[], any]

        if (isUserExist[0]?.count !== 1) throw new Error('Usuario no encontrado')
        
        // Authorizamos al cliente
        socket.data.userId = userId
        socket.data.botId = null
        next()
    } catch (err) {
        console.error(err)
        next(new Error('Acceso denegado'))
    }
}

export const configServer = (io: Server): void => {
  socketServer = io

  socketServer.use(authenticateSocket)

  socketServer.on('connection', (socket: CustomSocket): void => {
    console.log('Nuevo cliente conectado con el id', socket.id)
    socket.data?.userId && socket.join(socket.data?.userId) // Unimos al cliente a una sala con su userId para enviarle mensajes personalizados
    console.log('Cliente añadido a la sala', socket.data?.userId)
  })
}
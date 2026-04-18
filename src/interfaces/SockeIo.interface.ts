import { Socket } from 'socket.io'

export interface DataToken {
    userId: string,
    iat: number,
    exp: number
}

export interface DataSocket {
    userId?: string,
    botId?: string | null
}

export interface CustomSocket extends Socket {
    data: DataSocket
} 
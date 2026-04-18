import '@babel/polyfill'
import { createConnection } from './database'
import app from './app'
import { Server as WebSocketServer } from 'socket.io'
import { createServer } from 'http'
import { configServer } from './SocketIo'

createConnection()

const server = createServer(app)
const httpServer = server.listen(app.get('port'))
const io = new WebSocketServer(httpServer, {
    cors: {
        origin: '*',
        credentials: true
    }
})

console.log('Server on port', app.get('port'))

configServer(io)
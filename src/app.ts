import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { config } from './utils/config'

import userRouter from './routes/user.routes'
import botRouter from './routes/bot.routes'
import validateToken from './middelwares/validateToken.middelware'

// Swagger
import swaggerUI from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import { options } from './utils/swaggerOptions'

const app = express()

// Settings
app.set('port', config.express.port)

// Middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
    origin: config.express.host,
    credentials: true
}))

// Routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/bots', validateToken, botRouter)

// Config swagger
const specs = swaggerJsDoc(options)
app.use('/api', swaggerUI.serve, swaggerUI.setup(specs))

export default app
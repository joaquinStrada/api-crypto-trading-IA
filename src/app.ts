import express from 'express'
import morgan from 'morgan'
import { config } from './utils/config'

import userRouter from './routes/user.routes'

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

// Routes
app.use('/api/v1/users', userRouter)

// Config swagger
const specs = swaggerJsDoc(options)
app.use('/api', swaggerUI.serve, swaggerUI.setup(specs))

export default app
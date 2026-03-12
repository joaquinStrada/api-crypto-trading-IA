import express from 'express'
import morgan from 'morgan'
import { config } from './utils/config'

import userRouter from './routes/user.routes'

const app = express()

// Settings
app.set('port', config.express.port)

// Middlewares
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api/v1/users', userRouter)

export default app
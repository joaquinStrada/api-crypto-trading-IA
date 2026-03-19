import path from 'path'
import fs from 'fs'
import { config } from './config'

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'))

export const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Crypto Trading API',
            description: packageJson.description,
            version: packageJson.version
        },
        servers: [
            {
                url: config.express.host
            }
        ]
    },
    apis: ['./src/routes/*.ts']
}

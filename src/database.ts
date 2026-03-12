import mysql, { Connection } from 'mysql2/promise'
import { config } from './utils/config'

let conn: Connection | null = null;

export const createConnection = async (): Promise<boolean> => {
    try {
        conn = await mysql.createConnection(config.database)
        console.log('DB is connecting to', config.database.host)
        return true
    } catch (err) {
        console.error(err)
        return false
    }
}

export const getConnection = (): Connection | null => conn ? conn : null 
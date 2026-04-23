import { Deploy } from '../interfaces/Deploy.interface'
import fs from 'fs/promises'
import path from 'path'
import { getConnection } from '../database'
import { getFile, getFiles } from './minio'

const createDeploy = async (deployDB: Deploy): Promise<void> => {
    const conn = getConnection()

    if (!conn) {
        console.error(new Error('Error al conectarse a la BD'))
        return
    }
    
    
    try {
        
    } catch (err) {
        console.error(err)
        await conn.query('UPDATE deploys SET status = ? WHERE id = UUID_TO_BIN(?)', ['error', deployDB.id])
    }
}

export default createDeploy
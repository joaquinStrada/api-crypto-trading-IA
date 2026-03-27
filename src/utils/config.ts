import { config as dotenv } from 'dotenv'
import { resolve } from 'path'
dotenv()

export const config = {
    express: {
        host: process.env.HOST || `http://localhost:${process.env.PORT || 3000}`,
        port: process.env.PORT || 3000,
        secure: Boolean(process.env.SECURE) || false,
        sameSite: (process.env.SAME_SITE as 'lax' | 'strict' | 'none' | undefined) || 'lax'
    },
    imageProfiles: {
        allowedExtensionImages: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
        maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    },
    database: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'myapp',
    },
    minio: {
        endPoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
        region: process.env.MINIO_REGION || 'us-east-1',
        accessKey: process.env.MINIO_ACCESS_KEY || '',
        secretKey: process.env.MINIO_SECRET_KEY || '',
        bucketName: process.env.MINIO_BUCKET_NAME || ''
    },
    bots: {
        pathRootData: process.env.PATH_ROOT_DATA || resolve('data')
    },
    jwt: {
        accessTokenSecret: (process.env.JWT_ACCESS_TOKEN_SECRET || '') as string,
        refreshTokenSecret: (process.env.JWT_REFRESH_TOKEN_SECRET || '') as string,
        accessTokenExpiration: (process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m') as string,
        refreshTokenExpiration: (process.env.JWT_REFRESH_TOKEN_EXPIRATION || '30d') as string,
        refreshTokenExpirationNoRemember: (process.env.JWT_REFRESH_TOKEN_EXPIRATION_NO_REMEMBER || '1d') as string
    }
}
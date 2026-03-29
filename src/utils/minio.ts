import { S3Client, GetObjectCommand, PutObjectCommand, 
    ServiceOutputTypes, GetObjectCommandOutput, DeleteObjectCommand, 
    ListObjectsCommand, ListObjectsCommandOutput } from '@aws-sdk/client-s3'
import fs from 'fs'
import { config } from './config'

const Client = new S3Client({
    endpoint: config.minio.endPoint,
    region: config.minio.region,
    forcePathStyle: true,
    credentials: {
        accessKeyId: config.minio.accessKey,
        secretAccessKey: config.minio.secretKey
    }
})

export const uploadFile = async (pathFile: string, keyFile: string, deleteFileLocal: boolean = true): Promise<ServiceOutputTypes> => {
    const command = new GetObjectCommand({
        Bucket: config.minio.bucketName,
        Key: keyFile
    })

    return new Promise((res, rej) => {
        Client.send(command)
            .then(() => rej(new Error(`El archivo ${keyFile} ya existe en el bucket`)))
            .catch(async () => {
                try {
                  const stream = fs.createReadStream(pathFile)
                  const uploadCommand = new PutObjectCommand({
                    Bucket: config.minio.bucketName,
                    Key: keyFile,
                    Body: stream
                  })

                  const result = await Client.send(uploadCommand)

                  if (deleteFileLocal) await fs.promises.unlink(pathFile)
                  res(result)
                } catch (err) {
                    rej(err)
                }
            })
    })
}

export const getFile = async (keyFile: string): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
        Bucket: config.minio.bucketName,
        Key: keyFile
    })

    return await Client.send(command)
}

export const deleteFile = async (keyFile: string): Promise<ServiceOutputTypes> => {
    const command = new DeleteObjectCommand({
        Bucket: config.minio.bucketName,
        Key: keyFile
    })

    return await Client.send(command)
}

export const getFiles = async (prefix: string): Promise<ListObjectsCommandOutput> => {
    const command = new ListObjectsCommand({
        Bucket: config.minio.bucketName,
        Prefix: prefix
    })

    return await Client.send(command)
}
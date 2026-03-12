import { UploadedFile } from 'express-fileupload'

export interface ImageConfig {
    allowedExtensionImages: string[],
    maxFileSize: number
}

export interface ProfileImage {
    image?: UploadedFile
}

export interface User {
    id?: string,
    createdAt?: Date,
    fullname: string,
    email: string,
    password: string,
    imageBig?: string | null,
    imageMedium?: string | null,
    imageSmall?: string | null
}
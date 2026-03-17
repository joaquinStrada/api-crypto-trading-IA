import { Request, Response, NextFunction } from 'express'
import { ImageConfig, ProfileImage } from '../interfaces/User.interface'
import path from 'path'

const validateProfile = (config: ImageConfig, req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.files?.image) {
        next()
        return
    }
    
    const { image } = req.files as ProfileImage

    // Validar si el archivo es una imagen
    const ext = path.extname(image?.name || '').replace('.', '') // .jpg | .png

    if (!config.allowedExtensionImages.includes(ext)) {
        return res.status(400).json({
            error: true,
            message: 'Extension no permitida'
        })
    }

    // Validar el tamaño del archivo
    if (image && image.size > config.maxFileSize) {
        return res.status(400).json({
            error: true,
            message: 'La imagen es demasiado grande'
        })
    }

    next()
}

export default validateProfile
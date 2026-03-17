import { Router, urlencoded } from 'express'
import fileUpload from 'express-fileupload'
import { config } from '../utils/config'
import { login, refresh, register, getUser, getProfileImage, editUser, logout } from '../controllers/user.controller'
import validateProfile from '../middelwares/validateProfile.middelware'
import validateToken from '../middelwares/validateToken.middelware'
import cookieParser from 'cookie-parser'

const router = Router()

router.use(cookieParser())

router.post('/login', login)

router.post('/register', 
    urlencoded({ extended: false }),
    fileUpload(),
    (req, res, next) => validateProfile(config.imageProfiles, req, res, next),
    register)

router.get('/refresh', refresh)

router.get('/', validateToken, getUser)

router.get('/image/:imageName',validateToken, getProfileImage)

router.put('/',
    validateToken,
    urlencoded({ extended: false}),
    fileUpload(),
    (req, res, next) => validateProfile(config.imageProfiles, req, res, next),
    editUser)

router.get('/logout', logout)

export default router
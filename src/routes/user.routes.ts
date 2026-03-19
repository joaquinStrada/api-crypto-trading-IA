import { Router, urlencoded } from 'express'
import fileUpload from 'express-fileupload'
import { config } from '../utils/config'
import { login, refresh, register, getUser, getProfileImage, editUser, logout } from '../controllers/user.controller'
import validateProfile from '../middelwares/validateProfile.middelware'
import validateToken from '../middelwares/validateToken.middelware'
import cookieParser from 'cookie-parser'

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Gestion de usuarios y authenticacion
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ResponseToken:
 *       type: object
 *       summary: El token de authenticacion
 *       properties:
 *         error:
 *           type: boolean
 *           description: Si la api devuelve un error o no
 *           required: true
 *           example: false
 *         data:
 *           type: object
 *           summary: Los datos que devuelve la api
 *           required: true
 *           properties:
 *             accessToken:
 *               type: string
 *               description: El token de acceso
 *               required: true
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzE2NWU5NS0xZGM4LTExZjEtOWEyNS0wODAwMjdjZDM1NmEiLCJpYXQiOjE3NzM4ODY5NjAsImV4cCI6MTc3Mzg4Nzg2MH0._w-7i6h7i9UdJS8VUIADSJLMO5GdLyRmuT3UFb7sctU
 *             expiressInAccessToken:
 *               type: integer
 *               description: El tiempo de expiracion del token de acceso
 *               required: true
 *               example: 900000
 *             expiressInRefreshToken:
 *               type: integer
 *               description: el tiempo de expiracion del token de actualizacion
 *               required: false
 *               example: 2592000000
 */

const router = Router()

router.use(cookieParser())

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Iniciar sesion
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             summary: Los campos necesarios para poder iniciar session
 *             properties:
 *               email:
 *                 type: string
 *                 summary: El email del usuario
 *                 required: true
 *                 example: joaquinstrada@hotmail.com.ar
 *               password:
 *                 type: string
 *                 summary: El password del usuario
 *                 example: ""
 *                 required: true
 *               remember:
 *                 type: boolean
 *                 summary: Si queremos recordar al usuario o no
 *                 required: true
 *                 example: true
 *     responses:
 *       200:
 *         description : Usuario authenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseToken'
 *       400:
 *         description: Credenciales invalidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: Credenciales invalidas
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al authenticar al usuario
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Error al authenticar al usuario
 */
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
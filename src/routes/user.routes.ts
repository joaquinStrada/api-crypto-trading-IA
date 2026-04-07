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
 *     UserInputs:
 *       type: object
 *       summary: Los campos para poder gestionar al usuario
 *       properties:
 *         fullname:
 *           type: string
 *           description: El nombre completo del usuario
 *           required: true
 *           example: Joaquin Strada
 *         email:
 *           type: string
 *           description: El email del usuario
 *           required: true
 *           example: joaquinstrada@hotmail.com.ar
 *         password:
 *           type: string
 *           description: El password del usuario
 *           required: true
 *           example: ""
 *         image:
 *           type: file
 *           description: La imagen de perfil del usuario
 *           required: false
 *     ErrorInputsUser:
 *       type: object
 *       summary: Error en el envio de datos
 *       properties:
 *         error:
 *           type: boolean
 *           description: Si la api devuelve un error o no
 *           required: true
 *           example: true
 *         message:
 *           type: string
 *           description: El mensaje que devuelve la api
 *           required: true
 *           example: Error en el envio de datos
 *         details:
 *           type: array
 *           description: Los detalles del error
 *           required: true
 *           items:
 *             $ref: '#/components/schemas/ErrorDetailUser'
 *     ErrorDetailUser:
 *       type: object
 *       summary: Detalles del error en el envio de datos
 *       properties:
 *         origin:
 *           type: string
 *           description: El tipo de campo que genero el error
 *           required: true
 *           example: string
 *         code:
 *           type: string
 *           description: El codigo de error
 *           required: true
 *           example: too_small
 *         minimum:
 *           type: integer
 *           description: la minima longitud del campo
 *           required: true
 *           example: 6
 *         inclusive:
 *          type: boolean
 *          description: Si el campo es requerido o no
 *          required: true
 *          example: true
 *         path:
 *           type: array
 *           description: El path del campo
 *           required: true
 *           items:
 *             type: string
 *             description: El nombre del campo
 *             required: true
 *             example: fullname
 *         message:
 *           type: string
 *           description: El mensaje de error del campo
 *           required: true
 *           example: El nombre completo debe tener al menos 6 caracteres
 *     EmailExist:
 *       type: object
 *       summary: El email ya esta registrado
 *       properties:
 *         error:
 *           type: boolean
 *           description: Si la api devuelve un error o no
 *           required: true
 *           example: true
 *         message:
 *           type: string
 *           description: El mensaje que devuelve la api
 *           required: true
 *           example: El email ya está registrado
 *     AccessDenied:
 *       type: object
 *       summary: Acceso denegado
 *       properties:
 *         error:
 *           type: boolean
 *           description: Si la api devuelve un error o no
 *           required: true
 *           example: true
 *         message:
 *           type: string
 *           description: El mensaje que devuelve la api
 *           required: true
 *           example: Acceso denegado
 *     User:
 *       type: object
 *       summary: La respuesta con la informacion del usuario
 *       properties:
 *         error:
 *           type: boolean
 *           description: Si la api devuelve un error o no
 *           required: true
 *           example: true
 *         data:
 *           type: object
 *           summary: La informacion del usuario
 *           required: true
 *           properties:
 *             id:
 *               type: string
 *               description: El id del usuario
 *               required: true
 *               example: 7c165e95-1dc8-11f1-9a25-080027cd356a
 *             createdAt:
 *               type: string
 *               description: Fecha y hora de creacion del usuario
 *               required: true
 *               example: 2026-03-12T04:04:04.000Z
 *             fullname:
 *               type: string
 *               description: El nombre completo del usuario
 *               required: true
 *               example: Joaquin Strada
 *             email:
 *               type: string
 *               description: El email del usuario
 *               required: true
 *               example: joaquinstrada@hotmail.com.ar
 *             imageBig:
 *               type: string
 *               description: El nopmbre de la imagen grande del usuario
 *               required: true
 *               example: big_7c165e95-1dc8-11f1-9a25-080027cd356a.png
 *             imageMedium:
 *               type: string
 *               description: El nopmbre de la imagen mediana del usuario
 *               required: true
 *               example: medium_7c165e95-1dc8-11f1-9a25-080027cd356a.png
 *             imageSmall:
 *               type: string
 *               description: El nopmbre de la imagen pequeña del usuario
 *               required: true
 *               example: small_7c165e95-1dc8-11f1-9a25-080027cd356a.png
 *   parameters:
 *     Authorization:
 *      in: header
 *      name: Authorization
 *      description: El header Authorization debe contener el token de acceso en el formato Bearer {token}
 *      required: true
 *      schema:
 *        type: string
 *        example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzE2NWU5NS0xZGM4LTExZjEtOWEyNS0wODAwMjdjZDM1NmEiLCJpYXQiOjE3NzM2ODAyODUsImV4cCI6MTc3MzY4MTE4NX0.D37Sa7hQrY26ctdsN9_biuGASAox0M1KZTX9TGWSwVc
 */

const router = Router()

router.use(cookieParser())

/**
 * @swagger
 * /api/v1/users/login:
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

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [User]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserInputs'
 *     responses:
 *       200:
 *         description: Usuario authenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseToken'
 *       400:
 *         description: Error en el envio de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorInputsUser'
 *       422:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailExist'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al registrar el usuario
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
 *                   example: Error al registrar el usuario
 */
router.post('/register', 
    urlencoded({ extended: false }),
    fileUpload(),
    (req, res, next) => validateProfile(config.imageProfiles, req, res, next),
    register)

/**
 * @swagger
 * /api/v1/users/refresh:
 *   get:
 *    summary: Actualizar los tokens
 *    tags: [User]
 *    responses:
 *      200:
 *       description: Tokens actualizados
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/ResponseToken'
 *      401:
 *        description: Acceso denegado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AccessDenied'
 */
router.get('/refresh', refresh)

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *    summary: Obtener al usuario authenticado 
 *    tags: [User]
 *    parameters:
 *      - $ref: '#/components/parameters/Authorization'
 *    responses:
 *      200:
 *        description: Informacion del usuario
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        description: Acceso denegado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AccessDenied' 
 */
router.get('/', validateToken, getUser)

/**
 * @swagger
 * /api/v1/users/image/{imageName}:
 *   get:
 *     summary: La foto de perfil del usuario
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: imageName
 *         description: El nombre de la foto de perfil
 *         required: true
 *         schema:
 *           type: string
 *           example: big_7c165e95-1dc8-11f1-9a25-080027cd356a.png
 *       - $ref: '#/components/parameters/Authorization'
 *     responses:
 *       200:
 *         description: La foto de perfil
 *         content:
 *           image/jpg:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *           image/jpeg:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *           image/png:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *           image/gif:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *           image/bmp:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *           image/webp:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *           image/svg+xml:
 *             schema:
 *               type: binary
 *               description: Foto de perfil
 *               required: true
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       404:
 *         description: Imagen no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: Imagen no encontrada
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
 *                   example: La imagen no existe
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al recuperar la imagen
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
 *                   example: Error al recuperar la imagen
 */
router.get('/image/:imageName', validateToken, getProfileImage)

/**
 * @swagger
 * /api/v1/users:
 *   put:
 *     summary: Editar usuario
 *     tags: [User]
 *     parameters:
 *       - $ref: '#/components/parameters/Authorization'
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserInputs'
 *     responses:
 *       200:
 *        description: Informacion del usuario actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *       400:
 *         description: Error en el envio de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorInputsUser'
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       422:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailExist'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al editar el usuario
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
 *                   example: Error al editar el usuario
 */
router.put('/',
    validateToken,
    urlencoded({ extended: false}),
    fileUpload(),
    (req, res, next) => validateProfile(config.imageProfiles, req, res, next),
    editUser)

/**
 * @swagger
 * /api/v1/users/logout:
 *   get:
 *     summary: Cerrar session
 *     tags: [User]
 *     responses:
 *       204:
 *         description: Cerrada la session del usuario
 */
router.get('/logout', logout)

export default router
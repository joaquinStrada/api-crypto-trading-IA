import { Router, urlencoded } from 'express'
import fileUpload from 'express-fileupload'
import { getBots, getBot, createBot, updateBot, deleteBot, getListedFiles, getFile, updateFile } from '../controllers/bot.controller'
import validateIdBot from '../middelwares/validateIdBot.middelware'

/**
 * @swagger
 * tags:
 *   name: Bots
 *   description: Gestion de bots
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Bot:
 *       type: object
 *       summary: El bot que nos devuelve la BD
 *       properties:
 *         id:
 *           type: string
 *           description: El id del bot
 *           required: true
 *           example: 1fa40799-2d53-11f1-b2d7-080027cd356a
 *         createdAt:
 *           type: string
 *           description: La fecha y hora de creacion del bot
 *           required: true
 *           example: 2026-03-31T22:44:06.000Z
 *         name:
 *           type: string
 *           description: El nombre del bot
 *           required: true
 *           example: Bot de apple
 *         description:
 *           type: string
 *           description: La descripcion del bot
 *           required: true
 *           example: Este es un bot de traiding para apple
 *         model:
 *           type: string
 *           description: El modelo de IA que usa el bot para el chat
 *           required: true
 *           example: llama-3.1-8b-instant
 *         deployId:
 *           type: string
 *           description: El ultimo deploy que se hizo en el bot
 *           required: true
 *           example: null
 *     BotNotFound:
 *       type: object
 *       summary: Bot no encontrado
 *       properties:
 *         error:
 *           type: boolean
 *           description: El error que devuelve la api
 *           required: true
 *           example: true
 *         message:
 *           type: string
 *           description: El mensaje que devuelve la api
 *           required: true
 *           example: Bot no encontrado
 *     BotInput:
 *       type: object
 *       summary: Los campos del bot
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre del bot
 *           required: true
 *           example: Bot de bitcoin
 *         description:
 *           type: string
 *           description: La descripcion del bot
 *           required: true
 *           example: Este es un bot de traiding para bitcoin
 *         model:
 *           type: string
 *           description: El modelo de IA que usa el bot para el chat
 *           required: true
 *           example: llama-3.1-8b-instant
 *     ErrorInputsBots:
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
 *             $ref: '#/components/schemas/ErrorDetailBots'
 *     ErrorDetailBots:
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
 *             example: name
 *         message:
 *           type: string
 *           description: El mensaje de error del campo
 *           required: true
 *           example: El nombre completo debe tener al menos 6 caracteres
 *     IsNameExist:
 *       type: object
 *       summary: Ya tienes un bot registrado con el mismo nombre
 *       properties:
 *         error:
 *           type: boolean
 *           description: Indica si hubo un error o no
 *           required: true
 *           example: true
 *         message:
 *           type: string
 *           description: el mensaje que devuelve la api
 *           required: true
 *           example: Ya tienes un bot registrado con el mismo nombre
 *     FileProperties:
 *       type: object
 *       summary: Las propiedades de un archivo
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre del archivo
 *           required: true
 *           example: DockerFile
 *         ext:
 *           type: string
 *           description: La extension del archivo
 *           required: true
 *           example: ""
 *         lastModified:
 *           type: string
 *           description: La ultima modificacion del archivo
 *           required: true
 *           example: 2026-03-31T22:44:06.972Z
 *         size:
 *           type: number
 *           description: El tamaño del archivo en bytes
 *           required: true
 *           example: 164
 *     FileNotFound:
 *       type: object
 *       summary: Archivo no encontrado
 *       properties:
 *         error:
 *           type: boolean
 *           description: indica si la api devuelve un error o no
 *           required: true
 *           example: true
 *         message:
 *           type: string
 *           description: El mensaje que devuelve la api
 *           required: true
 *           example: Archivo no encontrado
 *   parameters:
 *     IdBot:
 *       in: path
 *       name: idBot
 *       description: El id del bot a consultar
 *       required: true
 *       schema:
 *         type: string
 *         example: 1fa40799-2d53-11f1-b2d7-080027cd356a
 *     Filename:
 *       in: path
 *       name: filename
 *       description: El nombre del archivo a consultar
 *       required: true
 *       schema:
 *         type: string
 *         example: DockerFile
 */
const router = Router()

/**
 * @swagger
 * /api/v1/bots:
 *   get:
 *     summary: Obtener todos los bots
 *     tags: [Bots]
 *     parameters:
 *       - $ref: '#/components/parameters/Authorization'
 *     responses:
 *       200:
 *         description: La lista de bots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: La lista de bots
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indica si hubo error o no
 *                   required: true
 *                   example: false
 *                 count:
 *                   type: integer
 *                   description: La cantidad de bots que tiene registrado el usuario
 *                   required: true
 *                   example: 1
 *                 data:
 *                   type: array
 *                   description: La lista de bots
 *                   required: true
 *                   items:
 *                     $ref: '#/components/schemas/Bot'
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al recuperar los bots
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Ha ocurrido un error al recuperar los bots
 */
router.get('/', getBots)

/**
 * @swagger
 * /api/v1/bots/{idBot}:
 *   get:
 *     summary: Obtener un bot
 *     tags: [Bots]
 *     parameters:
 *       - $ref: '#/components/parameters/idBot'
 *       - $ref: '#/components/parameters/Authorization'
 *     responses:
 *       200:
 *         description: El bot consultado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Si la api devuelve un error o no
 *                   required: true
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/Bot'
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       404:
 *         description: Bot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotNotFound' 
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al recuperar el bot
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Ha ocurrido un error al recuperar el bot
 */
router.get('/:id', validateIdBot, getBot)

/**
 * @swagger
 * /api/v1/bots:
 *   post:
 *     summary: Registrar un nuevo bot
 *     tags: [Bots]
 *     parameters:
 *       - $ref: '#/components/parameters/Authorization'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BotInput'
 *     responses:
 *       200:
 *         description: Bot registrado satisfactoriamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: El bot registrado
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indica si la api devuelve un error o no
 *                   required: true
 *                   example: false
 *                 data:
 *                   $ref: '#/components/schemas/Bot'
 *       400:
 *         description: Error en el envio de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorInputsBots'
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       422:
 *         description: Nombre de bot ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IsNameExist'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al crear el bot
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Ha occurrido un error al crear el bot
 */
router.post('/', createBot)

/**
 * @swagger
 * /api/v1/bots/{idBot}:
 *   put:
 *     summary: Editar un bot
 *     tags: [Bots]
 *     parameters:
 *       - $ref: '#/components/parameters/IdBot'
 *       - $ref: '#/components/parameters/Authorization'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BotInput'
 *     responses:
 *       200:
 *         description: El bot editado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: El bot editado
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Bot'
 *       400:
 *         description: Error en el envio de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorInputsBots'
 *       401:
 *         description: Acceso Denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       404:
 *         description: Bot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotNotFound'
 *       422:
 *         description: Nombre de bot ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IsNameExist'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al editar el bot
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Ha ocurrido un error al editar el bot
 */
router.put('/:id', validateIdBot, updateBot)

/**
 * @swagger
 * /api/v1/bots/{idBot}:
 *   delete:
 *     summary: Eliminar un bot
 *     tags: [Bots]
 *     parameters:
 *       - $ref: '#/components/parameters/idBot'
 *       - $ref: '#/components/parameters/Authorization'
 *     responses:
 *       204:
 *         description: Bot eliminado satisfactoriamente
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       404:
 *         description: Bot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al eliminar el bot
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Ha ocurrido un error al eliminar el bot
 */
router.delete('/:id', validateIdBot, deleteBot)

/**
 * @swagger
 * /api/v1/bots/{idBot}/files:
 *   get:
 *     summary: Obtener la lista de archivos de un bot
 *     tags: [Bots]
 *     parameters:
 *       - $ref: '#/components/parameters/IdBot'
 *       - $ref: '#/components/parameters/Authorization'
 *     responses:
 *       200:
 *         description: La lista de archivos del bot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: La lista de archivos del bot
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indica si la api devuelve un error o no
 *                   required: true
 *                   example: false
 *                 data:
 *                   type: array
 *                   description: La lista de archivos
 *                   required: true
 *                   items:
 *                     $ref: '#/components/schemas/FileProperties'
 *                   example: [{"name": "DockerFile","ext": "","lastModified": "2026-03-31T22:44:06.972Z","size": 164},{"name": "README.md","ext": "md","lastModified": "2026-03-31T22:44:06.408Z","size": 0},{"name": "chat.json","ext": "json","lastModified": "2026-04-02T03:57:19.107Z","size": 521},{"name": "main.py","ext": "py","lastModified": "2026-03-31T22:44:07.390Z","size": 0},{"name": "requirements.txt","ext": "txt","lastModified": "2026-03-31T22:44:06.716Z","size": 0}]
 *       401:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccessDenied'
 *       404:
 *         description: Bot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               summary: error del servidor al editar el bot
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: indica si la api devuelve un error o no
 *                   required: true
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: El mensaje que devuelve la api
 *                   required: true
 *                   example: Ha ocurrido un error al recuperar los archivos
 */
router.get('/:id/files', validateIdBot, getListedFiles)

/**
 * @swagger
 * /api/v1/bots/{idBot}/files/{filename}:
 *   get:
 *    summary: Obtener un archivo del bot
 *    tags: [Bots]
 *    parameters:
 *      - $ref: '#/components/parameters/IdBot'
 *      - $ref: '#/components/parameters/Filename'
 *      - $ref: '#/components/parameters/Authorization'
 *    responses:
 *      200:
 *        description: El archivo solicitado
 *        content:
 *          text/x-dockerfile; charset=utf-8:
 *            schema:
 *              type: string
 *              format: binary
 *              description: El archivo solicitado
 *              required: true
 *              example: "FROM python:3.8-slim-buster\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD [\"python\", \"main.py\"]"
 *          application/json; charset=utf-8:
 *            type: string
 *            format: binary
 *            description: El archivo solicitado
 *            required: true
 *            example: [{"role": "system","content": "Tu eres un asistente diseñado para crear bots de traiding en python, ten en cuenta que tus usuarios son especialistas en programacion y/o trading, y tu tarea sera guiarlos en la creacion de bots de trading rentables, tu objetivo principal es el de generar el codigo para los usuarios teniendo en cuenta que te pagaran 500 USD por programarles un bot de traiding. Los usuarios usan el chat a nivel personal no para rendir cuentas a una empresa en particular."}]
 *          text/plain; charset=utf-8:
 *            type: string
 *            format: binary
 *            description: El archivo solicitado
 *            required: true
 *            example: ""
 *          text/markdown; charset=utf-8:
 *            type: string
 *            format: binary
 *            description: El archivo solicitado
 *            required: true
 *            example: ""
 *          text/x-python; charset=utf-8:
 *            type: string
 *            format: binary
 *            description: El archivo solicitado
 *            required: true
 *            example: ""
 *      400:
 *        description: Archivo no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FileNotFound'
 *      401:
 *        description: Acceso denegado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AccessDenied'
 *      404:
 *        description: Bot no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BotNotFound'
 *      500:
 *        description: Error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              summary: error del servidor al editar el bot
 *              properties:
 *                error:
 *                  type: boolean
 *                  description: indica si la api devuelve un error o no
 *                  required: true
 *                  example: true
 *                message:
 *                  type: string
 *                  description: El mensaje que devuelve la api
 *                  required: true
 *                  example: Ha ocurrido un error al recuperar el archivo
 */
router.get('/:id/files/:filename', validateIdBot, getFile)

/**
 * @swagger
 * /api/v1/bots/{idBot}/files/{filename}:
 *   put:
 *    summary: Editar un archivo del bot
 *    tags: [Bots]
 *    parameters:
 *      - $ref: '#/components/parameters/IdBot'
 *      - $ref: '#/components/parameters/Filename'
 *      - $ref: '#/components/parameters/Authorization'
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            summary: El nuevo archivo
 *            properties:
 *              file:
 *                type: file
 *                description: El archivo a enviar
 *                required: true
 *    responses:
 *      200:
 *        description: Archivo editado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              summary: Las propiedades del archivo editado
 *              properties:
 *                error:
 *                  type: boolean
 *                  description: Indica si hubo un error o no
 *                  required: true
 *                  example: false
 *                data:
 *                  $ref: '#/components/schemas/FileProperties'
 *      400:
 *        description: Error en el envio de datos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FileNotFound'
 *      401:
 *        description: Acceso denegado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AccessDenied'
 *      404:
 *        description: Bot no encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BotNotFound'
 *      500:
 *        description: Error del servidor
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              summary: error del servidor al editar el bot
 *              properties:
 *                error:
 *                  type: boolean
 *                  description: indica si la api devuelve un error o no
 *                  required: true
 *                  example: true
 *                message:
 *                  type: string
 *                  description: El mensaje que devuelve la api
 *                  required: true
 *                  example: Ha ocurrido un error al editar un archivo
 */
router.put('/:id/files/:filename', validateIdBot, 
    urlencoded({ extended: false }), fileUpload(), updateFile)

export default router
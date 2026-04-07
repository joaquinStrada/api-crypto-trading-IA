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
 *       summary: Yas tienes un bot registrado con el mismo nombre
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
 *   parameters:
 *     IdBot:
 *       in: path
 *       name: idBot
 *       description: El id del bot a consultar
 *       required: true
 *       schema:
 *         type: string
 *         example: 1fa40799-2d53-11f1-b2d7-080027cd356a
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
 *       - $ref: '#/components/parameters/idBot'
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

router.get('/:id/files', validateIdBot, getListedFiles)

router.get('/:id/files/:filename', validateIdBot, getFile)

router.put('/:id/files/:filename', validateIdBot, urlencoded({ extended: false }), fileUpload(), updateFile)

export default router
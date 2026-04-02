import { Router, urlencoded } from 'express'
import fileUpload from 'express-fileupload'
import { getBots, getBot, createBot, updateBot, deleteBot, getListedFiles, getFile, updateFile } from '../controllers/bot.controller'
import validateIdBot from '../middelwares/validateIdBot.middelware'

const router = Router()

router.get('/', getBots)

router.get('/:id', validateIdBot, getBot)

router.post('/', createBot)

router.put('/:id', validateIdBot, updateBot)

router.delete('/:id', validateIdBot, deleteBot)

router.get('/:id/files', validateIdBot, getListedFiles)

router.get('/:id/files/:filename', validateIdBot, getFile)

router.put('/:id/files/:filename', validateIdBot, urlencoded({ extended: false }), fileUpload(), updateFile)

export default router
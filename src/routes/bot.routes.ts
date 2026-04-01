import { Router } from 'express'
import { getBots, getBot, createBot, updateBot, deleteBot, getListedFiles, getFile } from '../controllers/bot.controller'
import validateIdBot from '../middelwares/validateIdBot.middelware'

const router = Router()

router.get('/', getBots)

router.get('/:id', validateIdBot, getBot)

router.post('/', createBot)

router.put('/:id', validateIdBot, updateBot)

router.delete('/:id', validateIdBot, deleteBot)

router.get('/:id/files', validateIdBot, getListedFiles)

router.get('/:id/files/:filename', validateIdBot, getFile)

export default router
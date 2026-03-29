import { Router } from 'express'
import { getBots, getBot, createBot, updateBot, deleteBot } from '../controllers/bot.controller'
import validateIdBot from '../middelwares/validateIdBot.middelware'

const router = Router()

router.get('/', getBots)

router.get('/:id', validateIdBot, getBot)

router.post('/', createBot)

router.put('/:id', validateIdBot, updateBot)

router.delete('/:id', validateIdBot, deleteBot)

export default router
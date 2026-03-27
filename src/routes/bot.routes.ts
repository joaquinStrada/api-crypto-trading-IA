import { Router } from 'express'
import { getBots, getBot, createBot, updateBot, deleteBot } from '../controllers/bot.controller'

const router = Router()

router.get('/', getBots)

router.get('/:id', getBot)

router.post('/', createBot)

router.put('/:id', updateBot)

router.delete('/:id', deleteBot)

export default router
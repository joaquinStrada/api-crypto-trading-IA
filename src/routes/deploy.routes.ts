import { Router } from 'express'
import { getDeploys, getDeploy, createDeploy, updateDeploy, deleteDeploy } from '../controllers/deploy.controller'

const router = Router()

router.get('/', getDeploys)
router.get('/:deployId', getDeploy)
router.post('/', createDeploy)
router.put('/:deployId', updateDeploy)
router.delete('/:deployId', deleteDeploy)

export default router
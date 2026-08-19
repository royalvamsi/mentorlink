import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { getMatches } from '../controllers/matching.controller'

const router = Router()
router.use(verifyToken)
router.get('/', getMatches)

export default router

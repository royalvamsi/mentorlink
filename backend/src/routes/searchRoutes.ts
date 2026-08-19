import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { search } from '../controllers/search.controller'

const router = Router()
router.use(verifyToken)
// GET /api/search?q=<query>&type=all|mentors|posts|goals&page=1
router.get('/', search)

export default router

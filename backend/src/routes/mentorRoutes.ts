import { Router } from 'express'
import { listMentors, getMentor } from '../controllers/mentor.controller'
import { verifyToken } from '../middleware/verifyToken'

const router = Router()

/** GET /api/mentors — list mentors with optional filters */
router.get('/', verifyToken, listMentors)

/** GET /api/mentors/:id — public mentor profile */
router.get('/:id', verifyToken, getMentor)

export default router

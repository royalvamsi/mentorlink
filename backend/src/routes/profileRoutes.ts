import { Router } from 'express'
import { getMe, updateMe, getPublic } from '../controllers/profile.controller'
import { verifyToken } from '../middleware/verifyToken'

const router = Router()

/** GET /api/profile/me — own profile (requires auth) */
router.get('/me', verifyToken, getMe)

/** PUT /api/profile/me — update own profile (requires auth) */
router.put('/me', verifyToken, updateMe)

/** GET /api/profile/:userId — public profile (requires auth) */
router.get('/:userId', verifyToken, getPublic)

export default router

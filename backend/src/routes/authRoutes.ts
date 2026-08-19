import { Router } from 'express'
import { register, login, getMe } from '../controllers/auth.controller'
import { verifyToken } from '../middleware/verifyToken'

const router = Router()

/**
 * POST /api/auth/register
 * Creates a new user account. Returns a JWT and safe user data on success.
 */
router.post('/register', register)

/**
 * POST /api/auth/login
 * Authenticates an existing user. Returns a JWT and safe user data on success.
 */
router.post('/login', login)

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile. Requires Bearer token.
 */
router.get('/me', verifyToken, getMe)

export default router

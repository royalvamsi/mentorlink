import { Request, Response, NextFunction } from 'express'
import { registerUser, loginUser, getMeUser, AuthServiceError } from '../services/auth.service'
import { RegisterRequestBody, LoginRequestBody } from '../types/auth.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Centralised error responder for this controller.
 * Passes unexpected errors to Express's global error handler.
 */
function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof AuthServiceError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message })
    return
  }
  next(err)
}

// ─── Register ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Creates a new user account and returns a JWT on success.
 */
export async function register(
  req: Request<object, object, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await registerUser(req.body)
    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: result,
    })
  } catch (err) {
    handleError(err, res, next)
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Validates credentials and returns a JWT on success.
 */
export async function login(
  req: Request<object, object, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await loginUser(req.body)
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    })
  } catch (err) {
    handleError(err, res, next)
  }
}

// ─── Get Me ──────────────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's safe profile.
 * Requires a valid Bearer token (verifyToken middleware).
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getMeUser(req.user!.userId)
    res.status(200).json({ status: 'success', data: result })
  } catch (err) {
    handleError(err, res, next)
  }
}

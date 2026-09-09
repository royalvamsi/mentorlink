import { Request, Response, NextFunction } from 'express'
import {
  registerUser,
  loginUser,
  getMeUser,
  forgotPasswordUser,
  resetPasswordUser,
  AuthServiceError,
} from '../services/auth.service'
import {
  RegisterRequestBody,
  LoginRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
} from '../types/auth.types'

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

// ─── Forgot Password ─────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 *
 * Generates a password reset token and dispatches reset instructions.
 */
export async function forgotPassword(
  req: Request<object, object, ForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await forgotPasswordUser(req.body)
    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result,
    })
  } catch (err) {
    handleError(err, res, next)
  }
}

// ─── Reset Password ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/reset-password
 *
 * Validates token and resets user password.
 */
export async function resetPassword(
  req: Request<object, object, ResetPasswordRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await resetPasswordUser(req.body)
    res.status(200).json({
      status: 'success',
      message: result.message,
    })
  } catch (err) {
    handleError(err, res, next)
  }
}


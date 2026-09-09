import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { env } from '../config/env'
import {
  RegisterRequestBody,
  LoginRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  ForgotPasswordResult,
  AuthResult,
  SafeUser,
  JwtPayload,
  USER_ROLES,
} from '../types/auth.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validates an email format (mirrors the Mongoose schema regex). */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Builds the JWT payload and signs a token. */
function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/** Strips sensitive fields and returns a safe user object for API responses. */
function toSafeUser(user: InstanceType<typeof User>): SafeUser {
  return {
    id: (user._id as object).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
}

// ─── Service Errors ───────────────────────────────────────────────────────────

/** A typed service error carries an HTTP status code alongside the message. */
export class AuthServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(
  body: RegisterRequestBody
): Promise<AuthResult> {
  const { name, email, password, role } = body

  // — Validate required fields
  if (!name || !email || !password || !role) {
    throw new AuthServiceError(400, 'name, email, password, and role are required')
  }

  // — Validate email format
  if (!isValidEmail(email)) {
    throw new AuthServiceError(400, 'Invalid email format')
  }

  // — Validate password length (schema enforces >=8, we reflect it here for early exit)
  if (password.length < 8) {
    throw new AuthServiceError(400, 'Password must be at least 8 characters')
  }

  // — Validate role (ADMIN cannot be self-registered — must be assigned via admin panel)
  const REGISTERABLE_ROLES = USER_ROLES.filter(r => r !== 'ADMIN')
  if (!REGISTERABLE_ROLES.includes(role as typeof REGISTERABLE_ROLES[number])) {
    throw new AuthServiceError(
      400,
      `Role must be one of: ${REGISTERABLE_ROLES.join(', ')}`
    )
  }

  // — Normalise email before duplicate check
  const normalisedEmail = email.trim().toLowerCase()

  // — Check for duplicate
  const existing = await User.findOne({ email: normalisedEmail })
  if (existing) {
    throw new AuthServiceError(409, 'An account with this email already exists')
  }

  // — Create user (password hashing happens in the pre-save hook)
  const user = await User.create({
    name: name.trim(),
    email: normalisedEmail,
    password,
    role,
  })

  // — Sign JWT
  const token = signToken({ userId: (user._id as object).toString(), role: user.role })

  return { token, user: toSafeUser(user) }
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginUser(body: LoginRequestBody): Promise<AuthResult> {
  const { email, password } = body

  // — Validate required fields
  if (!email || !password) {
    throw new AuthServiceError(400, 'email and password are required')
  }

  // — Normalise email
  const normalisedEmail = email.trim().toLowerCase()

  // — Find user; explicitly select password (it is select:false on the schema)
  const user = await User.findOne({ email: normalisedEmail }).select('+password')

  // — Deliberately vague error: do not reveal whether email or password was wrong
  const INVALID_CREDENTIALS_MSG = 'Invalid email or password'

  if (!user) {
    throw new AuthServiceError(401, INVALID_CREDENTIALS_MSG)
  }

  const passwordMatch = await user.comparePassword(password)
  if (!passwordMatch) {
    throw new AuthServiceError(401, INVALID_CREDENTIALS_MSG)
  }

  // — Sign JWT
  const token = signToken({ userId: (user._id as object).toString(), role: user.role })

  return { token, user: toSafeUser(user) }
}

// ─── Get Me ──────────────────────────────────────────────────────────────────

export async function getMeUser(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AuthServiceError(404, 'User not found')
  }
  return toSafeUser(user)
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPasswordUser(
  body: ForgotPasswordRequestBody
): Promise<ForgotPasswordResult> {
  const { email } = body

  if (!email) {
    throw new AuthServiceError(400, 'email is required')
  }

  if (!isValidEmail(email)) {
    throw new AuthServiceError(400, 'Invalid email format')
  }

  const normalisedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalisedEmail })

  const defaultMessage =
    'If an account exists with this email address, password reset instructions have been generated.'

  if (!user) {
    return { message: defaultMessage }
  }

  // Generate a cryptographically secure 32-byte token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Set token and expiry (15 minutes from now)
  user.passwordResetToken = hashedToken
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000)
  await user.save({ validateBeforeSave: false })

  const clientOrigin = env.CLIENT_ORIGIN.split(',')[0].trim()
  const resetUrl = `${clientOrigin}/reset-password?token=${resetToken}`

  console.log(`[Auth] Password reset token generated for ${normalisedEmail}`)

  if (env.NODE_ENV !== 'production') {
    return {
      message: defaultMessage,
      resetToken,
      resetUrl,
    }
  }

  return { message: defaultMessage }
}

// ─── Reset Password ──────────────────────────────────────────────────────────

export async function resetPasswordUser(
  body: ResetPasswordRequestBody
): Promise<{ message: string }> {
  const { token, password } = body

  if (!token || !password) {
    throw new AuthServiceError(400, 'token and password are required')
  }

  if (password.length < 8) {
    throw new AuthServiceError(400, 'Password must be at least 8 characters')
  }

  const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires')

  if (!user) {
    throw new AuthServiceError(400, 'Invalid or expired password reset token')
  }

  // Update password (triggers bcrypt hashing in User pre-save hook)
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  return { message: 'Password has been reset successfully. You can now sign in.' }
}


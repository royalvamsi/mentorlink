import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types/auth.types'

// ─── Augment Express Request ──────────────────────────────────────────────────

/**
 * Attach the decoded JWT payload to `req.user` so downstream handlers and
 * middleware can access the authenticated identity without re-reading the token.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * verifyToken
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the JWT, and
 * attaches the decoded payload to `req.user`.
 *
 * Responds with HTTP 401 if the header is missing, the token is malformed,
 * or the token has expired.
 */
export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prefer Authorization header; fall back to ?token= query param (used for
  // file-download links opened via window.open / new browser tabs).
  const authHeader = req.headers.authorization
  let token: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.query && typeof req.query['token'] === 'string' && req.query['token']) {
    token = req.query['token'] as string
  }

  if (!token) {
    res
      .status(401)
      .json({ status: 'error', message: 'Authentication token required' })
    return
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = decoded
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ status: 'error', message: 'Token has expired' })
      return
    }
    res.status(401).json({ status: 'error', message: 'Invalid token' })
  }
}

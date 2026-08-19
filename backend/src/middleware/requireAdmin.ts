import { Request, Response, NextFunction } from 'express'

/**
 * Middleware: only allow requests from users with role === 'ADMIN'.
 * Must be used after verifyToken.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ status: 'error', message: 'Forbidden: admins only' })
    return
  }
  next()
}

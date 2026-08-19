import { Request, Response, NextFunction } from 'express'
import { UserRole } from '../types/auth.types'

/**
 * authorizeRoles
 *
 * Role-based access control middleware factory.
 * Must be used AFTER verifyToken (which populates req.user).
 *
 * Usage example (future routes):
 *
 *   router.get(
 *     '/seniors-only',
 *     verifyToken,
 *     authorizeRoles('SENIOR', 'ALUMNI'),
 *     handler
 *   )
 *
 * @param roles - One or more roles that are permitted to access the route.
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // verifyToken must run first — req.user will be undefined if it didn't
    if (!req.user) {
      res
        .status(401)
        .json({ status: 'error', message: 'Authentication required' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource',
      })
      return
    }

    next()
  }
}

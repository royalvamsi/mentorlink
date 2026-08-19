/**
 * Shared TypeScript types for authentication.
 *
 * These interfaces are used across the model, service, controller,
 * and middleware layers — keeping type definitions in one place.
 */

// ─── Role ────────────────────────────────────────────────────────────────────

export const USER_ROLES = ['JUNIOR', 'SENIOR', 'ALUMNI'] as const
export type UserRole = (typeof USER_ROLES)[number]

// ─── JWT Payload ─────────────────────────────────────────────────────────────

/**
 * The data embedded inside a signed JWT.
 * Only non-sensitive, stable identifiers belong here.
 */
export interface JwtPayload {
  userId: string
  role: UserRole
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface LoginRequestBody {
  email: string
  password: string
}

// ─── Service Return Types ────────────────────────────────────────────────────

/** Safe user data returned in API responses — password is always excluded. */
export interface SafeUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface AuthResult {
  token: string
  user: SafeUser
}

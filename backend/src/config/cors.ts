import { env } from './env'

const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim())

/**
 * Checks if a request origin is permitted by CORS.
 * In development / non-production, dynamically allows all localhost & 127.0.0.1 ports.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true

  if (allowedOrigins.includes(origin)) return true

  if (
    env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    return true
  }

  return false
}

/**
 * Environment variable loader.
 *
 * Reads variables from the process environment (after dotenv has loaded .env)
 * and exposes them as a strongly-typed config object.
 *
 * Throws at startup if a required variable is missing — fail fast rather than
 * discovering the missing config at runtime.
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue
}

export const env = {
  /** Node environment: 'development' | 'production' | 'test' */
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),

  /** TCP port the Express server will listen on */
  PORT: parseInt(optionalEnv('PORT', '5000'), 10),

  /** MongoDB Atlas connection string */
  MONGO_URI: requireEnv('MONGO_URI'),

  /** Secret used to sign JWT tokens — must be long and random in production */
  JWT_SECRET: requireEnv('JWT_SECRET'),

  /** JWT expiry duration (e.g. '7d', '24h') */
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),

  /** Comma-separated list of allowed CORS origins */
  CLIENT_ORIGIN: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
} as const

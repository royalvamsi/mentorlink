/**
 * Environment variable loader.
 *
 * Reads variables from process.env (after loading .env) and exposes them
 * as a strongly-typed config object.
 */
import 'dotenv/config'

function requireEnv(key: string, testFallback?: string): string {
  const value = process.env[key]
  if (!value) {
    if (process.env['NODE_ENV'] === 'test' && testFallback) {
      return testFallback
    }
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
  MONGO_URI: requireEnv('MONGO_URI', 'mongodb://127.0.0.1:27017/mentorlink_test'),

  /** Secret used to sign JWT tokens — must be long and random in production */
  JWT_SECRET: requireEnv('JWT_SECRET', 'test_jwt_secret_key_for_automated_testing_purposes_only'),

  /** JWT expiry duration (e.g. '7d', '24h') */
  JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '7d'),

  /** Comma-separated list of allowed CORS origins */
  CLIENT_ORIGIN: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
} as const

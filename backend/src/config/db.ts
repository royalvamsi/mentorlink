import mongoose from 'mongoose'
import { env } from './env'

/**
 * Establishes a connection to MongoDB using Mongoose.
 *
 * Called once at application startup (from server.ts).
 * Exits the process on failure — there is no point running the server
 * without a database connection.
 */
export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGO_URI)
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('[DB] Connection failed:', error)
    process.exit(1)
  }
}

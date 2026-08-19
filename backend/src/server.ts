import 'dotenv/config'
import { env } from './config/env'
import { connectDB } from './config/db'
import app from './app'

async function main(): Promise<void> {
  // Connect to MongoDB before accepting traffic
  await connectDB()

  app.listen(env.PORT, () => {
    console.log(
      `[Server] MentorLink API running in ${env.NODE_ENV} mode on port ${env.PORT}`
    )
  })
}

main().catch((err) => {
  console.error('[Server] Fatal startup error:', err)
  process.exit(1)
})

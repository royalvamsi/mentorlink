import 'dotenv/config'
import { createServer } from 'http'
import { env } from './config/env'
import { connectDB } from './config/db'
import app from './app'
import { initSocket } from './socket/socketHandler'

async function main(): Promise<void> {
  await connectDB()

  const httpServer = createServer(app)
  initSocket(httpServer)

  httpServer.listen(env.PORT, () => {
    console.log(
      `[Server] MentorLink API running in ${env.NODE_ENV} mode on port ${env.PORT}`
    )
  })
}

main().catch((err) => {
  console.error('[Server] Fatal startup error:', err)
  process.exit(1)
})

import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { env } from './config/env'
import healthRoutes from './routes/healthRoutes'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import mentorRoutes from './routes/mentorRoutes'
import mentorshipRoutes from './routes/mentorshipRoutes'
import chatRoutes from './routes/chatRoutes'
import schedulingRoutes from './routes/schedulingRoutes'
import feedbackRoutes from './routes/feedbackRoutes'
import fileRoutes from './routes/fileRoutes'
import forumRoutes from './routes/forumRoutes'
import goalRoutes from './routes/goalRoutes'
import notificationRoutes from './routes/notificationRoutes'

const app: Application = express()

// ─── Security / Global Middleware ────────────────────────────────────────────

app.use(
  cors({
    origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/mentors', mentorRoutes)
app.use('/api/mentorships', mentorshipRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/scheduling', schedulingRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/forum', forumRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/notifications', notificationRoutes)

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 'error', message: 'Route not found' })
})

// ─── Global Error Handler ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.stack)
  res.status(500).json({
    status: 'error',
    message:
      env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

export default app

import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { isOriginAllowed } from './config/cors'
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
import adminRoutes from './routes/adminRoutes'
import matchingRoutes from './routes/matchingRoutes'
import searchRoutes from './routes/searchRoutes'

const app: Application = express()

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow Socket.io
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
}))

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true)
      } else {
        callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Rate Limiting ────────────────────────────────────────────────────────────

/** Strict limiter for auth endpoints — prevent brute-force */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: env.NODE_ENV === 'production' ? 20 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
})

/** General API limiter */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
})

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// JSON limit is 2mb (file uploads go through multipart, not JSON)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// ─── Apply Limiters ───────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter)
app.use('/api/', apiLimiter)

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
app.use('/api/admin', adminRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/search', searchRoutes)

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

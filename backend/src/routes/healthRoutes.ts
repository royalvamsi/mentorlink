import { Router, Request, Response } from 'express'

const router = Router()

/**
 * GET /api/health
 *
 * A lightweight liveness probe.
 * Returns the service status and current UTC timestamp.
 * No authentication required.
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'MentorLink API',
    timestamp: new Date().toISOString(),
  })
})

export default router

import { Request, Response, NextFunction } from 'express'
import {
  submitFeedback, getUserFeedback, getUserAverageRating, getMySubmittedFeedback, FeedbackError,
} from '../services/feedback.service'

function handleErr(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof FeedbackError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message }); return
  }
  next(err)
}

export async function postFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookingId, rating, comment, isPublic } = req.body as { bookingId: string; rating: number; comment?: string; isPublic?: boolean }
    if (!bookingId || rating == null) { res.status(400).json({ status: 'error', message: 'bookingId and rating required' }); return }
    const data = await submitFeedback(bookingId, req.user!.userId, Number(rating), comment, isPublic)
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function getFeedbackForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params['userId'] as string
    const [feedback, stats] = await Promise.all([getUserFeedback(userId), getUserAverageRating(userId)])
    res.status(200).json({ status: 'success', data: { feedback, stats } })
  } catch (err) { handleErr(err, res, next) }
}

export async function getSubmitted(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMySubmittedFeedback(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

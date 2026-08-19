import { Request, Response, NextFunction } from 'express'
import {
  sendRequest, cancelRequest, acceptRequest, rejectRequest,
  getIncomingRequests, getSentRequests, getActiveMentorships,
  MentorshipServiceError,
} from '../services/mentorship.service'
import { createNotification } from '../services/notification.service'
import User from '../models/User'

function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof MentorshipServiceError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message })
    return
  }
  next(err)
}

export async function createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mentorId, message } = req.body as { mentorId: string; message?: string }
    if (!mentorId) { res.status(400).json({ status: 'error', message: 'mentorId is required' }); return }
    const data = await sendRequest(req.user!.userId, mentorId, message)
    // Notify mentor (fire-and-forget)
    User.findById(req.user!.userId).select('name').lean().then(mentee => {
      createNotification(mentorId, 'MENTORSHIP_REQUEST', 'New Mentorship Request',
        `${mentee?.name ?? 'Someone'} sent you a mentorship request`, '/mentorships'
      ).catch(() => {})
    }).catch(() => {})
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await cancelRequest(req.user!.userId, req.params['id'] as string)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function accept(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await acceptRequest(req.user!.userId, req.params['id'] as string)
    // Notify mentee
    User.findById(req.user!.userId).select('name').lean().then(mentor => {
      createNotification(
        data.request.menteeId.toString(), 'REQUEST_ACCEPTED', 'Mentorship Request Accepted!',
        `${mentor?.name ?? 'Your mentor'} accepted your mentorship request`, '/mentorships'
      ).catch(() => {})
    }).catch(() => {})
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await rejectRequest(req.user!.userId, req.params['id'] as string)
    // Notify mentee
    User.findById(req.user!.userId).select('name').lean().then(mentor => {
      createNotification(
        data.menteeId.toString(), 'REQUEST_DECLINED', 'Mentorship Request Update',
        `${mentor?.name ?? 'Your mentor'} was unable to accept your request at this time`, '/mentorships'
      ).catch(() => {})
    }).catch(() => {})
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function incoming(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getIncomingRequests(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function sent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getSentRequests(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function active(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getActiveMentorships(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

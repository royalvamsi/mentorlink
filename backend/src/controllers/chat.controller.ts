import { Request, Response, NextFunction } from 'express'
import { getOrCreateConversation, getMyConversations, getMessages, markRead, getUnreadCount, ChatServiceError } from '../services/chat.service'

function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof ChatServiceError) { res.status(err.statusCode).json({ status: 'error', message: err.message }); return }
  next(err)
}

export async function openConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, recipientId } = req.body as { userId?: string; recipientId?: string }
    const targetUserId = userId || recipientId
    if (!targetUserId) { res.status(400).json({ status: 'error', message: 'userId required' }); return }
    const conv = await getOrCreateConversation(req.user!.userId, targetUserId)
    res.status(200).json({ status: 'success', data: conv })
  } catch (err) { handleError(err, res, next) }
}

export async function listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMyConversations(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function fetchMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10)
    const data = await getMessages(req.params['conversationId'] as string, req.user!.userId, page)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function readMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await markRead(req.params['conversationId'] as string, req.user!.userId)
    res.status(200).json({ status: 'success' })
  } catch (err) { handleError(err, res, next) }
}

export async function unreadCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getUnreadCount(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

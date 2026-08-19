import { Request, Response, NextFunction } from 'express'
import { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification } from '../services/notification.service'

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const unreadOnly = req.query['unread'] === 'true'
    const data = await getNotifications(req.user!.userId, unreadOnly)
    const unreadCount = await getUnreadCount(req.user!.userId)
    res.status(200).json({ status: 'success', data: { notifications: data, unreadCount } })
  } catch (err) { next(err) }
}

export async function readNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await markRead(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', message: 'Marked as read' })
  } catch (err) { next(err) }
}

export async function readAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await markAllRead(req.user!.userId)
    res.status(200).json({ status: 'success', message: 'All marked as read' })
  } catch (err) { next(err) }
}

export async function removeNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteNotification(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', message: 'Notification deleted' })
  } catch (err) { next(err) }
}

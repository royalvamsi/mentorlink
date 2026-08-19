import Notification from '../models/Notification'
import { Types } from 'mongoose'
import type { NotificationType } from '../models/Notification'

// Optional: Server reference for emitting real-time notifications
let _io: import('socket.io').Server | null = null

export function setIo(io: import('socket.io').Server) { _io = io }

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
  meta?: Record<string, unknown>
) {
  const notification = await Notification.create({
    userId: new Types.ObjectId(userId),
    type, title, body, link, meta,
  })

  // Emit real-time notification if socket server is available
  if (_io) {
    _io.to(`user:${userId}`).emit('notification', {
      _id: notification.id,
      type,
      title,
      body,
      link,
      createdAt: notification.createdAt,
    })
  }

  return notification
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getNotifications(userId: string, onlyUnread = false) {
  const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) }
  if (onlyUnread) filter['read'] = false
  return Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean()
}

export async function getUnreadCount(userId: string) {
  return Notification.countDocuments({ userId: new Types.ObjectId(userId), read: false })
}

export async function markRead(id: string, userId: string) {
  return Notification.findOneAndUpdate(
    { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
    { read: true },
    { new: true }
  )
}

export async function markAllRead(userId: string) {
  await Notification.updateMany({ userId: new Types.ObjectId(userId), read: false }, { read: true })
}

export async function deleteNotification(id: string, userId: string) {
  await Notification.findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
}

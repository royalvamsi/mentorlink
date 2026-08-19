import { api } from './authService'
import type { NotificationType } from '../types/notification'

export interface NotificationItem {
  _id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: string
}

export interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
}

export const notificationService = {
  async getAll(unreadOnly = false): Promise<NotificationsResponse> {
    const res = await api.get<{ status: string; data: NotificationsResponse }>('/api/notifications', {
      params: unreadOnly ? { unread: true } : {},
    })
    return res.data.data
  },
  async markRead(id: string): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`)
  },
  async markAllRead(): Promise<void> {
    await api.patch('/api/notifications/read-all')
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/api/notifications/${id}`)
  },
}

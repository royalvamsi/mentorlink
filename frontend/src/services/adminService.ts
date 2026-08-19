import { api } from './authService'

export type ReportTargetType = 'USER' | 'POST' | 'COMMENT' | 'MESSAGE'
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISINFORMATION' | 'OTHER'

export interface Report {
  _id: string
  reporterId: { _id: string; name: string; email: string }
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  resolutionNote?: string
  resolvedAt?: string
  createdAt: string
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  totalReports: number
  pendingReports: number
  totalPosts: number
  roleBreakdown: { _id: string; count: number }[]
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get<{ status: string; data: AdminStats }>('/api/admin/stats')
    return res.data.data
  },
  async getReports(status?: string, page = 1): Promise<{ reports: Report[]; total: number; totalPages: number }> {
    const res = await api.get<{ status: string; data: { reports: Report[]; total: number; totalPages: number } }>('/api/admin/reports', {
      params: { status, page }
    })
    return res.data.data
  },
  async resolveReport(id: string, status: ReportStatus, resolutionNote?: string): Promise<void> {
    await api.patch(`/api/admin/reports/${id}`, { status, resolutionNote })
  },
  async getUsers(page = 1, search?: string): Promise<{ users: AdminUser[]; total: number; totalPages: number }> {
    const res = await api.get<{ status: string; data: { users: AdminUser[]; total: number; totalPages: number } }>('/api/admin/users', {
      params: { page, search }
    })
    return res.data.data
  },
  async updateUserRole(id: string, role: string): Promise<void> {
    await api.patch(`/api/admin/users/${id}/role`, { role })
  },
  async submitReport(targetType: ReportTargetType, targetId: string, reason: ReportReason, description?: string): Promise<void> {
    await api.post('/api/admin/reports', { targetType, targetId, reason, description })
  },
}

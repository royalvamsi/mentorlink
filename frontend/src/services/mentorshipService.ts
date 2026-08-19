import { api } from './authService'

export interface MentorshipRequest {
  _id: string
  menteeId: { _id: string; name: string; email: string; role: string } | string
  mentorId: { _id: string; name: string; email: string; role: string } | string
  message?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
}

export interface ActiveMentorship {
  _id: string
  menteeId: { _id: string; name: string; email: string; role: string }
  mentorId: { _id: string; name: string; email: string; role: string }
  status: 'ACTIVE' | 'ENDED'
  startedAt: string
}

export const mentorshipService = {
  async sendRequest(mentorId: string, message?: string): Promise<MentorshipRequest> {
    const res = await api.post<{ status: string; data: MentorshipRequest }>('/api/mentorships/request', { mentorId, message })
    return res.data.data
  },
  async cancelRequest(id: string): Promise<MentorshipRequest> {
    const res = await api.delete<{ status: string; data: MentorshipRequest }>(`/api/mentorships/request/${id}`)
    return res.data.data
  },
  async acceptRequest(id: string): Promise<{ request: MentorshipRequest; mentorship: ActiveMentorship }> {
    const res = await api.put(`/api/mentorships/request/${id}/accept`)
    return res.data.data
  },
  async rejectRequest(id: string): Promise<MentorshipRequest> {
    const res = await api.put(`/api/mentorships/request/${id}/reject`)
    return res.data.data
  },
  async getIncoming(): Promise<MentorshipRequest[]> {
    const res = await api.get<{ status: string; data: MentorshipRequest[] }>('/api/mentorships/requests')
    return res.data.data
  },
  async getSent(): Promise<MentorshipRequest[]> {
    const res = await api.get<{ status: string; data: MentorshipRequest[] }>('/api/mentorships/sent')
    return res.data.data
  },
  async getActive(): Promise<ActiveMentorship[]> {
    const res = await api.get<{ status: string; data: ActiveMentorship[] }>('/api/mentorships/active')
    return res.data.data
  },
}

import { api } from './authService'

export interface FeedbackReviewer {
  _id: string
  name: string
  role: string
}

export interface FeedbackItem {
  _id: string
  bookingId: { _id: string; startTime: string; endTime: string }
  reviewerId: FeedbackReviewer
  revieweeId: FeedbackReviewer
  rating: number
  comment?: string
  isPublic: boolean
  createdAt: string
}

export interface FeedbackStats {
  avgRating: number | null
  count: number
}

export const feedbackService = {
  async submit(bookingId: string, rating: number, comment?: string, isPublic = true): Promise<FeedbackItem> {
    const res = await api.post<{ status: string; data: FeedbackItem }>('/api/feedback', { bookingId, rating, comment, isPublic })
    return res.data.data
  },
  async getUserFeedback(userId: string): Promise<{ feedback: FeedbackItem[]; stats: FeedbackStats }> {
    const res = await api.get<{ status: string; data: { feedback: FeedbackItem[]; stats: FeedbackStats } }>(`/api/feedback/user/${userId}`)
    return res.data.data
  },
  async getSubmitted(): Promise<FeedbackItem[]> {
    const res = await api.get<{ status: string; data: FeedbackItem[] }>('/api/feedback/submitted')
    return res.data.data
  },
}

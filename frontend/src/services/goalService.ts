import { api } from './authService'

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

export interface Milestone {
  _id: string
  title: string
  completed: boolean
  dueDate?: string
  completedAt?: string
}

export interface Goal {
  _id: string
  userId: string
  mentorshipId?: string
  title: string
  description?: string
  status: GoalStatus
  targetDate?: string
  completedAt?: string
  milestones: Milestone[]
  tags: string[]
  progress: number
  createdAt: string
}

export const goalService = {
  async getGoals(status?: string): Promise<Goal[]> {
    const res = await api.get<{ status: string; data: Goal[] }>('/api/goals', { params: status ? { status } : {} })
    return res.data.data
  },
  async createGoal(data: { title: string; description?: string; targetDate?: string; milestones?: { title: string }[]; tags?: string[] }): Promise<Goal> {
    const res = await api.post<{ status: string; data: Goal }>('/api/goals', data)
    return res.data.data
  },
  async updateGoal(id: string, data: Partial<{ title: string; description: string; status: GoalStatus; targetDate: string; tags: string[] }>): Promise<Goal> {
    const res = await api.patch<{ status: string; data: Goal }>(`/api/goals/${id}`, data)
    return res.data.data
  },
  async deleteGoal(id: string): Promise<void> { await api.delete(`/api/goals/${id}`) },
  async addMilestone(goalId: string, title: string, dueDate?: string): Promise<Goal> {
    const res = await api.post<{ status: string; data: Goal }>(`/api/goals/${goalId}/milestones`, { title, dueDate })
    return res.data.data
  },
  async toggleMilestone(goalId: string, milestoneId: string): Promise<Goal> {
    const res = await api.patch<{ status: string; data: Goal }>(`/api/goals/${goalId}/milestones/${milestoneId}/toggle`)
    return res.data.data
  },
}

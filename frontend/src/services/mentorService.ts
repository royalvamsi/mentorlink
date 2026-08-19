import { api } from './authService'

export interface MentorProfile {
  userId: string
  name: string
  role: string
  profile: {
    avatarUrl?: string
    department?: string
    year?: string
    bio?: string
    skills: string[]
    academicInterests: string[]
    careerInterests: string[]
    availabilityNote?: string
    linkedIn?: string
    github?: string
  }
}

export interface MentorListResult {
  mentors: MentorProfile[]
  total: number
  page: number
  totalPages: number
}

export const mentorService = {
  async getMentors(params: { search?: string; skills?: string; department?: string; page?: number }): Promise<MentorListResult> {
    const res = await api.get<{ status: string; data: MentorListResult }>('/api/mentors', { params })
    return res.data.data
  },
  async getMentorById(id: string): Promise<MentorProfile> {
    const res = await api.get<{ status: string; data: MentorProfile }>(`/api/mentors/${id}`)
    return res.data.data
  },
}

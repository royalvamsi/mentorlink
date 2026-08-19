import { api } from './authService'

export interface ProfileData {
  avatarUrl?: string
  department?: string
  year?: string
  bio?: string
  skills?: string[]
  academicInterests?: string[]
  careerInterests?: string[]
  mentorshipGoals?: string
  availabilityNote?: string
  linkedIn?: string
  github?: string
}

export interface UserProfile {
  userId: string
  name: string
  email: string
  role: string
  profile: ProfileData
}

export const profileService = {
  async getMyProfile(): Promise<UserProfile> {
    const res = await api.get<{ status: string; data: UserProfile }>('/api/profile/me')
    return res.data.data
  },
  async updateMyProfile(data: ProfileData): Promise<UserProfile> {
    const res = await api.put<{ status: string; data: UserProfile }>('/api/profile/me', data)
    return res.data.data
  },
  async getPublicProfile(userId: string): Promise<UserProfile> {
    const res = await api.get<{ status: string; data: UserProfile }>(`/api/profile/${userId}`)
    return res.data.data
  },
}

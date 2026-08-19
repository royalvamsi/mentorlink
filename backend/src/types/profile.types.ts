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

export interface PublicProfile {
  userId: string
  name: string
  email: string
  role: string
  profile: ProfileData
}

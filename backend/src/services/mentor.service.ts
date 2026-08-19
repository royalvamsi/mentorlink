import Profile from '../models/Profile'
import User from '../models/User'
import { Types } from 'mongoose'

export interface MentorFilter {
  search?: string
  skills?: string[]
  department?: string
  page?: number
  limit?: number
}

export interface MentorListing {
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

export async function getMentors(filter: MentorFilter): Promise<{ mentors: MentorListing[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, filter.page ?? 1)
  const limit = Math.min(20, Math.max(1, filter.limit ?? 12))
  const skip = (page - 1) * limit

  // Find SENIOR and ALUMNI users matching optional search
  const userQuery: Record<string, unknown> = { role: { $in: ['SENIOR', 'ALUMNI'] } }
  if (filter.search) {
    const regex = new RegExp(filter.search, 'i')
    userQuery['$or'] = [{ name: regex }, { email: regex }]
  }

  const mentorUsers = await User.find(userQuery).select('_id name role').lean()
  const mentorIds = mentorUsers.map((u) => u._id as Types.ObjectId)

  // Build profile query
  const profileQuery: Record<string, unknown> = { userId: { $in: mentorIds } }
  if (filter.department) profileQuery['department'] = filter.department
  if (filter.skills && filter.skills.length > 0) {
    profileQuery['skills'] = { $in: filter.skills }
  }

  const [profiles, total] = await Promise.all([
    Profile.find(profileQuery).skip(skip).limit(limit).lean(),
    Profile.countDocuments(profileQuery),
  ])

  const userMap = new Map(mentorUsers.map((u) => [(u._id as Types.ObjectId).toString(), u]))

  const mentors: MentorListing[] = profiles.map((p) => {
    const user = userMap.get(p.userId.toString())
    return {
      userId: p.userId.toString(),
      name: user?.name ?? '',
      role: user?.role ?? '',
      profile: {
        avatarUrl: p.avatarUrl,
        department: p.department,
        year: p.year,
        bio: p.bio,
        skills: p.skills ?? [],
        academicInterests: p.academicInterests ?? [],
        careerInterests: p.careerInterests ?? [],
        availabilityNote: p.availabilityNote,
        linkedIn: p.linkedIn,
        github: p.github,
      },
    }
  })

  return { mentors, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getMentorById(userId: string): Promise<MentorListing> {
  const user = await User.findById(userId).select('_id name role')
  if (!user || !['SENIOR', 'ALUMNI'].includes(user.role)) {
    const e = new Error('Mentor not found') as Error & { statusCode: number }
    e.statusCode = 404
    throw e
  }
  const profile = await Profile.findOne({ userId: new Types.ObjectId(userId) }).lean()
  return {
    userId,
    name: user.name,
    role: user.role,
    profile: {
      avatarUrl: profile?.avatarUrl,
      department: profile?.department,
      year: profile?.year,
      bio: profile?.bio,
      skills: profile?.skills ?? [],
      academicInterests: profile?.academicInterests ?? [],
      careerInterests: profile?.careerInterests ?? [],
      availabilityNote: profile?.availabilityNote,
      linkedIn: profile?.linkedIn,
      github: profile?.github,
    },
  }
}

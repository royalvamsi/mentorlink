import Profile, { IProfile } from '../models/Profile'
import User from '../models/User'
import { ProfileData, PublicProfile } from '../types/profile.types'
import { Types } from 'mongoose'

export class ProfileServiceError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'ProfileServiceError'
  }
}

function sanitize(data: ProfileData): Partial<IProfile> {
  const cleaned: Partial<IProfile> = {}
  if (data.avatarUrl !== undefined) cleaned.avatarUrl = data.avatarUrl
  if (data.department !== undefined) cleaned.department = data.department
  if (data.year !== undefined) cleaned.year = data.year
  if (data.bio !== undefined) cleaned.bio = data.bio
  if (data.skills !== undefined) cleaned.skills = data.skills.slice(0, 20)
  if (data.academicInterests !== undefined) cleaned.academicInterests = data.academicInterests.slice(0, 15)
  if (data.careerInterests !== undefined) cleaned.careerInterests = data.careerInterests.slice(0, 15)
  if (data.mentorshipGoals !== undefined) cleaned.mentorshipGoals = data.mentorshipGoals
  if (data.availabilityNote !== undefined) cleaned.availabilityNote = data.availabilityNote
  if (data.linkedIn !== undefined) cleaned.linkedIn = data.linkedIn
  if (data.github !== undefined) cleaned.github = data.github
  return cleaned
}

export async function getMyProfile(userId: string): Promise<PublicProfile> {
  const user = await User.findById(userId)
  if (!user) throw new ProfileServiceError(404, 'User not found')

  let profile = await Profile.findOne({ userId: new Types.ObjectId(userId) })
  if (!profile) {
    profile = await Profile.create({ userId: new Types.ObjectId(userId), skills: [], academicInterests: [], careerInterests: [] })
  }

  return {
    userId,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: profile.toObject(),
  }
}

export async function updateMyProfile(userId: string, data: ProfileData): Promise<PublicProfile> {
  const user = await User.findById(userId)
  if (!user) throw new ProfileServiceError(404, 'User not found')

  const cleaned = sanitize(data)
  const profile = await Profile.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { $set: cleaned },
    { new: true, upsert: true, runValidators: true }
  )

  return {
    userId,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: profile!.toObject(),
  }
}

export async function getPublicProfile(targetUserId: string): Promise<PublicProfile> {
  const user = await User.findById(targetUserId)
  if (!user) throw new ProfileServiceError(404, 'User not found')

  const profile = await Profile.findOne({ userId: new Types.ObjectId(targetUserId) })

  return {
    userId: targetUserId,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: profile ? profile.toObject() : { skills: [], academicInterests: [], careerInterests: [] },
  }
}

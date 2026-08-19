/**
 * Smart Mentor Matching Service
 *
 * Deterministic, factor-weighted matching with transparent score breakdown.
 * Each factor returns a normalized 0–1 score. The final score is a weighted sum.
 * Architecture: replaceable — return type is stable, enabling future ML drop-in.
 */

import Profile from '../models/Profile'
import User from '../models/User'
import Availability from '../models/Availability'
import { Types } from 'mongoose'

export interface MatchFactor {
  name: string
  score: number   // 0–100
  label: string   // human-readable explanation
}

export interface MentorMatch {
  mentorId: string
  name: string
  role: string
  score: number         // 0–100 overall
  factors: MatchFactor[]
  profile: {
    department?: string
    year?: string
    bio?: string
    skills: string[]
    academicInterests: string[]
    careerInterests: string[]
    avatarUrl?: string
  }
}

// Jaccard similarity between two string arrays (case-insensitive)
function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0
  const setA = new Set(a.map(s => s.toLowerCase()))
  const setB = new Set(b.map(s => s.toLowerCase()))
  const intersection = [...setA].filter(x => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

// Keyword overlap for free-text fields
function textOverlap(a = '', b = ''): number {
  const words = (s: string) => new Set(s.toLowerCase().split(/\W+/).filter(w => w.length > 3))
  const wa = words(a), wb = words(b)
  if (!wa.size && !wb.size) return 0
  const intersection = [...wa].filter(w => wb.has(w)).length
  return Math.min(1, intersection / Math.max(wa.size, wb.size))
}

const WEIGHTS = {
  skills: 0.35,
  academicInterests: 0.25,
  careerInterests: 0.25,
  goals: 0.10,
  availability: 0.05,
}

export async function getMatchedMentors(menteeId: string, limit = 10): Promise<MentorMatch[]> {
  // Get mentee profile
  const menteeProfile = await Profile.findOne({ userId: new Types.ObjectId(menteeId) }).lean()
  const menteeUser = await User.findById(menteeId).select('name role').lean()

  // Get all eligible mentors (SENIOR, ALUMNI) with profiles
  const mentorUsers = await User.find({
    _id: { $ne: new Types.ObjectId(menteeId) },
    role: { $in: ['SENIOR', 'ALUMNI', 'ADMIN'] },  // admin can also appear as mentors
  }).select('name role').lean()

  if (!mentorUsers.length) return []

  const mentorIds = mentorUsers.map(m => m._id as Types.ObjectId)
  const mentorProfiles = await Profile.find({ userId: { $in: mentorIds } }).lean()
  const profileMap = new Map(mentorProfiles.map(p => [p.userId.toString(), p]))

  // Check which mentors have future availability
  const now = new Date()
  const availableNow = await Availability.find({
    mentorId: { $in: mentorIds },
    startTime: { $gte: now },
    isBooked: false,
  }).distinct('mentorId')
  const availableSet = new Set(availableNow.map(id => id.toString()))

  const menteeSkills = menteeProfile?.skills ?? []
  const menteeAcademic = menteeProfile?.academicInterests ?? []
  const menteeCareer = menteeProfile?.careerInterests ?? []
  const menteeGoals = menteeProfile?.mentorshipGoals ?? ''

  const matches: MentorMatch[] = []

  for (const mentor of mentorUsers) {
    const mid = (mentor._id as Types.ObjectId).toString()
    const mp = profileMap.get(mid)

    const skillScore = Math.round(jaccard(menteeSkills, mp?.skills ?? []) * 100)
    const academicScore = Math.round(jaccard(menteeAcademic, mp?.academicInterests ?? []) * 100)
    const careerScore = Math.round(jaccard(menteeCareer, mp?.careerInterests ?? []) * 100)
    const goalsScore = Math.round(textOverlap(menteeGoals, mp?.mentorshipGoals ?? '') * 100)
    const availScore = availableSet.has(mid) ? 100 : 0

    const overall = Math.round(
      skillScore * WEIGHTS.skills +
      academicScore * WEIGHTS.academicInterests +
      careerScore * WEIGHTS.careerInterests +
      goalsScore * WEIGHTS.goals +
      availScore * WEIGHTS.availability
    )

    const factors: MatchFactor[] = [
      { name: 'skills', score: skillScore, label: skillScore >= 60 ? 'Strong skill match' : skillScore >= 30 ? 'Partial skill match' : 'Low skill overlap' },
      { name: 'academicInterests', score: academicScore, label: academicScore >= 50 ? 'Shared academic interests' : 'Different academic focus' },
      { name: 'careerInterests', score: careerScore, label: careerScore >= 50 ? 'Aligned career goals' : 'Different career trajectory' },
      { name: 'goals', score: goalsScore, label: goalsScore >= 40 ? 'Compatible mentorship goals' : 'Varied mentorship goals' },
      { name: 'availability', score: availScore, label: availScore > 0 ? 'Available for sessions' : 'No upcoming availability' },
    ]

    matches.push({
      mentorId: mid,
      name: mentor.name,
      role: mentor.role,
      score: overall,
      factors,
      profile: {
        department: mp?.department,
        year: mp?.year,
        bio: mp?.bio,
        skills: mp?.skills ?? [],
        academicInterests: mp?.academicInterests ?? [],
        careerInterests: mp?.careerInterests ?? [],
        avatarUrl: mp?.avatarUrl,
      },
    })
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Global Search Service
 *
 * Searches across mentors/users, forum posts, and own goals.
 * Authorization rules:
 *   - Users: only SENIOR/ALUMNI mentors returned (no JUNIOR profiles, no passwords)
 *   - Posts: all public forum posts
 *   - Goals: ONLY the requesting user's own goals
 *   - Never expose: passwords, hashes, tokens, emails, private conversations
 */

import User from '../models/User'
import Profile from '../models/Profile'
import { Post } from '../models/Forum'
import Goal from '../models/Goal'
import { Types } from 'mongoose'

export type SearchType = 'all' | 'mentors' | 'posts' | 'goals'

export interface SearchResult {
  type: 'user' | 'post' | 'goal'
  id: string
  title: string
  subtitle?: string
  link: string
  tags?: string[]
  score?: number   // reserved for future ranking
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  type: SearchType
}

export async function globalSearch(
  query: string,
  userId: string,
  type: SearchType = 'all',
  page = 1,
  pageSize = 15,
): Promise<SearchResponse> {
  query = (query ?? '').trim()
  if (query.length < 2) return { results: [], total: 0, query, type }

  const regex = { $regex: query, $options: 'i' }
  const results: SearchResult[] = []

  // ─── Mentors / Users ────────────────────────────────────────────────────────
  if (type === 'all' || type === 'mentors') {
    // First find matching profiles (skills / interests / dept)
    const matchingProfiles = await Profile.find({
      $or: [
        { department: regex },
        { skills: regex },
        { academicInterests: regex },
        { careerInterests: regex },
        { mentorshipGoals: regex },
      ],
    }).select('userId department skills').limit(10).lean()

    const profileMatchedIds = matchingProfiles.map(p => p.userId)

    // Merge: name/email match OR profile field match
    const users = await User.find({
      role: { $in: ['SENIOR', 'ALUMNI'] },
      $or: [
        { name: regex },
        { _id: { $in: profileMatchedIds } },
      ],
    }).select('name role').limit(10).lean()

    const userIds = users.map(u => u._id as Types.ObjectId)
    const profiles = await Profile.find({ userId: { $in: userIds } })
      .select('userId department skills bio avatarUrl').lean()
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]))

    for (const u of users) {
      const p = profileMap.get((u._id as Types.ObjectId).toString())
      results.push({
        type: 'user',
        id: (u._id as Types.ObjectId).toString(),
        title: u.name,
        subtitle: [u.role, p?.department].filter(Boolean).join(' · '),
        link: `/mentors/${(u._id as Types.ObjectId).toString()}`,
        tags: p?.skills?.slice(0, 4),
      })
    }
  }

  // ─── Forum Posts ─────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'posts') {
    const posts = await Post.find({
      $or: [{ title: regex }, { content: regex }, { tags: regex }],
    })
      .select('title authorId tags createdAt')
      .populate('authorId', 'name')
      .limit(10)
      .lean()

    for (const post of posts) {
      results.push({
        type: 'post',
        id: (post._id as Types.ObjectId).toString(),
        title: post.title,
        subtitle: `Forum · by ${((post.authorId as unknown) as { name: string })?.name ?? 'Unknown'}`,
        link: `/forum/${(post._id as Types.ObjectId).toString()}`,
        tags: (post.tags as string[] | undefined)?.slice(0, 4),
      })
    }
  }

  // ─── Goals — OWN ONLY ─────────────────────────────────────────────────────
  if (type === 'all' || type === 'goals') {
    const goals = await Goal.find({
      userId: new Types.ObjectId(userId),   // hard authorization: only own goals
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    }).select('title status tags progress').limit(8).lean()

    for (const goal of goals) {
      results.push({
        type: 'goal',
        id: (goal._id as Types.ObjectId).toString(),
        title: goal.title,
        subtitle: `Goal · ${goal.status.replace('_', ' ')} · ${goal.progress}% done`,
        link: '/goals',
        tags: goal.tags?.slice(0, 3),
      })
    }
  }

  const total = results.length
  const skip = (page - 1) * pageSize
  const paginated = results.slice(skip, skip + pageSize)

  return { results: paginated, total, query, type }
}

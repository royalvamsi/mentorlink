import Report from '../models/Report'
import User from '../models/User'
import { Post, Comment } from '../models/Forum'
import { Types } from 'mongoose'
import type { ReportTargetType, ReportReason, ReportStatus } from '../models/Report'

export class AdminError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message); this.name = 'AdminError'
  }
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function submitReport(
  reporterId: string,
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason,
  description?: string
) {
  if (!Types.ObjectId.isValid(targetId)) throw new AdminError(400, 'Invalid target ID')
  try {
    return await Report.create({
      reporterId: new Types.ObjectId(reporterId),
      targetType,
      targetId: new Types.ObjectId(targetId),
      reason,
      description,
    })
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) throw new AdminError(409, 'You have already reported this content')
    throw err
  }
}

export async function getReports(status?: string, page = 1, pageSize = 20) {
  const filter: Record<string, unknown> = {}
  if (status) filter['status'] = status
  const skip = (page - 1) * pageSize
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporterId', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip).limit(pageSize).lean(),
    Report.countDocuments(filter),
  ])
  return { reports, total, page, totalPages: Math.ceil(total / pageSize) }
}

export async function resolveReport(
  reportId: string,
  adminId: string,
  status: ReportStatus,
  resolutionNote?: string
) {
  const report = await Report.findById(reportId)
  if (!report) throw new AdminError(404, 'Report not found')
  report.status = status
  report.resolvedBy = new Types.ObjectId(adminId)
  report.resolutionNote = resolutionNote
  report.resolvedAt = new Date()
  await report.save()
  return report
}

// ─── Admin User Management ────────────────────────────────────────────────────

export async function listUsers(page = 1, pageSize = 30, search?: string) {
  const filter: Record<string, unknown> = {}
  if (search) filter['$or'] = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
  const skip = (page - 1) * pageSize
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    User.countDocuments(filter),
  ])
  return { users, total, page, totalPages: Math.ceil(total / pageSize) }
}

export async function updateUserRole(userId: string, role: string) {
  const user = await User.findById(userId)
  if (!user) throw new AdminError(404, 'User not found')
  const validRoles = ['JUNIOR', 'SENIOR', 'ALUMNI', 'ADMIN']
  if (!validRoles.includes(role)) throw new AdminError(400, 'Invalid role')
  user.role = role as 'JUNIOR' | 'SENIOR' | 'ALUMNI' | 'ADMIN'
  await user.save()
  return user
}

// ─── Content Removal ─────────────────────────────────────────────────────────

export async function removePost(postId: string) {
  const post = await Post.findById(postId)
  if (!post) throw new AdminError(404, 'Post not found')
  await post.deleteOne()
  await Comment.deleteMany({ postId: post._id })
}

export async function removeComment(commentId: string) {
  const comment = await Comment.findById(commentId)
  if (!comment) throw new AdminError(404, 'Comment not found')
  await comment.deleteOne()
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [totalUsers, totalReports, pendingReports, totalPosts] = await Promise.all([
    User.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ status: 'PENDING' }),
    Post.countDocuments(),
  ])
  const roleBreakdown = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
  return { totalUsers, totalReports, pendingReports, totalPosts, roleBreakdown }
}

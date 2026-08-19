import Goal from '../models/Goal'
import { Types } from 'mongoose'
import type { GoalStatus, IMilestone } from '../models/Goal'

export class GoalError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message); this.name = 'GoalError'
  }
}

function computeProgress(milestones: IMilestone[]): number {
  if (!milestones.length) return 0
  return Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
}

export async function createGoal(
  userId: string,
  data: { title: string; description?: string; targetDate?: string; milestones?: { title: string; dueDate?: string }[]; tags?: string[]; mentorshipId?: string }
) {
  const milestones = (data.milestones ?? []).map(m => ({
    title: m.title, completed: false, dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
  }))
  return Goal.create({
    userId: new Types.ObjectId(userId),
    mentorshipId: data.mentorshipId ? new Types.ObjectId(data.mentorshipId) : undefined,
    title: data.title,
    description: data.description,
    targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    milestones,
    tags: data.tags ?? [],
    progress: 0,
  })
}

export async function getGoals(userId: string, status?: string) {
  const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) }
  if (status) filter['status'] = status
  return Goal.find(filter).sort({ createdAt: -1 }).lean()
}

export async function getGoalById(id: string, userId: string) {
  const goal = await Goal.findById(id).lean()
  if (!goal) throw new GoalError(404, 'Goal not found')
  if (goal.userId.toString() !== userId) throw new GoalError(403, 'Access denied')
  return goal
}

export async function updateGoal(id: string, userId: string, data: { title?: string; description?: string; status?: string; targetDate?: string; tags?: string[] }) {
  const goal = await Goal.findById(id)
  if (!goal) throw new GoalError(404, 'Goal not found')
  if (goal.userId.toString() !== userId) throw new GoalError(403, 'Access denied')
  if (data.title) goal.title = data.title
  if (data.description !== undefined) goal.description = data.description
  if (data.status) {
    goal.status = data.status as GoalStatus
    if (data.status === 'COMPLETED') goal.completedAt = new Date()
  }
  if (data.targetDate) goal.targetDate = new Date(data.targetDate)
  if (data.tags) goal.tags = data.tags
  await goal.save()
  return goal
}

export async function toggleMilestone(goalId: string, milestoneId: string, userId: string) {
  const goal = await Goal.findById(goalId)
  if (!goal) throw new GoalError(404, 'Goal not found')
  if (goal.userId.toString() !== userId) throw new GoalError(403, 'Access denied')
  const ms = goal.milestones.find(m => String(m._id) === milestoneId)
  if (!ms) throw new GoalError(404, 'Milestone not found')
  ms.completed = !ms.completed
  ms.completedAt = ms.completed ? new Date() : undefined
  goal.progress = computeProgress(goal.milestones)
  // Auto-complete goal if all milestones done
  if (goal.milestones.length > 0 && goal.milestones.every(m => m.completed)) {
    goal.status = 'COMPLETED'
    goal.completedAt = new Date()
  }
  await goal.save()
  return goal
}

export async function addMilestone(goalId: string, userId: string, title: string, dueDate?: string) {
  const goal = await Goal.findById(goalId)
  if (!goal) throw new GoalError(404, 'Goal not found')
  if (goal.userId.toString() !== userId) throw new GoalError(403, 'Access denied')
  goal.milestones.push({ title, completed: false, dueDate: dueDate ? new Date(dueDate) : undefined })
  goal.progress = computeProgress(goal.milestones)
  await goal.save()
  return goal
}

export async function deleteGoal(id: string, userId: string) {
  const goal = await Goal.findById(id)
  if (!goal) throw new GoalError(404, 'Goal not found')
  if (goal.userId.toString() !== userId) throw new GoalError(403, 'Access denied')
  await goal.deleteOne()
}

import { Request, Response, NextFunction } from 'express'
import { createGoal, getGoals, getGoalById, updateGoal, toggleMilestone, addMilestone, deleteGoal, GoalError } from '../services/goal.service'

function handleErr(err: unknown, res: Response, next: NextFunction) {
  if (err instanceof GoalError) { res.status(err.statusCode).json({ status: 'error', message: err.message }); return }
  next(err)
}

export async function listGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query as { status?: string }
    const data = await getGoals(req.user!.userId, status)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getGoalById(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function postGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title } = req.body as { title?: string }
    if (!title) { res.status(400).json({ status: 'error', message: 'title required' }); return }
    const data = await createGoal(req.user!.userId, req.body as Parameters<typeof createGoal>[1])
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function patchGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await updateGoal(req.params['id'] as string, req.user!.userId, req.body as Parameters<typeof updateGoal>[2])
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function removeGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteGoal(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', message: 'Goal deleted' })
  } catch (err) { handleErr(err, res, next) }
}

export async function checkMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await toggleMilestone(req.params['id'] as string, req.params['milestoneId'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function postMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, dueDate } = req.body as { title?: string; dueDate?: string }
    if (!title) { res.status(400).json({ status: 'error', message: 'title required' }); return }
    const data = await addMilestone(req.params['id'] as string, req.user!.userId, title, dueDate)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

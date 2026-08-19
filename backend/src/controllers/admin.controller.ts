import { Request, Response, NextFunction } from 'express'
import {
  submitReport, getReports, resolveReport,
  listUsers, updateUserRole, removePost, removeComment,
  getAdminStats, AdminError,
} from '../services/admin.service'
import type { ReportReason, ReportStatus, ReportTargetType } from '../models/Report'

function handleErr(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof AdminError) { res.status(err.statusCode).json({ status: 'error', message: err.message }); return }
  next(err)
}

// ─── Reports (any authenticated user can submit) ─────────────────────────────

export async function createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetType, targetId, reason, description } = req.body as {
      targetType?: ReportTargetType; targetId?: string; reason?: ReportReason; description?: string
    }
    if (!targetType || !targetId || !reason) { res.status(400).json({ status: 'error', message: 'targetType, targetId and reason required' }); return }
    const data = await submitReport(req.user!.userId, targetType, targetId, reason, description)
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

// ─── Admin-only ──────────────────────────────────────────────────────────────

export async function listReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page } = req.query as { status?: string; page?: string }
    const data = await getReports(status, page ? Number(page) : 1)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function patchReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, resolutionNote } = req.body as { status?: ReportStatus; resolutionNote?: string }
    if (!status) { res.status(400).json({ status: 'error', message: 'status required' }); return }
    const data = await resolveReport(req.params['id'] as string, req.user!.userId, status, resolutionNote)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, search } = req.query as { page?: string; search?: string }
    const data = await listUsers(page ? Number(page) : 1, 30, search)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function patchUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body as { role?: string }
    if (!role) { res.status(400).json({ status: 'error', message: 'role required' }); return }
    const data = await updateUserRole(req.params['id'] as string, role)
    res.status(200).json({ status: 'success', data: { id: data.id, name: data.get('name'), role: data.get('role') } })
  } catch (err) { handleErr(err, res, next) }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removePost(req.params['id'] as string)
    res.status(200).json({ status: 'success', message: 'Post removed' })
  } catch (err) { handleErr(err, res, next) }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeComment(req.params['id'] as string)
    res.status(200).json({ status: 'success', message: 'Comment removed' })
  } catch (err) { handleErr(err, res, next) }
}

export async function adminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAdminStats()
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

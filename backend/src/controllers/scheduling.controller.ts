import { Request, Response, NextFunction } from 'express'
import {
  createAvailability, getMentorAvailability, updateAvailability, deleteAvailability,
  createBooking, getBookings, getBookingById, updateBookingStatus, SchedulingError,
} from '../services/scheduling.service'

function handleErr(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof SchedulingError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message })
    return
  }
  next(err)
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function addAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startTime, endTime } = req.body as { startTime: string; endTime: string }
    if (!startTime || !endTime) { res.status(400).json({ status: 'error', message: 'startTime and endTime required' }); return }
    const data = await createAvailability(req.user!.userId, new Date(startTime), new Date(endTime))
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function listAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const mentorId = req.params['mentorId'] as string
    const data = await getMentorAvailability(mentorId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function editAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startTime, endTime } = req.body as { startTime: string; endTime: string }
    if (!startTime || !endTime) { res.status(400).json({ status: 'error', message: 'startTime and endTime required' }); return }
    const data = await updateAvailability(req.params['id'] as string, req.user!.userId, new Date(startTime), new Date(endTime))
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function removeAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteAvailability(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', message: 'Slot deleted' })
  } catch (err) { handleErr(err, res, next) }
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function bookSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { availabilityId, notes } = req.body as { availabilityId: string; notes?: string }
    if (!availabilityId) { res.status(400).json({ status: 'error', message: 'availabilityId required' }); return }
    const data = await createBooking(req.user!.userId, availabilityId, notes)
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = (req.query['role'] as string) || 'all'
    const data = await getBookings(req.user!.userId, role as 'mentor' | 'mentee' | 'all')
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getBookingById(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function patchBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, cancellationReason } = req.body as { status: string; cancellationReason?: string }
    if (!status) { res.status(400).json({ status: 'error', message: 'status required' }); return }
    const data = await updateBookingStatus(
      req.params['id'] as string, req.user!.userId, req.user!.role, status, cancellationReason
    )
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

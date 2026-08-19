import { Request, Response, NextFunction } from 'express'
import { getMyProfile, updateMyProfile, getPublicProfile, ProfileServiceError } from '../services/profile.service'

function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof ProfileServiceError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message })
    return
  }
  next(err)
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMyProfile(req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await updateMyProfile(req.user!.userId, req.body)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

export async function getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getPublicProfile(req.params['userId'] as string)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleError(err, res, next) }
}

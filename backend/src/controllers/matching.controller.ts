import { Request, Response, NextFunction } from 'express'
import { getMatchedMentors } from '../services/matching.service'

export async function getMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query['limit'] ? Number(req.query['limit']) : 10
    const data = await getMatchedMentors(req.user!.userId, Math.min(limit, 20))
    res.status(200).json({ status: 'success', data })
  } catch (err) { next(err) }
}

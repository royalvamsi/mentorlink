import { Request, Response, NextFunction } from 'express'
import { getMentors, getMentorById } from '../services/mentor.service'

export async function listMentors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, skills, department, page, limit } = req.query
    const result = await getMentors({
      search: search as string | undefined,
      skills: skills ? String(skills).split(',').map((s) => s.trim()) : undefined,
      department: department as string | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    })
    res.status(200).json({ status: 'success', data: result })
  } catch (err) { next(err) }
}

export async function getMentor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMentorById(req.params['id'] as string)
    res.status(200).json({ status: 'success', data })
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    if (e.statusCode === 404) {
      res.status(404).json({ status: 'error', message: e.message })
      return
    }
    next(err)
  }
}

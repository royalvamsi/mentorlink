import { Request, Response, NextFunction } from 'express'
import { globalSearch, type SearchType } from '../services/search.service'

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query['q'] as string | undefined) ?? ''
    const type = ((req.query['type'] as string | undefined) ?? 'all') as SearchType
    const page = req.query['page'] ? Number(req.query['page']) : 1

    const validTypes: SearchType[] = ['all', 'mentors', 'posts', 'goals']
    if (!validTypes.includes(type)) {
      res.status(400).json({ status: 'error', message: `type must be one of: ${validTypes.join(', ')}` })
      return
    }

    if (!q.trim()) {
      res.status(200).json({ status: 'success', data: { results: [], total: 0, query: q, type } })
      return
    }

    const data = await globalSearch(q, req.user!.userId, type, page)
    res.status(200).json({ status: 'success', data })
  } catch (err) { next(err) }
}

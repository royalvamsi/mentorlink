import { Request, Response, NextFunction } from 'express'
import {
  getPosts, getPostById, createPost, updatePost, deletePost, toggleUpvotePost,
  getComments, addComment, deleteComment, ForumError,
} from '../services/forum.service'

function handleErr(err: unknown, res: Response, next: NextFunction) {
  if (err instanceof ForumError) { res.status(err.statusCode).json({ status: 'error', message: err.message }); return }
  next(err)
}

// Posts
export async function listPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search, page } = req.query as { category?: string; search?: string; page?: string }
    const data = await getPosts({ category, search, page: page ? Number(page) : 1 })
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getPostById(req.params['id'] as string)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function postCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, body, category = 'GENERAL', tags = [] } = req.body as { title: string; body: string; category?: string; tags?: string[] }
    if (!title || !body) { res.status(400).json({ status: 'error', message: 'title and body required' }); return }
    const data = await createPost(req.user!.userId, title, body, category, tags)
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function postUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await updatePost(req.params['id'] as string, req.user!.userId, req.body as { title?: string; body?: string; category?: string; tags?: string[] })
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function postDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deletePost(req.params['id'] as string, req.user!.userId, req.user!.role)
    res.status(200).json({ status: 'success', message: 'Post deleted' })
  } catch (err) { handleErr(err, res, next) }
}

export async function upvotePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await toggleUpvotePost(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

// Comments
export async function listComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getComments(req.params['postId'] as string)
    res.status(200).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function commentCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { body, parentCommentId } = req.body as { body: string; parentCommentId?: string }
    if (!body) { res.status(400).json({ status: 'error', message: 'body required' }); return }
    const data = await addComment(req.params['postId'] as string, req.user!.userId, body, parentCommentId)
    res.status(201).json({ status: 'success', data })
  } catch (err) { handleErr(err, res, next) }
}

export async function commentDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteComment(req.params['id'] as string, req.user!.userId, req.user!.role)
    res.status(200).json({ status: 'success', message: 'Comment deleted' })
  } catch (err) { handleErr(err, res, next) }
}

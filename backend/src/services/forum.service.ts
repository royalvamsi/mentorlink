import { Post, Comment, type PostCategory } from '../models/Forum'
import { Types } from 'mongoose'

export class ForumError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'ForumError'
  }
}

const PAGE_SIZE = 20

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(opts: { category?: string; search?: string; page?: number }) {
  const { category, search, page = 1 } = opts
  const filter: Record<string, unknown> = {}
  if (category) filter['category'] = category
  if (search) filter['$text'] = { $search: search }
  const skip = (page - 1) * PAGE_SIZE
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('authorId', 'name role')
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Post.countDocuments(filter),
  ])
  return { posts, total, page, totalPages: Math.ceil(total / PAGE_SIZE) }
}

export async function getPostById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ForumError(400, 'Invalid post ID')
  }
  const post = await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
    .populate('authorId', 'name role')
    .lean()
  if (!post) throw new ForumError(404, 'Post not found')
  return post
}

export async function createPost(authorId: string, title: string, body: string, category: string, tags: string[]) {
  if (!title || !title.trim() || !body || !body.trim()) {
    throw new ForumError(400, 'Title and body are required')
  }
  const post = await Post.create({
    authorId: new Types.ObjectId(authorId),
    title: title.trim(),
    body: body.trim(),
    category: category as PostCategory,
    tags: tags ?? [],
  })
  return Post.findById((post as { _id: Types.ObjectId })._id).populate('authorId', 'name role').lean()
}

export async function updatePost(
  id: string,
  authorId: string,
  updates: { title?: string; body?: string; category?: string; tags?: string[] }
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ForumError(400, 'Invalid post ID')
  }
  const post = await Post.findById(id)
  if (!post) throw new ForumError(404, 'Post not found')
  if (post.authorId.toString() !== authorId) throw new ForumError(403, 'Forbidden')
  if (post.locked) throw new ForumError(400, 'Post is locked')
  if (updates.title) post.title = updates.title.trim()
  if (updates.body) post.body = updates.body.trim()
  if (updates.category) post.category = updates.category as PostCategory
  if (updates.tags) post.tags = updates.tags
  await post.save()
  return post
}

export async function deletePost(id: string, userId: string, userRole: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ForumError(400, 'Invalid post ID')
  }
  const post = await Post.findById(id)
  if (!post) throw new ForumError(404, 'Post not found')
  if (post.authorId.toString() !== userId && userRole !== 'ADMIN') throw new ForumError(403, 'Forbidden')
  await post.deleteOne()
  await Comment.deleteMany({ postId: post._id })
}

export async function toggleUpvotePost(id: string, userId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ForumError(400, 'Invalid post ID')
  }
  const post = await Post.findById(id)
  if (!post) throw new ForumError(404, 'Post not found')
  const oid = new Types.ObjectId(userId)
  const idx = post.upvotes.findIndex((u) => u.equals(oid))
  if (idx === -1) post.upvotes.push(oid)
  else post.upvotes.splice(idx, 1)
  await post.save()
  return { upvotes: post.upvotes.length }
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(postId: string) {
  if (!Types.ObjectId.isValid(postId)) {
    throw new ForumError(400, 'Invalid post ID')
  }
  return Comment.find({ postId: new Types.ObjectId(postId) })
    .populate('authorId', 'name role')
    .sort({ createdAt: 1 })
    .lean()
}

export async function addComment(postId: string, authorId: string, body: string, parentCommentId?: string) {
  if (!Types.ObjectId.isValid(postId)) {
    throw new ForumError(400, 'Invalid post ID')
  }
  if (!body || !body.trim()) {
    throw new ForumError(400, 'Comment body is required')
  }
  const post = await Post.findById(postId)
  if (!post) throw new ForumError(404, 'Post not found')
  if (post.locked) throw new ForumError(400, 'Post is locked')
  const comment = await Comment.create({
    postId: new Types.ObjectId(postId),
    authorId: new Types.ObjectId(authorId),
    body: body.trim(),
    parentCommentId: parentCommentId && Types.ObjectId.isValid(parentCommentId) ? new Types.ObjectId(parentCommentId) : undefined,
  })
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
  return Comment.findById(comment._id).populate('authorId', 'name role').lean()
}

export async function deleteComment(id: string, userId: string, userRole: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ForumError(400, 'Invalid comment ID')
  }
  const comment = await Comment.findById(id)
  if (!comment) throw new ForumError(404, 'Comment not found')
  if (comment.authorId.toString() !== userId && userRole !== 'ADMIN') throw new ForumError(403, 'Forbidden')
  await comment.deleteOne()
  await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } })
}

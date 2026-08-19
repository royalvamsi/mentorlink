import { Post, Comment, type PostCategory } from '../models/Forum'
import { Types } from 'mongoose'

export class ForumError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message); this.name = 'ForumError'
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
      .skip(skip).limit(PAGE_SIZE).lean(),
    Post.countDocuments(filter),
  ])
  return { posts, total, page, totalPages: Math.ceil(total / PAGE_SIZE) }
}

export async function getPostById(id: string) {
  const post = await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
    .populate('authorId', 'name role')
    .lean()
  if (!post) throw new ForumError(404, 'Post not found')
  return post
}

export async function createPost(authorId: string, title: string, body: string, category: string, tags: string[]) {
  const post = await Post.create({ authorId: new Types.ObjectId(authorId), title, body, category: category as PostCategory, tags })
  return Post.findById((post as { _id: Types.ObjectId })._id).populate('authorId', 'name role').lean()
}

export async function updatePost(id: string, authorId: string, updates: { title?: string; body?: string; category?: string; tags?: string[] }) {
  const post = await Post.findById(id)
  if (!post) throw new ForumError(404, 'Post not found')
  if (post.authorId.toString() !== authorId) throw new ForumError(403, 'Forbidden')
  if (post.locked) throw new ForumError(400, 'Post is locked')
  Object.assign(post, updates)
  await post.save()
  return post
}

export async function deletePost(id: string, userId: string, userRole: string) {
  const post = await Post.findById(id)
  if (!post) throw new ForumError(404, 'Post not found')
  if (post.authorId.toString() !== userId && userRole !== 'ADMIN') throw new ForumError(403, 'Forbidden')
  await post.deleteOne()
  await Comment.deleteMany({ postId: post._id })
}

export async function toggleUpvotePost(id: string, userId: string) {
  const post = await Post.findById(id)
  if (!post) throw new ForumError(404, 'Post not found')
  const oid = new Types.ObjectId(userId)
  const idx = post.upvotes.findIndex(u => u.equals(oid))
  if (idx === -1) post.upvotes.push(oid)
  else post.upvotes.splice(idx, 1)
  await post.save()
  return { upvotes: post.upvotes.length }
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function getComments(postId: string) {
  return Comment.find({ postId: new Types.ObjectId(postId) })
    .populate('authorId', 'name role')
    .sort({ createdAt: 1 })
    .lean()
}

export async function addComment(postId: string, authorId: string, body: string, parentCommentId?: string) {
  const post = await Post.findById(postId)
  if (!post) throw new ForumError(404, 'Post not found')
  if (post.locked) throw new ForumError(400, 'Post is locked')
  const comment = await Comment.create({
    postId: new Types.ObjectId(postId),
    authorId: new Types.ObjectId(authorId),
    body,
    parentCommentId: parentCommentId ? new Types.ObjectId(parentCommentId) : undefined,
  })
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
  return Comment.findById(comment._id).populate('authorId', 'name role').lean()
}

export async function deleteComment(id: string, userId: string, userRole: string) {
  const comment = await Comment.findById(id)
  if (!comment) throw new ForumError(404, 'Comment not found')
  if (comment.authorId.toString() !== userId && userRole !== 'ADMIN') throw new ForumError(403, 'Forbidden')
  await comment.deleteOne()
  await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } })
}

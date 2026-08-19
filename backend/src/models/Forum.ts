import { Schema, model, Document, Types } from 'mongoose'

// ─── Forum Post ───────────────────────────────────────────────────────────────

export type PostCategory = 'GENERAL' | 'CAREER' | 'ACADEMICS' | 'RESOURCES' | 'EVENTS' | 'HELP'

export interface IPost extends Document {
  authorId: Types.ObjectId
  title: string
  body: string
  category: PostCategory
  tags: string[]
  pinned: boolean
  locked: boolean
  upvotes: Types.ObjectId[]
  viewCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>(
  {
    authorId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:        { type: String, required: true, trim: true, maxlength: 200 },
    body:         { type: String, required: true, trim: true, maxlength: 10000 },
    category:     { type: String, enum: ['GENERAL', 'CAREER', 'ACADEMICS', 'RESOURCES', 'EVENTS', 'HELP'], default: 'GENERAL', index: true },
    tags:         [{ type: String, trim: true, maxlength: 30 }],
    pinned:       { type: Boolean, default: false, index: true },
    locked:       { type: Boolean, default: false },
    upvotes:      [{ type: Schema.Types.ObjectId, ref: 'User' }],
    viewCount:    { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

postSchema.index({ title: 'text', body: 'text', tags: 'text' })
postSchema.index({ createdAt: -1 })

export const Post = model<IPost>('Post', postSchema)

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface IComment extends Document {
  postId: Types.ObjectId
  authorId: Types.ObjectId
  body: string
  upvotes: Types.ObjectId[]
  parentCommentId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    postId:          { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    authorId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body:            { type: String, required: true, trim: true, maxlength: 5000 },
    upvotes:         [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true }
)

export const Comment = model<IComment>('Comment', commentSchema)

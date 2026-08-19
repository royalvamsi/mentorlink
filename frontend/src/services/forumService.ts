import { api } from './authService'

export const CATEGORIES = ['GENERAL', 'CAREER', 'ACADEMICS', 'RESOURCES', 'EVENTS', 'HELP'] as const
export type PostCategory = typeof CATEGORIES[number]

export interface PostAuthor {
  _id: string
  name: string
  role: string
}

export interface Post {
  _id: string
  authorId: PostAuthor
  title: string
  body: string
  category: PostCategory
  tags: string[]
  pinned: boolean
  locked: boolean
  upvotes: string[]
  viewCount: number
  commentCount: number
  createdAt: string
}

export interface Comment {
  _id: string
  postId: string
  authorId: PostAuthor
  body: string
  upvotes: string[]
  parentCommentId?: string
  createdAt: string
}

export const forumService = {
  async getPosts(opts: { category?: string; search?: string; page?: number }) {
    const res = await api.get<{ status: string; data: { posts: Post[]; total: number; page: number; totalPages: number } }>('/api/forum', { params: opts })
    return res.data.data
  },
  async getPost(id: string) {
    const res = await api.get<{ status: string; data: Post }>(`/api/forum/${id}`)
    return res.data.data
  },
  async createPost(data: { title: string; body: string; category: PostCategory; tags: string[] }) {
    const res = await api.post<{ status: string; data: Post }>('/api/forum', data)
    return res.data.data
  },
  async upvote(id: string) {
    const res = await api.post<{ status: string; data: { upvotes: number } }>(`/api/forum/${id}/upvote`)
    return res.data.data
  },
  async deletePost(id: string) { await api.delete(`/api/forum/${id}`) },

  async getComments(postId: string) {
    const res = await api.get<{ status: string; data: Comment[] }>(`/api/forum/${postId}/comments`)
    return res.data.data
  },
  async addComment(postId: string, body: string, parentCommentId?: string) {
    const res = await api.post<{ status: string; data: Comment }>(`/api/forum/${postId}/comments`, { body, parentCommentId })
    return res.data.data
  },
  async deleteComment(id: string) { await api.delete(`/api/forum/comments/${id}`) },
}

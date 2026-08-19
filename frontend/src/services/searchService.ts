import { api } from './authService'

export type SearchType = 'all' | 'mentors' | 'posts' | 'goals'

export interface SearchResult {
  type: 'user' | 'post' | 'goal'
  id: string
  title: string
  subtitle?: string
  link: string
  tags?: string[]
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  type: SearchType
}

export const searchService = {
  async search(q: string, type: SearchType = 'all', page = 1): Promise<SearchResponse> {
    if (!q.trim()) return { results: [], total: 0, query: q, type }
    const res = await api.get<{ status: string; data: SearchResponse }>('/api/search', {
      params: { q, type, page },
    })
    return res.data.data
  },
}

import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forumService, type Post, CATEGORIES, type PostCategory } from '../services/forumService'
import axios from 'axios'

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-slate-700 text-slate-300',
  CAREER: 'bg-blue-500/20 text-blue-300',
  ACADEMICS: 'bg-green-500/20 text-green-300',
  RESOURCES: 'bg-amber-500/20 text-amber-300',
  EVENTS: 'bg-purple-500/20 text-purple-300',
  HELP: 'bg-red-500/20 text-red-300',
}

function fmt(d: string) { return new Date(d).toLocaleDateString([], { dateStyle: 'medium' }) }

export default function ForumPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create Post modal
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newCategory, setNewCategory] = useState<PostCategory>('GENERAL')
  const [newTags, setNewTags] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await forumService.getPosts({ category: category || undefined, search: search || undefined, page })
      setPosts(data.posts); setTotal(data.total); setTotalPages(data.totalPages)
    } catch { setError('Failed to load posts') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [category, search, page])

  async function handleCreate(e: FormEvent) {
    e.preventDefault(); setCreating(true); setCreateError('')
    try {
      const post = await forumService.createPost({
        title: newTitle, body: newBody, category: newCategory,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      })
      if (post) navigate(`/forum/${post._id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) setCreateError(err.response?.data?.message ?? 'Failed to create post')
    } finally { setCreating(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/mentors" className="hover:text-white">Mentors</Link>
          </nav>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Community Forum</h1>
            <p className="text-sm text-slate-400 mt-1">{total} discussion{total !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">+ New Post</button>
        </div>

        {/* Create Post Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-white mb-4">Create Post</h2>
              {createError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{createError}</div>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Title</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required maxLength={200}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What's your question or topic?" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value as PostCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Body</label>
                  <textarea value={newBody} onChange={e => setNewBody(e.target.value)} required rows={5} maxLength={10000}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Share your thoughts…" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Tags (comma-separated)</label>
                  <input value={newTags} onChange={e => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. internship, resume, CS" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition">Cancel</button>
                  <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition">
                    {creating ? 'Posting…' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1) }} className="flex gap-2 flex-1 min-w-48">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search discussions…" />
            <button type="submit" className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-sm transition">Search</button>
          </form>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setCategory(''); setPage(1) }} className={`px-3 py-2 rounded-lg text-xs font-medium transition ${!category ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => { setCategory(category === c ? '' : c); setPage(1) }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition capitalize ${category === c ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-medium text-slate-400">No posts yet</p>
            <p className="text-sm mt-1">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Link key={post._id} to={`/forum/${post._id}`} className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {post.pinned && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">📌 Pinned</span>}
                      {post.locked && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">🔒 Locked</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category]}`}>{post.category}</span>
                    </div>
                    <h2 className="font-semibold text-white group-hover:text-indigo-300 transition truncate">{post.title}</h2>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{post.body}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>by <span className="text-slate-400">{post.authorId.name}</span></span>
                      <span>{fmt(post.createdAt)}</span>
                      <span>👁 {post.viewCount}</span>
                      <span>💬 {post.commentCount}</span>
                      <span>⬆ {post.upvotes.length}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {post.tags.map(t => <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">#{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 text-sm transition">← Prev</button>
            <span className="px-4 py-2 text-slate-400 text-sm">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 text-sm transition">Next →</button>
          </div>
        )}
      </main>
    </div>
  )
}

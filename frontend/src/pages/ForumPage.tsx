import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forumService, type Post, CATEGORIES, type PostCategory } from '../services/forumService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  Eye,
  Pin,
  Lock,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:   'bg-slate-100 text-slate-700 border-slate-200',
  CAREER:    'bg-blue-50 text-blue-700 border-blue-200',
  ACADEMICS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESOURCES: 'bg-amber-50 text-amber-800 border-amber-200',
  EVENTS:    'bg-purple-50 text-purple-700 border-purple-200',
  HELP:      'bg-rose-50 text-rose-700 border-rose-200',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString([], { dateStyle: 'medium' })
}

export default function ForumPage() {
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
      setPosts(data.posts)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [category, search, page])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const post = await forumService.createPost({
        title: newTitle,
        body: newBody,
        category: newCategory,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      })
      if (post) navigate(`/forum/${post._id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) setCreateError(err.response?.data?.message ?? 'Failed to create post')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <MessageSquare className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Campus Discussions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Community Forum</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{total} active discussion{total !== 1 ? 's' : ''} across all batches.</p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Create Discussion Post</h2>
              <p className="text-xs text-slate-500 mb-5">Share career questions, academic queries, or interview advice with the community.</p>

              {createError && (
                <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Post Title *</label>
                  <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. How do I prepare for technical interviews as a sophomore?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as PostCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Post Content *</label>
                  <textarea
                    value={newBody}
                    onChange={e => setNewBody(e.target.value)}
                    required
                    rows={5}
                    maxLength={10000}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                    placeholder="Provide details, background, or specific questions..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags (Comma-separated)</label>
                  <input
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. interview, dsa, resume, faang"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 transition shadow-xs"
                  >
                    {creating ? 'Publishing...' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
            className="flex-1 relative"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              placeholder="Search discussions by topic or keyword..."
            />
          </form>

          <div className="flex gap-1.5 flex-wrap items-center">
            <button
              onClick={() => { setCategory(''); setPage(1) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                !category
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setCategory(category === c ? '' : c); setPage(1) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  category === c
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">No discussions found</p>
            <p className="text-xs text-slate-500 mb-5">
              {search || category ? 'Try adjusting your search filters or category selection.' : 'Be the first student or mentor to start a conversation!'}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              Start First Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {posts.map(post => (
              <Link
                key={post._id}
                to={`/forum/${post._id}`}
                className="block bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0 mt-0.5">
                    {post.authorId?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {post.pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {post.locked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? 'bg-slate-100 text-slate-700'}`}>
                        {post.category}
                      </span>
                    </div>

                    <h2 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors mb-1">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {post.body}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-700">
                        {post.authorId?.name ?? 'User'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {fmt(post.createdAt)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.viewCount} views
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.commentCount} replies
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.upvotes.length}
                      </span>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {post.tags.map(t => (
                          <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            #{t}
                          </span>
                        ))}
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
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 text-xs font-bold transition shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>
            <span className="px-4 py-2 text-slate-500 text-xs font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 text-xs font-bold transition shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}


import { useState, useEffect, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forumService, type Post, type Comment } from '../services/forumService'
import axios from 'axios'

function fmt(d: string) { return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) }

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-slate-700 text-slate-300',
  CAREER: 'bg-blue-500/20 text-blue-300',
  ACADEMICS: 'bg-green-500/20 text-green-300',
  RESOURCES: 'bg-amber-500/20 text-amber-300',
  EVENTS: 'bg-purple-500/20 text-purple-300',
  HELP: 'bg-red-500/20 text-red-300',
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const { user, logout } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [commentBody, setCommentBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')

  async function load() {
    if (!id) return
    try {
      const [p, c] = await Promise.all([forumService.getPost(id), forumService.getComments(id)])
      setPost(p); setComments(c)
    } catch { setError('Failed to load post') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  async function handleUpvote() {
    if (!post) return
    try {
      await forumService.upvote(post._id)
      await load()
    } catch { /* ignore */ }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!commentBody.trim() || !id) return
    setSubmitting(true); setCommentError('')
    try {
      await forumService.addComment(id, commentBody, replyTo ?? undefined)
      setCommentBody(''); setReplyTo(null)
      const updated = await forumService.getComments(id)
      setComments(updated)
    } catch (err) {
      if (axios.isAxiosError(err)) setCommentError(err.response?.data?.message ?? 'Failed')
    } finally { setSubmitting(false) }
  }

  async function handleDeleteComment(commentId: string) {
    try { await forumService.deleteComment(commentId); setComments(prev => prev.filter(c => c._id !== commentId)) }
    catch { /* ignore */ }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (error || !post) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">{error || 'Post not found'}</div>

  const isAuthor = post.authorId._id === user?.id
  const hasUpvoted = post.upvotes.includes(user?.id ?? '')

  const topComments = comments.filter(c => !c.parentCommentId)
  const replies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId)

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
          <Link to="/forum" className="text-sm text-slate-400 hover:text-white">← Forum</Link>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Post */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.pinned && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">📌 Pinned</span>}
            {post.locked && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">🔒 Locked</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category]}`}>{post.category}</span>
            {post.tags.map(t => <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">#{t}</span>)}
          </div>
          <h1 className="text-xl font-bold text-white mb-3">{post.title}</h1>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">{post.body}</p>
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">{post.authorId.name[0]}</div>
                <span className="text-slate-400">{post.authorId.name}</span>
              </div>
              <span>{fmt(post.createdAt)}</span>
              <span>👁 {post.viewCount}</span>
              <span>💬 {post.commentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              {(isAuthor || user?.role === 'ADMIN') && (
                <button
                  onClick={async () => {
                    if (window.confirm('Delete this post?')) {
                      await forumService.deletePost(post._id)
                      window.location.href = '/forum'
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
                >
                  Delete Post
                </button>
              )}
              <button onClick={handleUpvote} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${hasUpvoted ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                ⬆ {post.upvotes.length}
              </button>
            </div>
          </div>
        </article>

        {/* Comments */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>

          {!post.locked && (
            <form onSubmit={handleComment} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
              {replyTo && (
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                  <span>Replying to comment</span>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-300">✕ Cancel</button>
                </div>
              )}
              {commentError && <div className="mb-2 text-xs text-red-400">{commentError}</div>}
              <textarea value={commentBody} onChange={e => setCommentBody(e.target.value)} required rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
                placeholder="Write a comment…" />
              <button type="submit" disabled={submitting || !commentBody.trim()} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 transition">
                {submitting ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {topComments.map(comment => (
              <div key={comment._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center font-bold text-white text-xs">{comment.authorId.name[0]}</div>
                    <div>
                      <span className="text-sm font-medium text-white">{comment.authorId.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{fmt(comment.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!post.locked && <button onClick={() => setReplyTo(comment._id)} className="text-xs text-slate-400 hover:text-indigo-400 transition">Reply</button>}
                    {comment.authorId._id === user?.id && <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>}
                  </div>
                </div>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{comment.body}</p>

                {/* Nested replies */}
                {replies(comment._id).length > 0 && (
                  <div className="ml-6 mt-3 space-y-2 border-l border-slate-800 pl-4">
                    {replies(comment._id).map(reply => (
                      <div key={reply._id} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{reply.authorId.name}</span>
                            <span className="text-xs text-slate-500">{fmt(reply.createdAt)}</span>
                          </div>
                          {reply.authorId._id === user?.id && <button onClick={() => handleDeleteComment(reply._id)} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>}
                        </div>
                        <p className="text-slate-300 text-sm">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

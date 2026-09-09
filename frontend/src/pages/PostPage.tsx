import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forumService, type Post, type Comment } from '../services/forumService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  MessageSquare,
  ThumbsUp,
  Pin,
  Lock,
  ChevronLeft,
  Trash2,
  Reply,
  Send,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

function fmt(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:   'bg-slate-100 text-slate-700 border-slate-200',
  CAREER:    'bg-blue-50 text-blue-700 border-blue-200',
  ACADEMICS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RESOURCES: 'bg-amber-50 text-amber-800 border-amber-200',
  EVENTS:    'bg-purple-50 text-purple-700 border-purple-200',
  HELP:      'bg-rose-50 text-rose-700 border-rose-200',
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
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
      setPost(p)
      setComments(c)
    } catch {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

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
    setSubmitting(true)
    setCommentError('')
    try {
      await forumService.addComment(id, commentBody, replyTo ?? undefined)
      setCommentBody('')
      setReplyTo(null)
      const updated = await forumService.getComments(id)
      setComments(updated)
    } catch (err) {
      if (axios.isAxiosError(err)) setCommentError(err.response?.data?.message ?? 'Failed to submit comment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeletePost() {
    if (!id || !confirm('Are you sure you want to delete this discussion post?')) return
    try {
      await forumService.deletePost(id)
      navigate('/forum')
    } catch { /* ignore */ }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await forumService.deleteComment(commentId)
      await load()
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full shadow-xs">
            <p className="text-slate-600 mb-4 text-sm">{error || 'Post not found.'}</p>
            <button
              onClick={() => navigate('/forum')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
            >
              ← Back to forum
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAuthor = post.authorId._id === user?.id
  const hasUpvoted = post.upvotes.includes(user?.id ?? '')
  const topComments = comments.filter(c => !c.parentCommentId)
  const replies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to all discussions</span>
        </button>

        {/* Post Article */}
        <article className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {post.locked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? 'bg-slate-100 text-slate-700'}`}>
              {post.category}
            </span>
            {post.tags.map(t => (
              <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                #{t}
              </span>
            ))}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-6">
            {post.body}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-5 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
                {post.authorId?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs">{post.authorId?.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{fmt(post.createdAt)}</span>
                  <span>·</span>
                  <span>{post.viewCount} views</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isAuthor || user?.role === 'ADMIN') && (
                <button
                  onClick={handleDeletePost}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
              <button
                onClick={handleUpvote}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                  hasUpvoted
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Upvote · {post.upvotes.length}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {comments.length} Discussion Reply{comments.length !== 1 ? 'ies' : ''}
            </h2>
          </div>

          {!post.locked && (
            <form onSubmit={handleComment} className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
              {replyTo && (
                <div className="flex items-center justify-between mb-2 text-xs bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-indigo-700">
                  <span className="font-semibold">Replying to specific comment</span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}

              {commentError && (
                <div className="mb-3 text-xs text-rose-600 flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{commentError}</span>
                </div>
              )}

              <textarea
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
                placeholder="Share your perspective or ask a follow-up question..."
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !commentBody.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Post Reply'}</span>
                </button>
              </div>
            </form>
          )}

          {comments.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white border border-slate-200/80 rounded-3xl text-slate-400 text-xs shadow-xs">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 mb-1">No comments yet</p>
              <p className="text-slate-400">Be the first member to join this conversation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topComments.map(comment => (
                <div key={comment._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                        {comment.authorId?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{comment.authorId?.name}</div>
                        <div className="text-[10px] text-slate-400">{fmt(comment.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!post.locked && (
                        <button
                          onClick={() => setReplyTo(comment._id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition"
                        >
                          <Reply className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      )}
                      {comment.authorId?._id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ml-10">
                    {comment.body}
                  </p>

                  {/* Nested replies */}
                  {replies(comment._id).length > 0 && (
                    <div className="ml-10 mt-3 space-y-2 border-l-2 border-indigo-100 pl-3">
                      {replies(comment._id).map(reply => (
                        <div key={reply._id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{reply.authorId?.name}</span>
                              <span className="text-[10px] text-slate-400">{fmt(reply.createdAt)}</span>
                            </div>
                            {reply.authorId?._id === user?.id && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="text-slate-400 hover:text-rose-600 text-xs transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-slate-700 text-xs">{reply.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}


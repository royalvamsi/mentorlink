import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { feedbackService, type FeedbackItem, type FeedbackStats } from '../services/feedbackService'
import { schedulingService, type Booking } from '../services/schedulingService'
import axios from 'axios'

function StarRating({ value, onChange, readOnly }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star} type="button" disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`text-2xl transition ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= (hover || value) ? 'text-amber-400' : 'text-slate-600'
          }`}
        >★</button>
      ))}
    </div>
  )
}

function fmt(d: string) { return new Date(d).toLocaleDateString([], { dateStyle: 'medium' }) }

export default function FeedbackPage() {
  const { user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const bookingIdParam = searchParams.get('bookingId')

  const [tab, setTab] = useState<'received' | 'give' | 'given'>('received')
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [givenFeedback, setGivenFeedback] = useState<FeedbackItem[]>([])
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedBookingId, setSelectedBookingId] = useState(bookingIdParam ?? '')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      try {
        const [{ feedback, stats }, given, bookings] = await Promise.all([
          feedbackService.getUserFeedback(user.id),
          feedbackService.getSubmitted(),
          schedulingService.getBookings('all'),
        ])
        setMyFeedback(feedback); setStats(stats); setGivenFeedback(given)
        // Completed bookings without feedback already submitted
        const givenIds = new Set(given.map(f => f.bookingId._id))
        setPendingBookings(bookings.filter(b => b.status === 'COMPLETED' && !givenIds.has(b._id)))
      } catch { setError('Failed to load feedback') }
      finally { setLoading(false) }
    }
    load()
    if (bookingIdParam) setTab('give')
  }, [user?.id, bookingIdParam])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedBookingId) { setError('Please select a session'); return }
    if (rating === 0) { setError('Please select a rating'); return }
    setSubmitting(true); setError(''); setSuccess('')
    try {
      await feedbackService.submit(selectedBookingId, rating, comment || undefined, isPublic)
      setSuccess('Feedback submitted! Thank you.')
      setRating(0); setComment(''); setSelectedBookingId('')
      // Refresh
      const [{ feedback, stats }, given] = await Promise.all([
        feedbackService.getUserFeedback(user!.id),
        feedbackService.getSubmitted(),
      ])
      setMyFeedback(feedback); setStats(stats); setGivenFeedback(given)
      setPendingBookings(prev => prev.filter(b => b._id !== selectedBookingId))
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Submission failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/scheduling" className="hover:text-white">Scheduling</Link>
          </nav>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Feedback & Ratings</h1>
          {stats && stats.avgRating !== null && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating value={Math.round(stats.avgRating)} readOnly />
              <span className="text-amber-400 font-bold">{stats.avgRating}</span>
              <span className="text-slate-400 text-sm">({stats.count} review{stats.count !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          {(['received', 'give', 'given'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize transition border-b-2 ${
              tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}>
              {t === 'give' ? `Give Feedback${pendingBookings.length > 0 ? ` (${pendingBookings.length})` : ''}` : t === 'received' ? 'Received' : 'Given'}
            </button>
          ))}
        </div>

        {/* Received Tab */}
        {tab === 'received' && (
          myFeedback.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No feedback received yet.</div>
          ) : (
            <div className="space-y-4">
              {myFeedback.map(f => (
                <div key={f._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">{f.reviewerId.name[0]}</div>
                      <div>
                        <div className="font-medium text-white text-sm">{f.reviewerId.name}</div>
                        <div className="text-xs text-slate-400">{f.reviewerId.role} · {fmt(f.createdAt)}</div>
                      </div>
                    </div>
                    <StarRating value={f.rating} readOnly />
                  </div>
                  {f.comment && <p className="text-slate-300 text-sm ml-12 italic">"{f.comment}"</p>}
                </div>
              ))}
            </div>
          )
        )}

        {/* Give Feedback Tab */}
        {tab === 'give' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Submit Feedback</h2>
            {pendingBookings.length === 0 && !selectedBookingId ? (
              <p className="text-slate-400 text-sm">No completed sessions awaiting feedback. <Link to="/scheduling" className="text-indigo-400">View sessions</Link></p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Select Session</label>
                  <select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)} required
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Choose a session…</option>
                    {pendingBookings.map(b => {
                      const other = b.mentorId._id === user?.id ? b.menteeId : b.mentorId
                      return <option key={b._id} value={b._id}>Session with {other.name} — {fmt(b.startTime)}</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Comment (optional)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} maxLength={1000}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Share your experience…" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-indigo-600" />
                  <label htmlFor="isPublic" className="text-sm text-slate-300">Make this review public on their profile</label>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition">
                  {submitting ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Given Tab */}
        {tab === 'given' && (
          givenFeedback.length === 0 ? (
            <div className="text-center py-12 text-slate-500">You haven't submitted any feedback yet.</div>
          ) : (
            <div className="space-y-4">
              {givenFeedback.map(f => (
                <div key={f._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center font-bold text-white text-sm">{f.revieweeId.name[0]}</div>
                      <div>
                        <div className="font-medium text-white text-sm">Review for {f.revieweeId.name}</div>
                        <div className="text-xs text-slate-400">{fmt(f.createdAt)}</div>
                      </div>
                    </div>
                    <StarRating value={f.rating} readOnly />
                  </div>
                  {f.comment && <p className="text-slate-300 text-sm ml-12 italic">"{f.comment}"</p>}
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}

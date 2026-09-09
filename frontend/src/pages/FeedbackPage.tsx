import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { feedbackService, type FeedbackItem, type FeedbackStats } from '../services/feedbackService'
import { schedulingService, type Booking } from '../services/schedulingService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send
} from 'lucide-react'

function StarRating({ value, onChange, readOnly }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-100 text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString([], { dateStyle: 'medium' })
}

export default function FeedbackPage() {
  const { user } = useAuth()
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
        setMyFeedback(feedback)
        setStats(stats)
        setGivenFeedback(given)
        const givenIds = new Set(given.map((f) => f.bookingId._id))
        setPendingBookings(bookings.filter((b) => b.status === 'COMPLETED' && !givenIds.has(b._id)))
      } catch {
        setError('Failed to load reviews and ratings')
      } finally {
        setLoading(false)
      }
    }
    load()
    if (bookingIdParam) setTab('give')
  }, [user?.id, bookingIdParam])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedBookingId) { setError('Please select a completed session'); return }
    if (rating === 0) { setError('Please select a star rating'); return }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await feedbackService.submit(selectedBookingId, rating, comment || undefined, isPublic)
      setSuccess('Feedback submitted successfully! Thank you for supporting the community.')
      setRating(0)
      setComment('')
      setSelectedBookingId('')
      const [{ feedback, stats }, given] = await Promise.all([
        feedbackService.getUserFeedback(user!.id),
        feedbackService.getSubmitted(),
      ])
      setMyFeedback(feedback)
      setStats(stats)
      setGivenFeedback(given)
      setPendingBookings((prev) => prev.filter((b) => b._id !== selectedBookingId))
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Star className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Ratings & Community Reviews</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Feedback & Reviews</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Maintain high quality mentorship standards across the platform.</p>
          </div>

          {stats && stats.avgRating !== null && (
            <div className="p-3 sm:px-5 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center gap-3">
              <div className="text-2xl font-black text-slate-900">{stats.avgRating.toFixed(1)}</div>
              <div>
                <StarRating value={Math.round(stats.avgRating)} readOnly />
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Based on {stats.count} verified review{stats.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3 flex-wrap">
          {(['received', 'give', 'given'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'received' && 'Reviews for Me'}
              {t === 'give' && `Leave Feedback ${pendingBookings.length > 0 ? `(${pendingBookings.length})` : ''}`}
              {t === 'given' && 'Reviews I Submitted'}
            </button>
          ))}
        </div>

        {/* Received Tab */}
        {tab === 'received' && (
          myFeedback.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-xs">
              <Star className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-base mb-1">No reviews received yet</p>
              <p className="text-xs text-slate-400">
                Completed mentorship sessions will generate verified student/mentor ratings and testimonials here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myFeedback.map((f) => (
                <div key={f._id} className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0">
                        {f.reviewerId?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{f.reviewerId?.name}</div>
                        <div className="text-[11px] text-slate-400">{f.reviewerId?.role} · {fmt(f.createdAt)}</div>
                      </div>
                    </div>
                    <StarRating value={f.rating} readOnly />
                  </div>
                  {f.comment && (
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mt-2">
                      "{f.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Give Feedback Tab */}
        {tab === 'give' && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Leave Session Review</h2>
            <p className="text-xs text-slate-500 mb-6">Rate your completed 1-on-1 session to help other students find great guidance.</p>

            {pendingBookings.length === 0 && !selectedBookingId ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 mb-1">No completed sessions awaiting review</p>
                <p className="text-slate-400 mb-4">You can only review sessions marked as COMPLETED.</p>
                <Link to="/scheduling" className="text-indigo-600 font-bold hover:underline">
                  View scheduled sessions →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Completed Session *</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Choose a session...</option>
                    {pendingBookings.map((b) => {
                      const other = b.mentorId._id === user?.id ? b.menteeId : b.mentorId
                      return (
                        <option key={b._id} value={b._id}>
                          Session with {other?.name} — {fmt(b.startTime)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Overall Rating *</label>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Review & Comments (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Describe how the mentor or session helped you with questions, roadmap, or portfolio..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isPublic" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Display this review publicly on their verified mentor profile
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting Review...' : 'Submit Verified Feedback'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Given Tab */}
        {tab === 'given' && (
          givenFeedback.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-xs">
              <Star className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-base mb-1">You haven't submitted any reviews yet</p>
              <p className="text-xs text-slate-400">Reviews you leave for mentors or mentees will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {givenFeedback.map((f) => (
                <div key={f._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {f.revieweeId?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">Review for {f.revieweeId?.name}</div>
                      <div className="text-[11px] text-slate-400 mb-2">{fmt(f.createdAt)}</div>
                      {f.comment && <p className="text-xs text-slate-600 italic">"{f.comment}"</p>}
                    </div>
                  </div>
                  <StarRating value={f.rating} readOnly />
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}


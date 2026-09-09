import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mentorshipService, type MentorshipRequest, type ActiveMentorship } from '../services/mentorshipService'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-800 border-amber-200',
  ACCEPTED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED:  'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  ACTIVE:    'bg-indigo-50 text-indigo-700 border-indigo-200',
}

export default function MentorshipDashboardPage() {
  const { user } = useAuth()
  const isMentor = user?.role === 'SENIOR' || user?.role === 'ALUMNI'

  const [incoming, setIncoming] = useState<MentorshipRequest[]>([])
  const [sentRequests, setSentRequests] = useState<MentorshipRequest[]>([])
  const [active, setActive] = useState<ActiveMentorship[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      const [inc, snt, act] = await Promise.all([
        isMentor ? mentorshipService.getIncoming() : Promise.resolve([]),
        mentorshipService.getSent(),
        mentorshipService.getActive(),
      ])
      setIncoming(inc)
      setSentRequests(snt)
      setActive(act)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [isMentor])

  async function handleAccept(id: string) {
    setActionError('')
    setActionSuccess('')
    try {
      await mentorshipService.acceptRequest(id)
      setActionSuccess('Mentorship request accepted! You can now message and schedule sessions.')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setActionError(err.response?.data?.message ?? 'Failed to accept request')
    }
  }

  async function handleReject(id: string) {
    setActionError('')
    setActionSuccess('')
    try {
      await mentorshipService.rejectRequest(id)
      setActionSuccess('Request declined.')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setActionError(err.response?.data?.message ?? 'Failed to reject request')
    }
  }

  async function handleCancel(id: string) {
    setActionError('')
    setActionSuccess('')
    try {
      await mentorshipService.cancelRequest(id)
      setActionSuccess('Request cancelled.')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setActionError(err.response?.data?.message ?? 'Failed to cancel request')
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
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Network & Relationships</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Mentorship Hub</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage your active pairings, pending connections, and incoming requests.</p>
          </div>

          <Link
            to="/mentors"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <span>Explore Mentors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {actionError && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Active Mentorships */}
            <section className="mb-8">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Active Mentorship Pairings ({active.length})
              </h2>

              {active.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white border border-slate-200/80 rounded-3xl text-slate-400 text-xs shadow-xs">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 mb-1">No active pairings yet</p>
                  <p className="text-slate-400">
                    {isMentor ? 'Accepted requests from students will appear here.' : 'Connect with mentors in your field to begin a learning partnership.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.map((m) => {
                    const other = m.menteeId._id === user?.id ? m.mentorId : m.menteeId
                    return (
                      <div key={m._id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4 hover:shadow-md transition">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0">
                            {other?.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-sm truncate">{other?.name ?? 'User'}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              <span>{other?.role}</span>
                              <span> · Active since {new Date(m.startedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            to={`/chat?userId=${other._id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Incoming Requests (mentors only) */}
            {isMentor && (
              <section className="mb-8">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Incoming Mentorship Requests ({incoming.length})
                </h2>

                {incoming.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-white border border-slate-200/80 rounded-2xl text-slate-400 text-xs">
                    <Clock className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                    No pending incoming mentorship requests.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {incoming.map((r) => {
                      const mentee = r.menteeId as { name: string; email: string; _id?: string }
                      return (
                        <div key={r._id} className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0">
                                {mentee.name?.[0]?.toUpperCase() ?? '?'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{mentee.name}</div>
                                <div className="text-xs text-slate-500">{mentee.email}</div>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                              {r.status}
                            </span>
                          </div>

                          {r.message && (
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed mb-4">
                              "{r.message}"
                            </div>
                          )}

                          {r.status === 'PENDING' && (
                            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => handleAccept(r._id)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                              >
                                Accept Connection
                              </button>
                              <button
                                onClick={() => handleReject(r._id)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Sent Requests */}
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Sent Requests ({sentRequests.length})
              </h2>

              {sentRequests.length === 0 ? (
                <div className="text-center py-8 px-4 bg-white border border-slate-200/80 rounded-2xl text-slate-400 text-xs">
                  <Send className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                  No mentorship requests sent yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((r) => {
                    const mentor = r.mentorId as { name: string; email: string; _id?: string }
                    return (
                      <div key={r._id} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0">
                            {mentor.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{mentor.name}</div>
                            <div className="text-[11px] text-slate-400">Sent on {new Date(r.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-700'}`}>
                            {r.status}
                          </span>
                          {r.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancel(r._id)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mentorshipService, type MentorshipRequest, type ActiveMentorship } from '../services/mentorshipService'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'


const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-300',
  ACCEPTED: 'bg-green-500/20 text-green-300',
  REJECTED: 'bg-red-500/20 text-red-300',
  CANCELLED: 'bg-slate-700 text-slate-400',
  ACTIVE: 'bg-indigo-500/20 text-indigo-300',
}

export default function MentorshipDashboardPage() {
  const { user, logout } = useAuth()
  const isMentor = user?.role === 'SENIOR' || user?.role === 'ALUMNI'

  const [incoming, setIncoming] = useState<MentorshipRequest[]>([])
  const [sentRequests, setSentRequests] = useState<MentorshipRequest[]>([])
  const [active, setActive] = useState<ActiveMentorship[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState('')

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
    } finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [isMentor])

  async function handleAccept(id: string) {
    setActionError('')
    try { await mentorshipService.acceptRequest(id); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setActionError(err.response?.data?.message ?? 'Failed') }
  }

  async function handleReject(id: string) {
    setActionError('')
    try { await mentorshipService.rejectRequest(id); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setActionError(err.response?.data?.message ?? 'Failed') }
  }

  async function handleCancel(id: string) {
    setActionError('')
    try { await mentorshipService.cancelRequest(id); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setActionError(err.response?.data?.message ?? 'Failed') }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z" /></svg></div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm text-slate-300 hover:text-white">{user?.name}</Link>
          <button onClick={logout} className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Mentorships</h1>
        {actionError && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{actionError}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Active Mentorships */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Active Mentorships ({active.length})</h2>
              {active.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">No active mentorships yet.</div>
              ) : (
                <div className="space-y-3">
                  {active.map((m) => {
                    const other = m.menteeId._id === user?.id ? m.mentorId : m.menteeId
                    return (
                      <div key={m._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shrink-0">{other.name[0]}</div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{other.name}</div>
                          <div className="text-xs text-slate-400">{other.role} · Since {new Date(m.startedAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS.ACTIVE}`}>ACTIVE</span>
                        <Link to={`/chat?userId=${other._id}`} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">Chat</Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Incoming Requests (mentors only) */}
            {isMentor && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Incoming Requests ({incoming.length})</h2>
                {incoming.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">No pending requests.</div>
                ) : (
                  <div className="space-y-3">
                    {incoming.map((r) => {
                      const mentee = r.menteeId as { name: string; email: string }
                      return (
                        <div key={r._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">{mentee.name?.[0]}</div>
                            <div className="flex-1"><div className="font-medium text-white">{mentee.name}</div><div className="text-xs text-slate-400">{mentee.email}</div></div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                          </div>
                          {r.message && <p className="text-sm text-slate-300 mb-3 pl-14">{r.message}</p>}
                          <div className="flex gap-2 pl-14">
                            <button onClick={() => handleAccept(r._id)} className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition">Accept</button>
                            <button onClick={() => handleReject(r._id)} className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition">Reject</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Sent Requests */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">My Requests ({sentRequests.length})</h2>
              {sentRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
                  No requests sent yet. <Link to="/mentors" className="text-indigo-400 hover:text-indigo-300">Find a mentor</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((r) => {
                    const mentor = r.mentorId as { name: string; email: string }
                    return (
                      <div key={r._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shrink-0">{mentor.name?.[0]}</div>
                          <div className="flex-1"><div className="font-medium text-white">{mentor.name}</div><div className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div></div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                          {r.status === 'PENDING' && (
                            <button onClick={() => handleCancel(r._id)} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 text-xs transition">Cancel</button>
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

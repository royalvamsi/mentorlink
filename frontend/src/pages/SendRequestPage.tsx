import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { mentorshipService } from '../services/mentorshipService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'

export default function SendRequestPage() {
  const { mentorId } = useParams<{ mentorId: string }>()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mentorId) return
    mentorService.getMentorById(mentorId).then((m) => { setMentor(m); setLoading(false) }).catch(() => setLoading(false))
  }, [mentorId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await mentorshipService.sendRequest(mentorId!, message || undefined)
      navigate('/mentorships', { state: { success: 'Mentorship request sent!' } })
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed to send request.')
      else setError('An unexpected error occurred.')
    } finally { setSending(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="text-2xl font-bold text-white mb-2">Request Mentorship</h1>
        {mentor && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">{mentor.name[0]}</div>
            <div><div className="font-medium text-white">{mentor.name}</div><div className="text-sm text-slate-400">{mentor.role} · {mentor.profile.department}</div></div>
          </div>
        )}

        {error && <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Message (optional)</label>
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)}
              rows={4} maxLength={500}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              placeholder="Introduce yourself and explain why you'd like this mentor…"
            />
          </div>
          <div className="flex gap-3">
            <Link to={`/mentors/${mentorId}`} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm text-center transition">Cancel</Link>
            <button type="submit" disabled={sending} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
              {sending ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { mentorshipService } from '../services/mentorshipService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  ChevronLeft,
  ShieldCheck,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react'

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
    mentorService.getMentorById(mentorId)
      .then((m) => { setMentor(m); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mentorId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await mentorshipService.sendRequest(mentorId!, message || undefined)
      navigate('/mentorships', { state: { success: 'Mentorship request sent successfully!' } })
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed to send request.')
      else setError('An unexpected error occurred.')
    } finally {
      setSending(false)
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

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Request Mentorship</h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Introduce yourself, your academic year, and what specific guidance you are seeking.
        </p>

        {mentor && (
          <div className="flex items-center gap-3.5 mb-6 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              {mentor.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{mentor.name}</span>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span>{mentor.role}</span>
                {mentor.profile?.department && <span> · {mentor.profile.department}</span>}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">
                Personalized Note (Recommended)
              </label>
              <span className="text-[11px] text-slate-400">{message.length}/500</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition leading-relaxed"
              placeholder="Hi! I'm interested in software engineering internships and would love guidance on resume reviews and interview prep..."
            />
          </div>

          {/* Quick tips */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Mentioning a shared interest or specific project increases acceptance rates by over 40%.
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold text-center transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}


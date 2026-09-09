import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import {
  ShieldCheck,
  Star,
  MessageSquare,
  Calendar,
  Sparkles,
  ChevronLeft,
  Award,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react'

const ROLE_COLORS: Record<string, string> = {
  SENIOR: 'bg-teal-50 text-teal-700 border-teal-200/80',
  ALUMNI: 'bg-amber-50 text-amber-800 border-amber-200/80',
}

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    mentorService.getMentorById(id)
      .then((m) => { setMentor(m); setLoading(false) })
      .catch(() => { setError('Mentor not found.'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !mentor) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center bg-white border border-slate-200 rounded-3xl p-8 max-w-sm w-full shadow-xs">
          <p className="text-slate-600 mb-4 text-sm">{error || 'Mentor not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  )

  const { name, role, profile } = mentor

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to directory</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-6 overflow-hidden relative">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-md shrink-0">
              {name[0]?.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-700'}`}>
                  {role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                {profile.department && <span className="font-semibold text-slate-700">{profile.department}</span>}
                {profile.year && <span>· {profile.year} Year</span>}
                <span>· Verified Campus Mentor</span>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-900">5.0</span>
                  <span className="text-xs text-slate-400">(Top Rated)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>15+ Sessions Guided</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Available for 1-on-1s</span>
                </div>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About & Background</h2>
              <p className="text-slate-700 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.availabilityNote && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Availability: <strong className="text-slate-800">{profile.availabilityNote}</strong></span>
            </div>
          )}

          {/* Action CTAs */}
          {user?.role === 'JUNIOR' && id !== user.id && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
              <Link
                to={`/mentorships/request/${id}`}
                className="flex-1 min-w-[200px] py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Request Mentorship Connection</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/chat?userId=${id}`}
                className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </Link>
            </div>
          )}
        </div>

        {/* Skills & Expertise */}
        {profile.skills.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Academic Interests */}
        {profile.academicInterests.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic & Research Interests</h2>
            <div className="flex flex-wrap gap-2">
              {profile.academicInterests.map((i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(profile.linkedIn || profile.github) && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Social & Portfolio Links</h2>
            <div className="flex gap-4">
              {profile.linkedIn && (
                <a
                  href={profile.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


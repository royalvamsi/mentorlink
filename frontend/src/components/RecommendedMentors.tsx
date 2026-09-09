import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/authService'
import { Sparkles, ChevronDown, ChevronUp, ArrowUpRight, ShieldCheck } from 'lucide-react'

interface MatchFactor {
  name: string
  score: number
  label: string
}

interface MentorMatch {
  mentorId: string
  name: string
  role: string
  score: number
  factors: MatchFactor[]
  profile: {
    department?: string
    year?: string
    bio?: string
    skills: string[]
    academicInterests: string[]
    careerInterests: string[]
    avatarUrl?: string
  }
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[11px] font-bold text-slate-500 w-8 text-right">{score}%</span>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-slate-400'
}

export function RecommendedMentors() {
  const [matches, setMatches] = useState<MentorMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ status: string; data: MentorMatch[] }>('/api/matching', { params: { limit: 5 } })
      .then(res => setMatches(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-10 bg-white border border-slate-200/80 rounded-2xl">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!matches.length) return (
    <div className="text-center py-8 px-4 bg-white border border-slate-200/80 rounded-2xl text-slate-500 text-xs sm:text-sm">
      <Sparkles className="w-6 h-6 mx-auto text-indigo-400 mb-2" />
      <p className="font-semibold text-slate-800">Complete your profile to get personalized recommendations</p>
      <p className="text-slate-400 text-xs mt-1">Add your skills, academic interests, and career goals.</p>
      <Link to="/profile/edit" className="inline-block mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 font-semibold rounded-full hover:bg-indigo-100 transition text-xs">
        Update Profile
      </Link>
    </div>
  )

  return (
    <div className="space-y-3">
      {matches.map(m => (
        <div key={m.mentorId} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              {m.name[0]?.toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-bold text-slate-900 text-sm truncate">{m.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">{m.role}</span>
              </div>
              {m.profile.department && <p className="text-xs text-slate-500">{m.profile.department}</p>}
              {m.profile.bio && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{m.profile.bio}</p>}
              {m.profile.skills.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {m.profile.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">{s}</span>
                  ))}
                  {m.profile.skills.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium">+{m.profile.skills.length - 3}</span>
                  )}
                </div>
              )}
            </div>
            {/* Score badge */}
            <div className="shrink-0 text-right">
              <div className={`text-lg font-extrabold ${m.score >= 70 ? 'text-emerald-600' : m.score >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                {m.score}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">match</div>
            </div>
          </div>

          {/* Match factors toggle */}
          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/60 flex items-center justify-between">
            <button
              onClick={() => setExpanded(expanded === m.mentorId ? null : m.mentorId)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              <span>{expanded === m.mentorId ? 'Hide breakdown' : 'Why recommended?'}</span>
              {expanded === m.mentorId ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <div className="flex items-center gap-2">
              <Link
                to={`/mentors/${m.mentorId}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-semibold transition"
              >
                Profile
              </Link>
              <Link
                to={`/mentorships/request/${m.mentorId}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center gap-1"
              >
                <span>Connect</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {expanded === m.mentorId && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3 bg-slate-50/40">
              {m.factors.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-slate-600">{f.label}</span>
                  </div>
                  <ScoreBar score={f.score} color={scoreColor(f.score)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="text-center pt-2">
        <Link to="/mentors" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
          <span>Browse all mentors</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}


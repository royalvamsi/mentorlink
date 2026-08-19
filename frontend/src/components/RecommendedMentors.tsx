import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/authService'

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
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{score}%</span>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 70) return 'bg-green-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-slate-500'
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
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!matches.length) return (
    <div className="text-center py-6 text-slate-500 text-sm">
      Complete your profile to get personalized recommendations
    </div>
  )

  return (
    <div className="space-y-3">
      {matches.map(m => (
        <div key={m.mentorId} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-start gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
              {m.name[0]}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-white">{m.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">{m.role}</span>
              </div>
              {m.profile.department && <p className="text-xs text-slate-400">{m.profile.department}</p>}
              {m.profile.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.profile.bio}</p>}
              {m.profile.skills.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {m.profile.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">{s}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Score badge */}
            <div className="shrink-0 text-right">
              <div className={`text-lg font-bold ${m.score >= 70 ? 'text-green-400' : m.score >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                {m.score}%
              </div>
              <div className="text-xs text-slate-500">match</div>
            </div>
          </div>

          {/* Match factors toggle */}
          <div className="border-t border-slate-800 px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setExpanded(expanded === m.mentorId ? null : m.mentorId)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {expanded === m.mentorId ? '▲ Hide details' : '▼ Match breakdown'}
            </button>
            <Link
              to={`/mentors/${m.mentorId}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              View Profile
            </Link>
          </div>

          {expanded === m.mentorId && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-800 pt-3">
              {m.factors.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-slate-400">{f.label}</span>
                  </div>
                  <ScoreBar score={f.score} color={scoreColor(f.score)} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="text-center">
        <Link to="/mentors" className="text-sm text-indigo-400 hover:text-indigo-300 transition">Browse all mentors →</Link>
      </div>
    </div>
  )
}

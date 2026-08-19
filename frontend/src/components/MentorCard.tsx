import { Link } from 'react-router-dom'
import type { MentorProfile } from '../services/mentorService'

const ROLE_COLORS: Record<string, string> = {
  SENIOR: 'bg-teal-500/20 text-teal-300',
  ALUMNI: 'bg-amber-500/20 text-amber-300',
}

interface Props {
  mentor: MentorProfile
  matchScore?: number
}

export function MentorCard({ mentor, matchScore }: Props) {
  const { name, role, profile } = mentor

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition group">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
          {name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition">{name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-slate-700 text-slate-300'}`}>{role}</span>
            {profile.department && <span className="text-slate-400 text-xs">{profile.department}</span>}
            {profile.year && <span className="text-slate-500 text-xs">· {profile.year} Year</span>}
          </div>
        </div>
        {matchScore !== undefined && (
          <div className="shrink-0 text-right">
            <div className="text-lg font-bold text-indigo-400">{matchScore}%</div>
            <div className="text-xs text-slate-500">match</div>
          </div>
        )}
      </div>

      {profile.bio && <p className="text-slate-400 text-sm line-clamp-2 mb-4">{profile.bio}</p>}

      {profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.skills.slice(0, 5).map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs">{s}</span>
          ))}
          {profile.skills.length > 5 && <span className="text-slate-500 text-xs">+{profile.skills.length - 5}</span>}
        </div>
      )}

      {profile.availabilityNote && (
        <p className="text-xs text-slate-500 mb-4">📅 {profile.availabilityNote}</p>
      )}

      <div className="flex gap-2">
        <Link
          to={`/mentors/${mentor.userId}`}
          className="flex-1 py-2 rounded-lg border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-400 text-sm text-center transition"
        >
          View profile
        </Link>
        <Link
          to={`/mentorships/request/${mentor.userId}`}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm text-center font-medium transition"
        >
          Request mentorship
        </Link>
      </div>
    </div>
  )
}

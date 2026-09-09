import { Link } from 'react-router-dom'
import type { MentorProfile } from '../services/mentorService'
import { ShieldCheck, Calendar, ArrowUpRight, Sparkles } from 'lucide-react'

const ROLE_COLORS: Record<string, string> = {
  SENIOR: 'bg-teal-50 text-teal-700 border-teal-200/80',
  ALUMNI: 'bg-amber-50 text-amber-800 border-amber-200/80',
}

interface Props {
  mentor: MentorProfile
  matchScore?: number
}

export function MentorCard({ mentor, matchScore }: Props) {
  const { name, role, profile } = mentor

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-base font-bold text-white shadow-xs shrink-0">
              {name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                  {name}
                </h3>
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {role}
                </span>
                {profile.department && (
                  <span className="text-slate-500 text-xs font-medium truncate max-w-[130px]">
                    {profile.department}
                  </span>
                )}
                {profile.year && (
                  <span className="text-slate-400 text-xs">· {profile.year} Yr</span>
                )}
              </div>
            </div>
          </div>

          {matchScore !== undefined && (
            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-extrabold">{matchScore}%</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {profile.skills.slice(0, 4).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                {s}
              </span>
            ))}
            {profile.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-xs font-medium">
                +{profile.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Availability */}
        {profile.availabilityNote && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{profile.availabilityNote}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex gap-2">
        <Link
          to={`/mentors/${mentor.userId}`}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition-colors"
        >
          View Profile
        </Link>
        <Link
          to={`/mentorships/request/${mentor.userId}`}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
        >
          <span>Connect</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}


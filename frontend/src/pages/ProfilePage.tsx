import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { profileService, type UserProfile } from '../services/profileService'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import {
  User,
  ShieldCheck,
  Edit3,
  Globe,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

const ROLE_BADGES: Record<string, string> = {
  JUNIOR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SENIOR: 'bg-teal-50 text-teal-700 border-teal-200',
  ALUMNI: 'bg-amber-50 text-amber-800 border-amber-200',
  ADMIN:  'bg-purple-50 text-purple-700 border-purple-200',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileService.getMyProfile()
      .then((p) => { setProfile(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const p = profile?.profile ?? {}
  const isEmpty = !p.bio && !(p.skills?.length) && !p.department

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <User className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Account & Identity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
          </div>

          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-md shadow-indigo-600/20 shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">{user?.name}</h2>
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{user?.email}</p>

              <div className="flex flex-wrap gap-2 mt-3.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${ROLE_BADGES[user?.role ?? 'JUNIOR']}`}>
                  {user?.role}
                </span>
                {p.department && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {p.department}
                  </span>
                )}
                {p.year && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {p.year} Year
                  </span>
                )}
              </div>
            </div>
          </div>

          {p.bio && (
            <p className="mt-5 pt-5 border-t border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
              {p.bio}
            </p>
          )}

          {isEmpty && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Your profile is incomplete</p>
                <p className="text-amber-700 mt-0.5">
                  Add your department, bio, and skills so students or mentors can discover your profile across campus.{' '}
                  <Link to="/profile/edit" className="font-bold underline text-amber-900">
                    Complete your profile now →
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {(p.skills?.length ?? 0) > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {p.skills!.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Academic Interests */}
        {(p.academicInterests?.length ?? 0) > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Interests</h3>
            <div className="flex flex-wrap gap-2">
              {p.academicInterests!.map((i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Career Interests */}
        {(p.careerInterests?.length ?? 0) > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Career Aspirations</h3>
            <div className="flex flex-wrap gap-2">
              {p.careerInterests!.map((i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mentorship Goals */}
        {p.mentorshipGoals && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mentorship Goals</h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{p.mentorshipGoals}</p>
          </div>
        )}

        {/* Links */}
        {(p.linkedIn || p.github) && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Professional Profiles</h3>
            <div className="flex gap-4 flex-wrap">
              {p.linkedIn && (
                <a
                  href={p.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-800" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


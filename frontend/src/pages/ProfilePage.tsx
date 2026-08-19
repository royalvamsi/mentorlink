import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { profileService, type UserProfile } from '../services/profileService'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'

const ROLE_COLORS: Record<string, string> = {
  JUNIOR: 'bg-indigo-500/20 text-indigo-300',
  SENIOR: 'bg-teal-500/20 text-teal-300',
  ALUMNI: 'bg-amber-500/20 text-amber-300',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileService.getMyProfile().then((p) => { setProfile(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const p = profile?.profile ?? {}
  const isEmpty = !p.bio && !(p.skills?.length) && !p.department

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <Link to="/profile/edit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition">Edit profile</Link>
        </div>
        {/* Avatar + Name */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{user?.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user?.role ?? 'JUNIOR']}`}>{user?.role}</span>
                {p.department && <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{p.department}</span>}
                {p.year && <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{p.year} Year</span>}
              </div>
            </div>
          </div>
          {p.bio && <p className="mt-4 text-slate-300 text-sm leading-relaxed">{p.bio}</p>}
          {isEmpty && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              Your profile is incomplete. <Link to="/profile/edit" className="underline">Add your details</Link> to be discoverable as a mentor.
            </div>
          )}
        </div>

        {/* Skills */}
        {(p.skills?.length ?? 0) > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {p.skills!.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-sm">{s}</span>)}
            </div>
          </div>
        )}

        {/* Academic Interests */}
        {(p.academicInterests?.length ?? 0) > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Academic Interests</h2>
            <div className="flex flex-wrap gap-2">
              {p.academicInterests!.map((i) => <span key={i} className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-sm">{i}</span>)}
            </div>
          </div>
        )}

        {/* Career Interests */}
        {(p.careerInterests?.length ?? 0) > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Career Interests</h2>
            <div className="flex flex-wrap gap-2">
              {p.careerInterests!.map((i) => <span key={i} className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-sm">{i}</span>)}
            </div>
          </div>
        )}

        {/* Mentorship goals */}
        {p.mentorshipGoals && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Mentorship Goals</h2>
            <p className="text-slate-300 text-sm">{p.mentorshipGoals}</p>
          </div>
        )}

        {/* Links */}
        {(p.linkedIn || p.github) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Links</h2>
            <div className="flex gap-4">
              {p.linkedIn && <a href={p.linkedIn} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm transition">LinkedIn ↗</a>}
              {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm transition">GitHub ↗</a>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

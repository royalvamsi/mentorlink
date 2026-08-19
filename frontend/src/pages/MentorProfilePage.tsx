import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'

const ROLE_COLORS: Record<string, string> = {
  SENIOR: 'bg-teal-500/20 text-teal-300',
  ALUMNI: 'bg-amber-500/20 text-amber-300',
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !mentor) return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-sm w-full">
          <p className="text-slate-400 mb-4">{error || 'Mentor not found.'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl text-sm font-medium transition">← Go back</button>
        </div>
      </div>
    </div>
  )

  const { name, role, profile } = mentor

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-slate-700 text-slate-300'}`}>{role}</span>
                {profile.department && <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{profile.department}</span>}
                {profile.year && <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">{profile.year} Year</span>}
              </div>
            </div>
          </div>
          {profile.bio && <p className="mt-4 text-slate-300 text-sm leading-relaxed">{profile.bio}</p>}
          {profile.availabilityNote && <p className="mt-3 text-slate-500 text-xs">📅 {profile.availabilityNote}</p>}

          {user?.role === 'JUNIOR' && id !== user.id && (
            <div className="mt-5 flex gap-3">
              <Link to={`/mentorships/request/${id}`} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition">
                Request Mentorship
              </Link>
            </div>
          )}
        </div>

        {profile.skills.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">{profile.skills.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-sm">{s}</span>)}</div>
          </div>
        )}

        {profile.academicInterests.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Academic Interests</h2>
            <div className="flex flex-wrap gap-2">{profile.academicInterests.map((i) => <span key={i} className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-sm">{i}</span>)}</div>
          </div>
        )}

        {(profile.linkedIn || profile.github) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Links</h2>
            <div className="flex gap-4">
              {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm">LinkedIn ↗</a>}
              {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm">GitHub ↗</a>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

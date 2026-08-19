import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { profileService, type ProfileData } from '../services/profileService'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const YEARS = ['1st', '2nd', '3rd', '4th', 'Alumni']

function TagInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setInput('')
  }
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-400">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          placeholder="Type and press Enter"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">Add</button>
      </div>
    </div>
  )
}

export default function EditProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileData>({ skills: [], academicInterests: [], careerInterests: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    profileService.getMyProfile().then((p) => {
      setForm(p.profile)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await profileService.updateMyProfile(form)
      navigate('/profile')
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed to save profile.')
      else setError('An unexpected error occurred.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <span className="text-slate-400 text-sm">{user?.name}</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Update your profile information</p>
          </div>
          <Link to="/profile" className="text-sm text-slate-400 hover:text-white transition">← Back to profile</Link>
        </div>

        {error && <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-slate-400">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
                <input value={form.department ?? ''} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Year</label>
                <select value={form.year ?? ''} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                  <option value="">Select year</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
              <textarea value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={500} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" placeholder="Tell us about yourself..." />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">Skills & Interests</h2>
            <TagInput label="Skills" value={form.skills ?? []} onChange={(v) => setForm({ ...form, skills: v })} />
            <TagInput label="Academic Interests" value={form.academicInterests ?? []} onChange={(v) => setForm({ ...form, academicInterests: v })} />
            <TagInput label="Career Interests" value={form.careerInterests ?? []} onChange={(v) => setForm({ ...form, careerInterests: v })} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">Mentorship</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mentorship Goals</label>
              <textarea value={form.mentorshipGoals ?? ''} onChange={(e) => setForm({ ...form, mentorshipGoals: e.target.value })} rows={2} maxLength={300} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" placeholder="What do you want from mentorship?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Availability Note</label>
              <input value={form.availabilityNote ?? ''} onChange={(e) => setForm({ ...form, availabilityNote: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="e.g. Weekends 10am–2pm" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-slate-400">Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">LinkedIn URL</label>
                <input value={form.linkedIn ?? ''} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub URL</label>
                <input value={form.github ?? ''} onChange={(e) => setForm({ ...form, github: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="https://github.com/..." />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Link to="/profile" className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition">Cancel</Link>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { profileService, type ProfileData } from '../services/profileService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  ChevronLeft,
  User,
  BookOpen,
  Target,
  Globe,
  Plus,
  X,
  Save,
  AlertCircle
} from 'lucide-react'

const YEARS = ['1st', '2nd', '3rd', '4th', 'Alumni']

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setInput('')
  }
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="p-0.5 rounded-md hover:bg-indigo-200/60 text-indigo-500 hover:text-indigo-800 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          placeholder={placeholder ?? 'Type and press Enter or click Add...'}
        />
        <button
          type="button"
          onClick={add}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  )
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileData>({ skills: [], academicInterests: [], careerInterests: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    profileService.getMyProfile()
      .then((p) => {
        setForm(p.profile)
        setLoading(false)
      })
      .catch(() => setLoading(false))
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
    } finally {
      setSaving(false)
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Edit Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Update your campus academic information, skills, and mentorship availability.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Major</label>
                <input
                  value={form.department ?? ''}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Computer Science & Engineering"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Standing / Year</label>
                <select
                  value={form.year ?? ''}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select year...</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y} Year</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Personal & Academic Bio</label>
              <textarea
                value={form.bio ?? ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                placeholder="Share your interests, current coursework, hackathons, or career plans..."
              />
            </div>
          </div>

          {/* Skills & Focus */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Skills & Specializations</span>
            </h2>

            <TagInput
              label="Technical & Professional Skills"
              value={form.skills ?? []}
              onChange={(v) => setForm({ ...form, skills: v })}
              placeholder="e.g. Python, React, System Design, SQL"
            />
            <TagInput
              label="Academic Interests"
              value={form.academicInterests ?? []}
              onChange={(v) => setForm({ ...form, academicInterests: v })}
              placeholder="e.g. Distributed Systems, ML Research, Cryptography"
            />
            <TagInput
              label="Career Target Domains"
              value={form.careerInterests ?? []}
              onChange={(v) => setForm({ ...form, careerInterests: v })}
              placeholder="e.g. Full-Stack Dev, Product Management, Quantitative Trading"
            />
          </div>

          {/* Mentorship Settings */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Mentorship Goals & Availability</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mentorship Objectives</label>
              <textarea
                value={form.mentorshipGoals ?? ''}
                onChange={(e) => setForm({ ...form, mentorshipGoals: e.target.value })}
                rows={2}
                maxLength={300}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="What specific areas or mentorship format are you looking for?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Availability Note</label>
              <input
                value={form.availabilityNote ?? ''}
                onChange={(e) => setForm({ ...form, availabilityNote: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Weekday evenings after 6 PM, or Sunday mornings"
              />
            </div>
          </div>

          {/* Social Profiles */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Public Profile Links</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">LinkedIn Profile URL</label>
                <input
                  value={form.linkedIn ?? ''}
                  onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">GitHub Profile URL</label>
                <input
                  value={form.github ?? ''}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Link
              to="/profile"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}


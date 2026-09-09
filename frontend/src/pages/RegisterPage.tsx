import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { RegisterRole } from '../types/auth'
import axios from 'axios'
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  Award,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'

const ROLES: { value: RegisterRole; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'JUNIOR',
    label: 'Junior Student',
    desc: 'Looking for 1-on-1 guidance, roadmap reviews & study prep',
    icon: <GraduationCap className="w-5 h-5 text-indigo-600" />
  },
  {
    value: 'SENIOR',
    label: 'Senior Student',
    desc: 'Ready to mentor campus peers in coursework, tech stacks & clubs',
    icon: <Award className="w-5 h-5 text-purple-600" />
  },
  {
    value: 'ALUMNI',
    label: 'Alumni / Graduate',
    desc: 'Working professional offering industry & career mentorship',
    icon: <Briefcase className="w-5 h-5 text-teal-600" />
  },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<RegisterRole>('JUNIOR')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    setLoading(true)
    try {
      await register({ name, email, password, role })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverMsg = err.response?.data?.message
        const networkMsg = err.message === 'Network Error' ? 'Unable to connect to server. Please try again.' : undefined
        setError(serverMsg ?? networkMsg ?? err.message ?? 'Registration failed. Please try again.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Mentor<span className="text-indigo-600">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Join MentorLink</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">Create your verified student or mentor profile</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="Alex Rivera"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 mb-1.5">Campus / Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="alex.rivera@college.edu"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-slate-700 mb-2">Select Your Role on MentorLink</span>
              <div className="space-y-2">
                {ROLES.map((r) => {
                  const selected = role === r.value
                  return (
                    <label
                      key={r.value}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={selected}
                        onChange={() => setRole(r.value)}
                        className="sr-only"
                      />
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{r.label}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.desc}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 mt-4"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-bold">
              Sign in to account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { authService } from '../services/authService'
import {
  Sparkles,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ExternalLink,
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState<{
    message: string
    resetToken?: string
    resetUrl?: string
  } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessInfo(null)
    setLoading(true)

    try {
      const res = await authService.forgotPassword({ email })
      setSuccessInfo({
        message: res.message,
        resetToken: res.data?.resetToken,
        resetUrl: res.data?.resetUrl,
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Failed to process request. Please try again.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Mentor<span className="text-indigo-600">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 mb-1">Request Processed</p>
                  <p>{successInfo.message}</p>
                </div>
              </div>

              {/* Dev mode instant reset link */}
              {successInfo.resetUrl && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <KeyRound className="w-4 h-4" />
                    <span>Local Development Helper</span>
                  </div>
                  <p className="text-xs text-indigo-900">
                    A secure reset token was generated. In local development mode, you can immediately proceed to set your new password:
                  </p>
                  <Link
                    to={`/reset-password?token=${successInfo.resetToken}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition shadow-xs"
                  >
                    <span>Proceed to Reset Password</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campus or Personal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    placeholder="name@college.edu"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{loading ? 'Sending Request...' : 'Send Reset Instructions'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remember your password? Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer helper */}
        <div className="mt-6 text-center text-[11px] text-slate-400">
          Secure campus token verification & password encryption.
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminService, type Report, type AdminUser, type AdminStats, type ReportStatus } from '../services/adminService'

const ROLES = ['JUNIOR', 'SENIOR', 'ALUMNI', 'ADMIN']
const STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: 'bg-amber-500/20 text-amber-300',
  REVIEWED: 'bg-blue-500/20 text-blue-300',
  RESOLVED: 'bg-green-500/20 text-green-300',
  DISMISSED: 'bg-slate-700 text-slate-400',
}

function fmt(d: string) { return new Date(d).toLocaleDateString([], { dateStyle: 'medium' }) }

type Tab = 'overview' | 'reports' | 'users'

export default function AdminPage() {
  const { user, logout } = useAuth()

  // Guard: only ADMIN users can see this page
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [reportFilter, setReportFilter] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'reports') {
      setLoading(true)
      adminService.getReports(reportFilter || undefined).then(d => setReports(d.reports)).catch(() => setError('Failed')).finally(() => setLoading(false))
    } else if (tab === 'users') {
      setLoading(true)
      adminService.getUsers(1, userSearch || undefined).then(d => setUsers(d.users)).catch(() => setError('Failed')).finally(() => setLoading(false))
    }
  }, [tab, reportFilter, userSearch])

  async function handleResolve(id: string, status: ReportStatus) {
    setError(''); setSuccess('')
    try {
      await adminService.resolveReport(id, status)
      setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r))
      setSuccess('Report updated')
    } catch { setError('Failed to update report') }
  }

  async function handleRoleChange(userId: string, role: string) {
    setError(''); setSuccess('')
    try {
      await adminService.updateUserRole(userId, role)
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
      setSuccess('Role updated')
    } catch { setError('Failed to update role') }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">← Dashboard</Link>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Moderation and user management</p>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'reports', 'users'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-indigo-600' },
              { label: 'Pending Reports', value: stats.pendingReports, icon: '🚩', color: 'from-red-500 to-rose-600' },
              { label: 'Total Reports', value: stats.totalReports, icon: '📋', color: 'from-amber-500 to-orange-600' },
              { label: 'Forum Posts', value: stats.totalPosts, icon: '💬', color: 'from-purple-500 to-violet-600' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-slate-400 mb-3">Role Breakdown</h2>
              <div className="flex gap-4 flex-wrap">
                {stats.roleBreakdown.map(r => (
                  <div key={r._id} className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{r._id}:</span>
                    <span className="font-bold text-white">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {tab === 'reports' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['', 'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map(s => (
                <button key={s || 'all'} onClick={() => setReportFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${reportFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              : reports.length === 0 ? <div className="text-center py-12 text-slate-500">No reports</div>
              : (
                <div className="space-y-3">
                  {reports.map(r => (
                    <div key={r._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                            <span className="text-xs text-slate-500">{r.targetType}</span>
                            <span className="text-xs font-medium text-white">{r.reason}</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">by {r.reporterId.name} · {fmt(r.createdAt)}</p>
                          {r.description && <p className="text-xs text-slate-500 mt-1">"{r.description}"</p>}
                        </div>
                        {r.status === 'PENDING' && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleResolve(r._id, 'RESOLVED')} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition">Resolve</button>
                            <button onClick={() => handleResolve(r._id, 'DISMISSED')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">Dismiss</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
              className="w-full max-w-sm px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              placeholder="Search users by name or email…" />
            {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-800">
                      <tr className="text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Joined</th>
                        <th className="px-4 py-3 text-left">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                          <td className="px-4 py-3 text-slate-400">{u.email}</td>
                          <td className="px-4 py-3 text-slate-500">{fmt(u.createdAt)}</td>
                          <td className="px-4 py-3">
                            <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                              className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none cursor-pointer">
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  )
}

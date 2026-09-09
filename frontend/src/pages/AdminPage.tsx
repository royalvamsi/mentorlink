import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminService, type Report, type AdminUser, type AdminStats, type ReportStatus } from '../services/adminService'
import { Navbar } from '../components/Navbar'
import {
  ShieldAlert,
  Users,
  Flag,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

const ROLES = ['JUNIOR', 'SENIOR', 'ALUMNI', 'ADMIN']
const STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING:   'bg-amber-50 text-amber-800 border-amber-200',
  REVIEWED:  'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISMISSED: 'bg-slate-100 text-slate-500 border-slate-200',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString([], { dateStyle: 'medium' })
}

type Tab = 'overview' | 'reports' | 'users'

export default function AdminPage() {
  const { user } = useAuth()

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
    if (user?.role !== 'ADMIN') return
    adminService.getStats().then(setStats).catch(() => {})
  }, [user?.role])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    if (tab === 'reports') {
      setLoading(true)
      adminService.getReports(reportFilter || undefined).then((d) => setReports(d.reports)).catch(() => setError('Failed to load reports')).finally(() => setLoading(false))
    } else if (tab === 'users') {
      setLoading(true)
      adminService.getUsers(1, userSearch || undefined).then((d) => setUsers(d.users)).catch(() => setError('Failed to load users')).finally(() => setLoading(false))
    }
  }, [user?.role, tab, reportFilter, userSearch])

  async function handleResolve(id: string, status: ReportStatus) {
    setError('')
    setSuccess('')
    try {
      await adminService.resolveReport(id, status)
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)))
      setSuccess('Report status updated')
    } catch {
      setError('Failed to update report')
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setError('')
    setSuccess('')
    try {
      await adminService.updateUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)))
      setSuccess('User role successfully updated')
    } catch {
      setError('Failed to update role')
    }
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Campus Oversight</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 mb-6">Manage user accounts, roles, content moderation, and platform metrics.</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3 flex-wrap">
          {(['overview', 'reports', 'users'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                tab === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
                <div className="text-xs text-slate-400 mt-0.5">Total Members</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <Flag className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.pendingReports}</div>
                <div className="text-xs text-slate-400 mt-0.5">Pending Reports</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.totalReports}</div>
                <div className="text-xs text-slate-400 mt-0.5">Total Reports Filed</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.totalPosts}</div>
                <div className="text-xs text-slate-400 mt-0.5">Discussion Posts</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Role Distribution</h2>
              <div className="flex gap-4 flex-wrap">
                {stats.roleBreakdown.map((r) => (
                  <div key={r._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">{r._id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-100">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div>
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {['', 'PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map((s) => (
                <button
                  key={s || 'all'}
                  onClick={() => setReportFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    reportFilter === s
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s || 'All Reports'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl text-slate-400 text-xs shadow-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="font-bold text-slate-700 mb-1">Zero pending reports</p>
                <p className="text-slate-400">All community moderation items have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[r.status]}`}>
                            {r.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {r.targetType}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{r.reason}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Reported by <strong className="text-slate-700">{r.reporterId?.name}</strong> on {fmt(r.createdAt)}
                        </p>
                        {r.description && (
                          <p className="text-xs text-slate-600 italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            "{r.description}"
                          </p>
                        )}
                      </div>

                      {r.status === 'PENDING' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleResolve(r._id, 'RESOLVED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolve(r._id, 'DISMISSED')}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div>
            <div className="relative max-w-sm mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                placeholder="Search members by name or email..."
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                        <th className="px-5 py-3.5 text-left">Member Name</th>
                        <th className="px-5 py-3.5 text-left">Email Address</th>
                        <th className="px-5 py-3.5 text-left">Joined Date</th>
                        <th className="px-5 py-3.5 text-left">Access Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 text-slate-900 font-bold flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name[0]?.toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                          <td className="px-5 py-3.5 text-slate-400">{fmt(u.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}


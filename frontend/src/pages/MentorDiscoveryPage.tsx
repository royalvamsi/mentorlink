import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { MentorCard } from '../components/MentorCard'
import { useAuth } from '../context/AuthContext'

export default function MentorDiscoveryPage() {
  const { user, logout } = useAuth()
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchMentors = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const result = await mentorService.getMentors({
        search: search || undefined,
        skills: skillFilter || undefined,
        department: deptFilter || undefined,
        page: p,
      })
      setMentors(result.mentors)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setPage(p)
    } catch { /* handled by empty state */ }
    finally { setLoading(false) }
  }, [search, skillFilter, deptFilter])

  useEffect(() => { fetchMentors(1) }, [fetchMentors])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchMentors(1)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm text-slate-300 hover:text-white">{user?.name}</Link>
          <button onClick={logout} className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition">Sign out</button>
        </div>
      </header>

      {/* Search */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-4">Find a Mentor</h1>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Search by name or email…"
            />
            <input
              value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}
              className="sm:w-44 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Skill (e.g. React)"
            />
            <input
              value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              className="sm:w-44 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Department"
            />
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">Search</button>
          </form>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-slate-400 text-sm">{loading ? 'Loading…' : `${total} mentor${total !== 1 ? 's' : ''} found`}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
                <div className="flex gap-4 mb-4"><div className="w-12 h-12 rounded-xl bg-slate-800" /><div className="flex-1"><div className="h-4 bg-slate-800 rounded mb-2 w-1/2" /><div className="h-3 bg-slate-800 rounded w-1/3" /></div></div>
                <div className="h-3 bg-slate-800 rounded mb-2" /><div className="h-3 bg-slate-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-white font-semibold mb-2">No mentors found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mentors.map((m) => <MentorCard key={m.userId} mentor={m} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => fetchMentors(page - 1)} disabled={page <= 1} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm transition">← Prev</button>
                <span className="px-4 py-2 text-slate-400 text-sm">Page {page} of {totalPages}</span>
                <button onClick={() => fetchMentors(page + 1)} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm transition">Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

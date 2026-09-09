import { useState, useEffect, useCallback } from 'react'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { MentorCard } from '../components/MentorCard'
import { Navbar } from '../components/Navbar'
import { Search, RotateCcw, Compass, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const POPULAR_SKILLS = ['React', 'Python', 'Machine Learning', 'System Design', 'Data Science', 'Product Management', 'DevOps']

export default function MentorDiscoveryPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
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
      
      let filtered = result.mentors
      if (roleFilter !== 'ALL') {
        filtered = filtered.filter(m => m.role === roleFilter)
      }

      setMentors(filtered)
      setTotalPages(result.totalPages)
      setTotal(result.total)
      setPage(p)
    } catch {
      setMentors([])
    } finally {
      setLoading(false)
    }
  }, [search, skillFilter, deptFilter, roleFilter])

  useEffect(() => {
    fetchMentors(1)
  }, [fetchMentors])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchMentors(1)
  }

  function handleReset() {
    setSearch('')
    setSkillFilter('')
    setDeptFilter('')
    setRoleFilter('ALL')
    fetchMentors(1)
  }

  function toggleSkillChip(skill: string) {
    if (skillFilter === skill) {
      setSkillFilter('')
    } else {
      setSkillFilter(skill)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Header & Filter Controls */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Compass className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Peer & Alumni Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find the Right Mentor</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Explore experienced seniors and alumni ready to guide your journey.</p>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start md:self-auto">
              {[
                { label: 'All Mentors', value: 'ALL' },
                { label: 'Seniors', value: 'SENIOR' },
                { label: 'Alumni', value: 'ALUMNI' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    roleFilter === tab.value
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search inputs bar */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                placeholder="Search mentor by name, company..."
              />
            </div>

            <div className="sm:col-span-3">
              <input
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                placeholder="Skill (e.g. React, ML)"
              />
            </div>

            <div className="sm:col-span-2">
              <input
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                placeholder="Department"
              />
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              >
                Search
              </button>
              {(search || skillFilter || deptFilter || roleFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Quick Skill Tags */}
          <div className="flex items-center gap-1.5 mt-4 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Popular:
            </span>
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkillChip(skill)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition shrink-0 ${
                  skillFilter.toLowerCase() === skill.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            {loading ? 'Finding mentors...' : `${total} mentor${total !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded mb-2 w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded mb-2" />
                <div className="h-3 bg-slate-100 rounded w-3/4 mb-4" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-slate-900 font-bold text-base mb-1">No mentors found</h3>
            <p className="text-slate-500 text-xs mb-5 max-w-xs mx-auto">
              We couldn't find any mentors matching your current filters. Try relaxing your search criteria.
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mentors.map((m) => (
                <MentorCard key={m.userId} mentor={m} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => fetchMentors(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-xs transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white rounded-lg border border-slate-200">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => fetchMentors(page + 1)}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-xs transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}


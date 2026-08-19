import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { NotificationBell } from '../components/NotificationBell'
import { searchService, type SearchResult, type SearchType } from '../services/searchService'

const TABS: { key: SearchType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🔍' },
  { key: 'mentors', label: 'Mentors', icon: '👤' },
  { key: 'posts', label: 'Forum Posts', icon: '💬' },
  { key: 'goals', label: 'My Goals', icon: '🎯' },
]

const TYPE_ICONS: Record<string, string> = {
  user: '👤',
  post: '💬',
  goal: '🎯',
}

const TYPE_BADGE: Record<string, string> = {
  user: 'bg-indigo-500/20 text-indigo-300',
  post: 'bg-purple-500/20 text-purple-300',
  goal: 'bg-amber-500/20 text-amber-300',
}

function ResultCard({ result }: { result: SearchResult }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(result.link)}
      className="w-full text-left p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/60 rounded-xl transition group"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[result.type] ?? '🔍'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white group-hover:text-indigo-300 transition truncate">{result.title}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${TYPE_BADGE[result.type] ?? 'bg-slate-700 text-slate-300'}`}>
              {result.type === 'user' ? 'Mentor' : result.type === 'post' ? 'Post' : 'Goal'}
            </span>
          </div>
          {result.subtitle && <p className="text-sm text-slate-400 truncate">{result.subtitle}</p>}
          {result.tags && result.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {result.tags.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">{t}</span>
              ))}
            </div>
          )}
        </div>
        <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0 mt-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

export default function SearchPage() {
  const { user, logout } = useAuth()
  const { unreadCount } = useSocket()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQ = searchParams.get('q') ?? ''
  const initialType = (searchParams.get('type') ?? 'all') as SearchType

  const [query, setQuery] = useState(initialQ)
  const [activeType, setActiveType] = useState<SearchType>(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string, type: SearchType, pg: number) => {
    if (!q.trim()) { setResults([]); setTotal(0); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchService.search(q, type, pg)
      setResults(data.results)
      setTotal(data.total)
    } catch { setResults([]); setTotal(0) }
    finally { setLoading(false) }
  }, [])

  // Run on URL param changes
  useEffect(() => {
    if (initialQ) doSearch(initialQ, initialType, 1)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearchParams({ q: query, type: activeType })
    doSearch(query, activeType, 1)
  }

  function handleTypeChange(t: SearchType) {
    setActiveType(t)
    setPage(1)
    if (query.trim()) {
      setSearchParams({ q: query, type: t })
      doSearch(query, t, 1)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z" />
            </svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">Dashboard</Link>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search mentors, posts, goals…"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Type tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeType === tab.key ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !searched ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-slate-400 font-medium">What are you looking for?</p>
            <p className="text-sm mt-1">Search for mentors, forum discussions, or your goals</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-3">😶</div>
            <p className="text-slate-400 font-medium">No results found</p>
            <p className="text-sm mt-1">Try a different search term or category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{total} result{total !== 1 ? 's' : ''} for "<span className="text-white">{query}</span>"</p>
            <div className="space-y-3">
              {results.map(r => <ResultCard key={r.id + r.type} result={r} />)}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

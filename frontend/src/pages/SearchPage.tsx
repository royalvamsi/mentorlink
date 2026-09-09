import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchService, type SearchResult, type SearchType } from '../services/searchService'
import { Navbar } from '../components/Navbar'
import {
  Search,
  Users,
  MessageSquare,
  Target,
  ChevronRight,
  Layers,
  FileQuestion
} from 'lucide-react'

const TABS: { key: SearchType; label: string; icon: React.ReactNode }[] = [
  { key: 'all',     label: 'All Results', icon: <Layers className="w-3.5 h-3.5" /> },
  { key: 'mentors', label: 'Mentors',     icon: <Users className="w-3.5 h-3.5" /> },
  { key: 'posts',   label: 'Discussions', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { key: 'goals',   label: 'My Goals',    icon: <Target className="w-3.5 h-3.5" /> },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  user: <Users className="w-4 h-4 text-indigo-600" />,
  post: <MessageSquare className="w-4 h-4 text-purple-600" />,
  goal: <Target className="w-4 h-4 text-teal-600" />,
}

const TYPE_BADGE: Record<string, string> = {
  user: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  post: 'bg-purple-50 text-purple-700 border-purple-200',
  goal: 'bg-teal-50 text-teal-700 border-teal-200',
}

function ResultCard({ result }: { result: SearchResult }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(result.link)}
      className="w-full text-left p-4 sm:p-5 bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md rounded-2xl sm:rounded-3xl transition group shadow-xs"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
          {TYPE_ICONS[result.type] ?? <Search className="w-4 h-4 text-slate-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate text-sm">
              {result.title}
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${TYPE_BADGE[result.type] ?? 'bg-slate-100 text-slate-600'}`}>
              {result.type === 'user' ? 'Mentor' : result.type === 'post' ? 'Post' : 'Goal'}
            </span>
          </div>
          {result.subtitle && (
            <p className="text-xs text-slate-500 truncate leading-relaxed">
              {result.subtitle}
            </p>
          )}
          {result.tags && result.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {result.tags.map((t) => (
                <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50/70 border border-indigo-100 text-indigo-700">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQ = searchParams.get('q') ?? ''
  const initialType = (searchParams.get('type') ?? 'all') as SearchType

  const [query, setQuery] = useState(initialQ)
  const [activeType, setActiveType] = useState<SearchType>(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string, type: SearchType, pg: number) => {
    if (!q.trim()) {
      setResults([])
      setTotal(0)
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchService.search(q, type, pg)
      setResults(data.results)
      setTotal(data.total)
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQ) doSearch(initialQ, initialType, 1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearchParams({ q: query, type: activeType })
    doSearch(query, activeType, 1)
  }

  function handleTypeChange(t: SearchType) {
    setActiveType(t)
    if (query.trim()) {
      setSearchParams({ q: query, type: t })
      doSearch(query, t, 1)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Search className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Global Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Explore the Campus</h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mentors, skill topics, discussions, or goals..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Type Tabs */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeType === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Results Stream */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !searched ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">What are you looking for?</p>
            <p className="text-xs text-slate-400">
              Search across verified mentors, campus discussions, and personal development goals.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileQuestion className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">No matches found</p>
            <p className="text-xs text-slate-400">
              Try searching with alternative keywords or changing the category filter.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Found {total} result{total !== 1 ? 's' : ''} for "<span className="text-slate-900">{query}</span>"
            </p>
            <div className="space-y-3">
              {results.map((r) => (
                <ResultCard key={r.id + r.type} result={r} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}


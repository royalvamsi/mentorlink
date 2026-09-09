import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchService, type SearchResult, type SearchType } from '../services/searchService'
import { Search, User, MessageSquare, Target, ArrowRight } from 'lucide-react'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface Props {
  type?: SearchType
}

export function GlobalSearchBar({ type = 'all' }: Props) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const data = await searchService.search(q, type)
      setResults(data.results)
      setOpen(data.results.length > 0 || q.trim().length >= 2)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [type])

  useEffect(() => { doSearch(debouncedQuery) }, [debouncedQuery, doSearch])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(result: SearchResult) {
    setQuery('')
    setOpen(false)
    setResults([])
    navigate(result.link)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && highlighted >= 0 && results[highlighted]) { handleSelect(results[highlighted]) }
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  function handleGoToSearch() {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`)
    setOpen(false)
  }

  function getIcon(t: string) {
    if (t === 'user') return <User className="w-4 h-4 text-indigo-600" />
    if (t === 'post') return <MessageSquare className="w-4 h-4 text-blue-600" />
    if (t === 'goal') return <Target className="w-4 h-4 text-emerald-600" />
    return <Search className="w-4 h-4 text-slate-500" />
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setHighlighted(-1) }}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder="Search mentors, skills, forum..."
          className="w-full pl-9 pr-8 py-2 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner/5"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-full min-w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {results.length === 0 && !loading && query.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center text-slate-500 text-xs">
              No results found for "<span className="font-semibold text-slate-800">{query}</span>"
            </div>
          ) : (
            <>
              <div className="max-h-72 overflow-y-auto py-1">
                {results.map((r, i) => (
                  <button
                    key={r.id + r.type}
                    onClick={() => handleSelect(r)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition ${highlighted === i ? 'bg-slate-50' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(r.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{r.title}</p>
                      {r.subtitle && <p className="text-[11px] text-slate-500 truncate">{r.subtitle}</p>}
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {r.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 px-3.5 py-2 bg-slate-50/70">
                <button
                  onClick={handleGoToSearch}
                  className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 text-left transition flex items-center justify-between"
                >
                  <span>See all results for "{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}


import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchService, type SearchResult, type SearchType } from '../services/searchService'

const TYPE_ICONS: Record<string, string> = {
  user: '👤',
  post: '💬',
  goal: '🎯',
}

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

  const debouncedQuery = useDebounce(query, 320)

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

  // Close on outside click
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

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setHighlighted(-1) }}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder="Search mentors, posts, goals…"
          className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 w-full min-w-[340px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.length === 0 && !loading && query.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">
              No results for "<span className="text-white">{query}</span>"
            </div>
          ) : (
            <>
              <div className="max-h-72 overflow-y-auto">
                {results.map((r, i) => (
                  <button
                    key={r.id + r.type}
                    onClick={() => handleSelect(r)}
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-slate-800 transition ${highlighted === i ? 'bg-slate-800' : ''}`}
                  >
                    <span className="text-base shrink-0 mt-0.5">{TYPE_ICONS[r.type] ?? '🔍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{r.title}</p>
                      {r.subtitle && <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>}
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {r.tags.map(t => <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300">{t}</span>)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 px-3 py-2">
                <button onClick={handleGoToSearch} className="w-full text-xs text-indigo-400 hover:text-indigo-300 text-left transition">
                  See all results for "<span className="font-medium">{query}</span>" →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

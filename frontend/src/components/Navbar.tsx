import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from './NotificationBell'
import { GlobalSearchBar } from './GlobalSearchBar'

interface NavItem {
  label: string
  to: string
  icon: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
  { label: 'Find Mentors', to: '/mentors', icon: '🔍' },
  { label: 'Mentorships', to: '/mentorships', icon: '🤝' },
  { label: 'Chat', to: '/chat', icon: '💬' },
  { label: 'Schedule', to: '/scheduling', icon: '📅' },
  { label: 'Forum', to: '/forum', icon: '🗣️' },
  { label: 'Goals', to: '/goals', icon: '🎯' },
  { label: 'Files', to: '/files', icon: '📁' },
  { label: 'Admin', to: '/admin', icon: '⚙️', adminOnly: true },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (!user) return null

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'ADMIN')

  const roleBadges: Record<string, string> = {
    JUNIOR: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    SENIOR: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    ALUMNI: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
              aria-label="MentorLink Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
                Mentor<span className="text-indigo-400">Link</span>
              </span>
            </Link>
          </div>

          {/* Center: Global Search (Desktop & Tablet) */}
          <div className="hidden md:block flex-1 max-w-md mx-2">
            <GlobalSearchBar />
          </div>

          {/* Right Controls: Notification, Profile, Sign out & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />

            {/* Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left pr-1">
                <span className="text-xs font-medium text-white max-w-[110px] truncate leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{user.role}</span>
              </div>
              <span className={`hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${roleBadges[user.role] ?? 'bg-slate-800 text-slate-400'}`}>
                {user.role}
              </span>
            </Link>

            {/* Sign out */}
            <button
              onClick={logout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Sign out"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Quick Sub-Nav */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 no-scrollbar">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Drawer / Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top duration-200">
          {/* Mobile Search Bar */}
          <div className="mb-3">
            <GlobalSearchBar />
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile User Section */}
          <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

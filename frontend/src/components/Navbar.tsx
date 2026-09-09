import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from './NotificationBell'
import { GlobalSearchBar } from './GlobalSearchBar'
import {
  Users,
  LayoutDashboard,
  Search,
  MessageSquare,
  Calendar,
  MessagesSquare,
  Target,
  Folder,
  ShieldCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Mentors', to: '/mentors', icon: Search },
  { label: 'Mentorships', to: '/mentorships', icon: Users },
  { label: 'Chat', to: '/chat', icon: MessageSquare },
  { label: 'Schedule', to: '/scheduling', icon: Calendar },
  { label: 'Forum', to: '/forum', icon: MessagesSquare },
  { label: 'Goals', to: '/goals', icon: Target },
  { label: 'Files', to: '/files', icon: Folder },
  { label: 'Admin', to: '/admin', icon: ShieldCheck, adminOnly: true },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  if (!user) return null

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'ADMIN')

  const roleBadges: Record<string, string> = {
    JUNIOR: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    SENIOR: 'bg-teal-50 text-teal-700 border-teal-200/80',
    ALUMNI: 'bg-amber-50 text-amber-800 border-amber-200/80',
    ADMIN: 'bg-rose-50 text-rose-700 border-rose-200/80',
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1"
              aria-label="MentorLink Dashboard"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                Mentor<span className="text-indigo-600">Link</span>
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
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left pr-1">
                <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{user.role}</span>
              </div>
              <span className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleBadges[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                {user.role}
              </span>
            </Link>

            {/* Sign out */}
            <button
              onClick={logout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {visibleNavItems.map((item) => {
            const IconComp = item.icon
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="mb-3">
            <GlobalSearchBar />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {visibleNavItems.map((item) => {
              const IconComp = item.icon
              const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}


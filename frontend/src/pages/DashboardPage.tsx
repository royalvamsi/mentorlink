import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const ROLE_CONFIG = {
  JUNIOR: {
    greeting: 'Welcome, Junior! 👋',
    subtitle: 'Find a mentor who can guide your journey.',
    accent: 'from-indigo-500 to-purple-600',
    cards: [
      { title: 'Find a Mentor', desc: 'Browse senior students and alumni in your field.', to: '/mentors', icon: '🔍' },
      { title: 'My Mentorships', desc: 'View your active mentorship connections.', to: '/mentorships', icon: '🤝' },
      { title: 'My Goals', desc: 'Track your academic and career goals.', to: '/goals', icon: '🎯' },
      { title: 'Community', desc: 'Discuss topics with peers and mentors.', to: '/community', icon: '💬' },
    ],
  },
  SENIOR: {
    greeting: 'Welcome, Senior! 🌟',
    subtitle: 'Help juniors navigate their path.',
    accent: 'from-teal-500 to-indigo-600',
    cards: [
      { title: 'Mentorship Requests', desc: 'View and respond to incoming requests.', to: '/mentorships', icon: '📨' },
      { title: 'My Mentees', desc: 'Manage your active mentee connections.', to: '/mentorships/active', icon: '🤝' },
      { title: 'Set Availability', desc: 'Configure your available time slots.', to: '/availability', icon: '📅' },
      { title: 'Community', desc: 'Share knowledge with the community.', to: '/community', icon: '💬' },
    ],
  },
  ALUMNI: {
    greeting: 'Welcome back, Alumni! 🏆',
    subtitle: 'Share your industry experience.',
    accent: 'from-amber-500 to-orange-600',
    cards: [
      { title: 'Mentorship Requests', desc: 'View and respond to incoming requests.', to: '/mentorships', icon: '📨' },
      { title: 'My Mentees', desc: 'Manage your active mentee connections.', to: '/mentorships/active', icon: '🤝' },
      { title: 'Set Availability', desc: 'Configure your available time slots.', to: '/availability', icon: '📅' },
      { title: 'Community', desc: 'Share industry insights with students.', to: '/community', icon: '💬' },
    ],
  },
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  if (!user) return null

  const config = ROLE_CONFIG[user.role]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg">MentorLink</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm text-slate-300 hover:text-white transition">
            {user.name}
          </Link>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className={`bg-gradient-to-r ${config.accent} px-6 py-12`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">{config.greeting}</h1>
          <p className="text-white/80">{config.subtitle}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
            <span>{user.role}</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-5">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-white group-hover:text-indigo-400 transition mb-1">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Profile prompt */}
        <div className="mt-8 p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-indigo-300 mb-1">Complete your profile</h3>
              <p className="text-sm text-slate-400">Add your skills, bio, and interests to help others find you.</p>
            </div>
            <Link
              to="/profile/edit"
              className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

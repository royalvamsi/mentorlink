import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { RecommendedMentors } from '../components/RecommendedMentors'

const ROLE_CONFIG = {
  JUNIOR: {
    greeting: 'Welcome, Junior! 👋',
    subtitle: 'Find a mentor who can guide your journey.',
    accent: 'from-indigo-500 to-purple-600',
    cards: [
      { title: 'Find a Mentor', desc: 'Browse senior students and alumni in your field.', to: '/mentors', icon: '🔍' },
      { title: 'My Mentorships', desc: 'View your active mentorship connections.', to: '/mentorships', icon: '🤝' },
      { title: 'My Goals', desc: 'Track your academic and career goals.', to: '/goals', icon: '🎯' },
      { title: 'Community', desc: 'Discuss topics with peers and mentors.', to: '/forum', icon: '💬' },
    ],
  },
  SENIOR: {
    greeting: 'Welcome, Senior! 🌟',
    subtitle: 'Help juniors navigate their path.',
    accent: 'from-teal-500 to-indigo-600',
    cards: [
      { title: 'Mentorship Requests', desc: 'View and respond to incoming requests.', to: '/mentorships', icon: '📨' },
      { title: 'My Mentees', desc: 'Manage your active mentee connections.', to: '/mentorships', icon: '🤝' },
      { title: 'Set Availability', desc: 'Configure your available time slots.', to: '/scheduling', icon: '📅' },
      { title: 'Community', desc: 'Share knowledge with the community.', to: '/forum', icon: '💬' },
    ],
  },
  ALUMNI: {
    greeting: 'Welcome back, Alumni! 🏆',
    subtitle: 'Share your industry experience.',
    accent: 'from-amber-500 to-orange-600',
    cards: [
      { title: 'Mentorship Requests', desc: 'View and respond to incoming requests.', to: '/mentorships', icon: '📨' },
      { title: 'My Mentees', desc: 'Manage your active mentee connections.', to: '/mentorships', icon: '🤝' },
      { title: 'Set Availability', desc: 'Configure your available time slots.', to: '/scheduling', icon: '📅' },
      { title: 'Community', desc: 'Share industry insights with students.', to: '/forum', icon: '💬' },
    ],
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  // ADMIN users get SENIOR config as fallback
  const config = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG['SENIOR']

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

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
            <Link to="/profile/edit" className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
              Edit profile
            </Link>
          </div>
        </div>

        {/* Smart recommendations for juniors */}
        {user.role === 'JUNIOR' && (
          <div className="mt-8">
            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Recommended for you</h2>
            <RecommendedMentors />
          </div>
        )}

        {/* Admin link */}
        {user.role === 'ADMIN' && (
          <div className="mt-6">
            <Link to="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm font-medium transition">
              🛡️ Admin Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

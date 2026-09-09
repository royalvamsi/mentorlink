import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { RecommendedMentors } from '../components/RecommendedMentors'
import {
  Search,
  Users,
  Target,
  MessagesSquare,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  FileText
} from 'lucide-react'

const ROLE_CONFIG = {
  JUNIOR: {
    greeting: 'Welcome back',
    subtitle: 'Find verified seniors and alumni to guide your academic and career goals.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    cards: [
      { title: 'Find a Mentor', desc: 'Search senior students and alumni in your branch or target field.', to: '/mentors', icon: Search, color: 'bg-blue-50 text-blue-600' },
      { title: 'My Mentorships', desc: 'Manage your active 1-on-1 connections and pending requests.', to: '/mentorships', icon: Users, color: 'bg-teal-50 text-teal-600' },
      { title: 'My Goals & Milestones', desc: 'Track academic, internship, and project progress.', to: '/goals', icon: Target, color: 'bg-amber-50 text-amber-600' },
      { title: 'Campus Community', desc: 'Ask questions, share advice, and explore forum discussions.', to: '/forum', icon: MessagesSquare, color: 'bg-purple-50 text-purple-600' },
    ],
  },
  SENIOR: {
    greeting: 'Welcome back, Senior Mentor',
    subtitle: 'Share your knowledge, review resumes, and guide the next generation of peers.',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    cards: [
      { title: 'Mentorship Requests', desc: 'Review and accept incoming guidance requests from juniors.', to: '/mentorships', icon: Users, color: 'bg-teal-50 text-teal-600' },
      { title: 'Set Availability', desc: 'Configure your free calendar slots for 1-on-1 sessions.', to: '/scheduling', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
      { title: 'Mentee Goals', desc: 'Review and give feedback on your mentees\' progress.', to: '/goals', icon: Target, color: 'bg-amber-50 text-amber-600' },
      { title: 'Campus Forum', desc: 'Answer student questions and share industry opportunities.', to: '/forum', icon: MessagesSquare, color: 'bg-purple-50 text-purple-600' },
    ],
  },
  ALUMNI: {
    greeting: 'Welcome back, Alumni Mentor',
    subtitle: 'Empower students with real-world industry insights, referrals, and career coaching.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    cards: [
      { title: 'Mentorship Requests', desc: 'Review incoming requests from ambitious students.', to: '/mentorships', icon: Users, color: 'bg-amber-50 text-amber-600' },
      { title: 'Calendar & Slots', desc: 'Manage your session slots around your professional schedule.', to: '/scheduling', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
      { title: 'Share Resources', desc: 'Upload interview sheets, guides, and learning templates.', to: '/files', icon: FileText, color: 'bg-teal-50 text-teal-600' },
      { title: 'Alumni Network', desc: 'Engage with fellow alumni and student leaders on campus.', to: '/forum', icon: MessagesSquare, color: 'bg-purple-50 text-purple-600' },
    ],
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  const config = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG['SENIOR']

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Hero Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${config.badgeColor}`}>
                  {user.role}
                </span>
                <span className="text-xs font-semibold text-slate-400">Campus Ecosystem</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {config.greeting}, <span className="text-indigo-600">{user.name}</span> 👋
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                {config.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/mentors"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <span>Find Mentors</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/profile/edit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Navigation & Tools
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.cards.map((card) => {
              const IconComp = card.icon
              return (
                <Link
                  key={card.to + card.title}
                  to={card.to}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Profile Completion Callout */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Elevate Your Profile & Matching Accuracy</h3>
              <p className="text-xs text-slate-600 mt-0.5">Keep your bio, skills, and target industries updated so peers and mentors can find you effortlessly.</p>
            </div>
          </div>
          <Link
            to="/profile/edit"
            className="shrink-0 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-600 text-xs font-bold border border-indigo-200 shadow-xs transition"
          >
            Update Profile
          </Link>
        </div>

        {/* Smart Recommendations Section for Juniors */}
        {user.role === 'JUNIOR' && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recommended Mentors for You</h2>
                <p className="text-xs text-slate-500">Personalized compatibility based on your department, career goals, and skills.</p>
              </div>
              <Link to="/mentors" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <RecommendedMentors />
          </div>
        )}

        {/* Admin Dashboard Entry Pill */}
        {user.role === 'ADMIN' && (
          <div className="mt-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              <div>
                <span className="text-xs font-bold text-rose-900">Administrator Access Active</span>
                <p className="text-[11px] text-rose-700">Access platform moderation, user roles, and platform activity logs.</p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
            >
              Open Admin Portal
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Sparkles,
  ArrowUpRight,
  Search,
  Compass,
  Users,
  Star,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Target,
  Award
} from 'lucide-react'

export default function LandingPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [quickSearch, setQuickSearch] = useState('')

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickSearch.trim()) {
      navigate(`/mentors?search=${encodeURIComponent(quickSearch.trim())}`)
    } else {
      navigate('/mentors')
    }
  }

  const FEATURED_MENTORS = [
    {
      id: 'mentor-1',
      name: 'Sarah Chen',
      role: 'ALUMNI',
      badge: 'Software Engineer @ Stripe',
      dept: 'Computer Science · Alum \'23',
      rating: 4.9,
      reviewsCount: 32,
      skills: ['Full Stack', 'System Design', 'React', 'Career Prep'],
      bio: 'Ex-Google intern, currently building fintech infrastructure. Passionate about helping juniors crack tech interviews.',
      avatarBg: 'from-blue-600 to-indigo-700',
      initials: 'SC',
    },
    {
      id: 'mentor-2',
      name: 'Alex Rodriguez',
      role: 'SENIOR',
      badge: 'ML Research Lead',
      dept: 'Data Science & AI · Senior \'25',
      rating: 5.0,
      reviewsCount: 24,
      skills: ['Machine Learning', 'Python', 'PyTorch', 'Research Papers'],
      bio: 'Published at NeurIPS workshop. Mentoring students in AI fundamentals, ML internships, and graduate research paths.',
      avatarBg: 'from-amber-500 to-orange-600',
      initials: 'AR',
    },
    {
      id: 'mentor-3',
      name: 'Maya Patel',
      role: 'ALUMNI',
      badge: 'Product Manager @ Microsoft',
      dept: 'Information Systems · Alum \'22',
      rating: 4.9,
      reviewsCount: 45,
      skills: ['Product Strategy', 'UI/UX', 'Resume Review', 'Case Prep'],
      bio: 'Helping college students pivot into Product Management and build standout side projects that get noticed.',
      avatarBg: 'from-emerald-500 to-teal-700',
      initials: 'MP',
    },
  ]

  const TESTIMONIALS = [
    {
      quote: "Thanks to my mentor Maya, I revamped my resume, nailed my product case study, and secured an APM summer internship!",
      author: "David Kim",
      role: "Junior · Computer Science",
      initials: "DK",
      stars: 5,
    },
    {
      quote: "MentorLink removed all the awkwardness of networking. I connected with an alumnus in my field within minutes and got weekly project reviews.",
      author: "Priya Sharma",
      role: "Sophomore · Electronics & CS",
      initials: "PS",
      stars: 5,
    },
    {
      quote: "As an alumnus, this is the most seamless way to give back to my college juniors. Scheduling and goal tracking keep our sessions super productive.",
      author: "Marcus Vance",
      role: "Alumni Mentor · Senior SWE",
      initials: "MV",
      stars: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* ─── Top Navbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
                Mentor<span className="text-indigo-600">Link</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mt-0.5">
                Campus Ecosystem
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/mentors" className="hover:text-indigo-600 transition-colors">Find Mentors</Link>
            <a href="#benefits" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
            <Link to="/forum" className="hover:text-indigo-600 transition-colors">Community</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
                >
                  <span>Register Free</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle decorative background gradient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-100/60 via-indigo-100/40 to-teal-100/50 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Connect · Learn · Track Progress · Grow</span>
          </div>

          {/* Main Headline with Dribbble cursive accents */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Kickstart Your Future with Personalized{' '}
            <span className="relative whitespace-nowrap">
              <span className="font-handwriting text-amber-500 font-bold text-5xl sm:text-7xl lg:text-8xl italic">
                Mentorship
              </span>
            </span>{' '}
            and{' '}
            <span className="relative whitespace-nowrap">
              <span className="font-handwriting text-teal-600 font-bold text-5xl sm:text-7xl lg:text-8xl italic">
                Coaching
              </span>
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            Empowering college students to navigate career milestones, master technical skills, and achieve real-world growth through verified seniors and alumni mentors.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/mentors"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold shadow-xs hover:-translate-y-0.5 transition-all"
                >
                  <span>Find Mentors</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all"
                >
                  <span>Create Free Account</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold shadow-xs hover:-translate-y-0.5 transition-all"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Search + CTAs */}
          <div className="max-w-xl mx-auto mb-6">
            <form onSubmit={handleQuickSearch} className="flex items-center p-1.5 rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-200/50 hover:border-indigo-300 transition-colors">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Search by skill (React, ML), branch, or mentor name..."
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shrink-0"
              >
                <span>Find a Mentor</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Secondary Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 transition"
            >
              <span>Are you a Senior or Alum? Join as a Mentor</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            {!user && (
              <>
                <span className="text-slate-300">·</span>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline font-bold transition"
                >
                  <span>Already registered? Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-200/80">
            <div className="p-4 rounded-2xl bg-white/60 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">500+</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Sessions Completed</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">98%</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Positive Feedback</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Verified Campus Peers</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">1:1</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Tailored Guidance</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlight Benefits (3 Distinct Pastel Cards from Dribbble) ─── */}
      <section id="benefits" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Highlight <span className="font-handwriting text-amber-500 text-4xl sm:text-5xl italic font-bold">Benefits</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              Everything you need to discover guidance, master your domain, and turn ambitions into tangible milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Light Ice Blue - Personalized Matching */}
            <div className="relative p-8 rounded-3xl bg-[#BFDBFE]/60 border border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-blue-700">
                  <Compass className="w-7 h-7" />
                </div>
                <Link
                  to="/mentors"
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform"
                  aria-label="Discover matching"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-900 transition-colors">
                  Personalized Matching
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Connect with mentors and alumni who genuinely align with your branch, career ambitions, and specific tech stack.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-200/60 flex items-center gap-2 text-xs font-semibold text-blue-900">
                <span>Smart Compatibility Scoring</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Warm Buttercream Yellow - Skill Development */}
            <div className="relative p-8 rounded-3xl bg-[#FEF08A]/60 border border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center text-amber-700">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <Link
                  to="/forum"
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform"
                  aria-label="Explore skills and community"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-900 transition-colors">
                  Skill Development
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Gain practical skills for technical interviews, hackathons, portfolio reviews, and academic excellence with 1-on-1 feedback.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/60 flex items-center gap-2 text-xs font-semibold text-amber-900">
                <span>Code Reviews & Mock Interviews</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Deep Forest Mint - Goal Setting & Tracking */}
            <div className="relative p-8 rounded-3xl bg-[#059669] text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-sm flex items-center justify-center text-white">
                  <Target className="w-7 h-7" />
                </div>
                <Link
                  to="/goals"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-emerald-800 shadow-sm flex items-center justify-center text-white group-hover:scale-110 transition-all"
                  aria-label="Explore goal tracking"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Goal Setting & Progress
                </h3>
                <p className="text-emerald-50 text-sm leading-relaxed">
                  Work towards clear, achievable milestones with structured progress indicators, tasks, and continuous mentor feedback.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2 text-xs font-semibold text-emerald-100">
                <span>Track Milestones & Reviews</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Mentors (Dribbble Cobalt Spotlight Section) ─── */}
      <section className="py-20 bg-gradient-to-b from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Dot pattern on corners */}
        <div className="absolute top-4 left-4 w-32 h-32 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-32 h-32 bg-dot-pattern opacity-30 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Featured Mentors and Coaches
            </h2>
            <p className="text-blue-100 font-handwriting text-2xl sm:text-3xl italic mt-1 font-semibold">
              Meet professionals dedicated to helping you succeed
            </p>
          </div>

          {/* 3 Featured Mentor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_MENTORS.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-3xl p-6 text-slate-900 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Top Avatar & Rating */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${mentor.avatarBg} text-white font-bold text-xl flex items-center justify-center shadow-md`}>
                        {mentor.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight">{mentor.name}</h3>
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                          {mentor.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-900">{mentor.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-indigo-600 mb-1">{mentor.badge}</p>
                  <p className="text-xs text-slate-500 mb-3">{mentor.dept}</p>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">{mentor.bio}</p>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {mentor.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <Link
                    to="/mentors"
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold text-center transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/register"
                    className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold text-center transition-colors"
                  >
                    Connect
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/30 hover:scale-105 transition-all"
            >
              <span>Explore All Mentors</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works Roadmap ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              The Mentorship Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              How MentorLink Works
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              A structured 6-step lifecycle built specifically for academic and career advancement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Discover', desc: 'Browse verified seniors and alumni categorized by skills, branch, interests, and availability.', icon: Compass, color: 'text-blue-600 bg-blue-50' },
              { step: '02', title: 'Match', desc: 'Our smart algorithm evaluates compatibility across department, career goals, and skill needs.', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
              { step: '03', title: 'Connect', desc: 'Send tailored mentorship requests and initiate instant real-time chat with file sharing.', icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50' },
              { step: '04', title: 'Learn & Schedule', desc: 'Book 1-on-1 video sessions based on live calendar availability with automated reminders.', icon: Calendar, color: 'text-teal-600 bg-teal-50' },
              { step: '05', title: 'Track Progress', desc: 'Set measurable goals, break them into milestones, and log achievements collaboratively.', icon: Target, color: 'text-amber-600 bg-amber-50' },
              { step: '06', title: 'Grow & Give Back', desc: 'Leave reviews, earn campus recognition, and transition into a mentor when you become a senior.', icon: Award, color: 'text-rose-600 bg-rose-50' },
            ].map((item) => {
              const IconComp = item.icon
              return (
                <div key={item.step} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-slate-300 font-display">{item.step}</span>
                      <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                    <span>Structured Experience</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials (Dribbble Quote Card) ────────────────────── */}
      <section id="testimonials" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-12">
            Campus <span className="font-handwriting text-indigo-600 text-4xl sm:text-5xl italic font-bold">Stories</span>
          </h2>

          <div className="space-y-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm max-w-2xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {t.initials}
                </div>
                <div className="text-sm font-bold text-slate-900">{t.author}</div>
                <div className="text-xs text-indigo-600 font-medium mb-4">{t.role}</div>

                <p className="text-slate-800 text-base sm:text-lg italic font-medium leading-relaxed mb-4">
                  "{t.quote}"
                </p>

                <div className="flex justify-center gap-1 text-amber-400">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ────────────────────────────────────── */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to find your guide or share your knowledge?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Join hundreds of students and alumni building lasting academic and career connections on MentorLink today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 hover:scale-105 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/mentors"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              <span>Browse Directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">Mentor<span className="text-indigo-600">Link</span></span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              The premier college mentorship network connecting juniors, seniors, and alumni for mutual growth and career success.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/mentors" className="hover:text-indigo-600 transition">Find a Mentor</Link></li>
              <li><Link to="/forum" className="hover:text-indigo-600 transition">Campus Forum</Link></li>
              <li><Link to="/goals" className="hover:text-indigo-600 transition">Goals Tracker</Link></li>
              <li><Link to="/scheduling" className="hover:text-indigo-600 transition">Schedule Sessions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-indigo-600 transition">Junior Guidance</Link></li>
              <li><Link to="/register" className="hover:text-indigo-600 transition">Senior Mentors</Link></li>
              <li><Link to="/register" className="hover:text-indigo-600 transition">Alumni Network</Link></li>
              <li><Link to="/files" className="hover:text-indigo-600 transition">Shared Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Support & Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-600 transition">Campus Code of Conduct</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">Safety & Moderation</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">support@mentorlink.edu</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} MentorLink. All rights reserved.</p>
          <p>Designed for college excellence.</p>
        </div>
      </footer>
    </div>
  )
}

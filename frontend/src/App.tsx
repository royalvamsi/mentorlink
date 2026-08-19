import { BrowserRouter, Route, Routes } from 'react-router-dom'

function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
      <div className="text-center px-6">
        {/* Logo / brand mark */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600 shadow-lg mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 104 4 4 4 0 00-4-4z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">MentorLink</h1>

        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          A real-time mentorship platform connecting junior students, seniors, and alumni.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Phase 1 — Foundation complete. Authentication coming next.
        </div>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

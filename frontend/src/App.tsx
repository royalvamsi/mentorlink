import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import MentorDiscoveryPage from './pages/MentorDiscoveryPage'
import MentorProfilePage from './pages/MentorProfilePage'
import MentorshipDashboardPage from './pages/MentorshipDashboardPage'
import SendRequestPage from './pages/SendRequestPage'
import ChatPage from './pages/ChatPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public-only routes — redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><MentorDiscoveryPage /></ProtectedRoute>} />
        <Route path="/mentors/:id" element={<ProtectedRoute><MentorProfilePage /></ProtectedRoute>} />
        <Route path="/mentorships" element={<ProtectedRoute><MentorshipDashboardPage /></ProtectedRoute>} />
        <Route path="/mentorships/request/:mentorId" element={<ProtectedRoute><SendRequestPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Default: redirect to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

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
import SchedulingPage from './pages/SchedulingPage'
import BookSessionPage from './pages/BookSessionPage'
import FeedbackPage from './pages/FeedbackPage'
import FilesPage from './pages/FilesPage'
import ForumPage from './pages/ForumPage'
import PostPage from './pages/PostPage'
import GoalsPage from './pages/GoalsPage'
import NotificationsPage from './pages/NotificationsPage'
import AdminPage from './pages/AdminPage'
import SearchPage from './pages/SearchPage'
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
        <Route path="/scheduling" element={<ProtectedRoute><SchedulingPage /></ProtectedRoute>} />
        <Route path="/book/:mentorId" element={<ProtectedRoute><BookSessionPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
        <Route path="/forum/:id" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

        {/* Default: redirect to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

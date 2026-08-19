import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { notificationService, type NotificationItem } from '../services/notificationService'
import { Navbar } from '../components/Navbar'

const ICONS: Record<string, string> = {
  MENTORSHIP_REQUEST: '🤝',
  REQUEST_ACCEPTED: '✅',
  REQUEST_DECLINED: '❌',
  BOOKING_CONFIRMED: '📅',
  BOOKING_CANCELLED: '🚫',
  BOOKING_REMINDER: '⏰',
  NEW_MESSAGE: '💬',
  FEEDBACK_RECEIVED: '⭐',
  GOAL_COMPLETED: '🎯',
  FORUM_REPLY: '💬',
  SYSTEM: 'ℹ️',
}

function fmt(d: string) { return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) }

export default function NotificationsPage() {
  const { clearUnread } = useSocket()
  const navigate = useNavigate()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await notificationService.getAll()
      setItems(data.notifications)
    } catch { setError('Failed to load notifications') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    // Mark all as read when the page loads
    notificationService.markAllRead().then(() => clearUnread()).catch(() => {})
  }, [])

  async function handleDelete(id: string) {
    await notificationService.delete(id).catch(() => {})
    setItems(prev => prev.filter(n => n._id !== id))
  }

  function handleClick(item: NotificationItem) {
    if (item.link) navigate(item.link)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <button
            onClick={() => notificationService.markAllRead().then(() => { setItems(prev => prev.map(n => ({ ...n, read: true }))); clearUnread() }).catch(() => {})}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            Mark all read
          </button>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-3">🔔</div>
            <p className="font-medium text-slate-400">All caught up!</p>
            <p className="text-sm mt-1">You have no notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item._id} className={`flex items-start gap-4 p-4 rounded-xl border transition ${!item.read ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-900 border-slate-800'}`}>
                <span className="text-2xl shrink-0 mt-0.5">{ICONS[item.type] ?? 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    {!item.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-400">{item.body}</p>
                  <p className="text-xs text-slate-500 mt-1">{fmt(item.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {item.link && (
                    <button onClick={() => handleClick(item)} className="text-xs px-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition">Go</button>
                  )}
                  <button onClick={() => handleDelete(item._id)} className="text-xs px-2 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 transition">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

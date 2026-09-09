import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { notificationService, type NotificationItem } from '../services/notificationService'
import { Navbar } from '../components/Navbar'
import {
  Bell,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  Target,
  Info,
  CheckCheck,
  Trash2,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'MENTORSHIP_REQUEST':
    case 'REQUEST_ACCEPTED':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    case 'REQUEST_DECLINED':
    case 'BOOKING_CANCELLED':
      return <XCircle className="w-5 h-5 text-rose-600" />
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_REMINDER':
      return <Calendar className="w-5 h-5 text-indigo-600" />
    case 'NEW_MESSAGE':
    case 'FORUM_REPLY':
      return <MessageSquare className="w-5 h-5 text-blue-600" />
    case 'FEEDBACK_RECEIVED':
      return <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
    case 'GOAL_COMPLETED':
      return <Target className="w-5 h-5 text-teal-600" />
    default:
      return <Info className="w-5 h-5 text-slate-500" />
  }
}

function fmt(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

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
    } catch {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    notificationService.markAllRead().then(() => clearUnread()).catch(() => {})
  }, [])

  async function handleDelete(id: string) {
    await notificationService.delete(id).catch(() => {})
    setItems((prev) => prev.filter((n) => n._id !== id))
  }

  function handleClick(item: NotificationItem) {
    if (item.link) navigate(item.link)
  }

  async function handleMarkAllRead() {
    await notificationService.markAllRead().catch(() => {})
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    clearUnread()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Bell className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Activity Updates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark all read</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">All caught up!</p>
            <p className="text-xs text-slate-400">
              When mentors accept requests, schedule sessions, or message you, notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item._id}
                className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${
                  !item.read
                    ? 'bg-white border-indigo-200 ring-2 ring-indigo-500/10 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</p>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-1">{item.body}</p>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{fmt(item.createdAt)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.link && (
                    <button
                      onClick={() => handleClick(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { notificationService, type NotificationItem } from '../services/notificationService'
import {
  Bell,
  CheckCheck,
  Calendar,
  MessageSquare,
  Star,
  Target,
  Users,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react'

function fmt(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(d).toLocaleDateString([], { dateStyle: 'short' })
}

export function NotificationBell() {
  const { unreadCount, clearUnread, decrementUnread, latestNotification } = useSocket()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    notificationService.getAll().then(data => {
      setItems(data.notifications.slice(0, 10))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!latestNotification) return
    setItems(prev => {
      const exists = prev.some(n => n._id === latestNotification._id)
      return exists ? prev : [latestNotification, ...prev].slice(0, 10)
    })
  }, [latestNotification])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleMarkAllRead() {
    await notificationService.markAllRead().catch(() => {})
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    clearUnread()
  }

  async function handleClick(item: NotificationItem) {
    if (!item.read) {
      await notificationService.markRead(item._id).catch(() => {})
      setItems(prev => prev.map(n => n._id === item._id ? { ...n, read: true } : n))
      decrementUnread()
    }
    setOpen(false)
    if (item.link) navigate(item.link)
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'MENTORSHIP_REQUEST':
        return <Users className="w-4 h-4 text-indigo-600" />
      case 'REQUEST_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />
      case 'REQUEST_DECLINED':
        return <XCircle className="w-4 h-4 text-rose-500" />
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_REMINDER':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'NEW_MESSAGE':
      case 'FORUM_REPLY':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />
      case 'FEEDBACK_RECEIVED':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
      case 'GOAL_COMPLETED':
        return <Target className="w-4 h-4 text-emerald-600" />
      default:
        return <Info className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-rose-500 text-white rounded-full shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-84 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No notifications yet
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {items.map(item => (
                <button
                  key={item._id}
                  onClick={() => handleClick(item)}
                  className={`w-full text-left p-3.5 hover:bg-slate-50 transition flex items-start gap-3 ${!item.read ? 'bg-indigo-50/40' : ''}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{fmt(item.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition py-1.5 rounded-lg hover:bg-indigo-50"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


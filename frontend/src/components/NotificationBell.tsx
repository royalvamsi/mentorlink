import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { notificationService, type NotificationItem } from '../services/notificationService'

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

  // Load on open
  useEffect(() => {
    if (!open) return
    setLoading(true)
    notificationService.getAll().then(data => {
      setItems(data.notifications.slice(0, 10))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open])

  // Inject real-time notification at top of list
  useEffect(() => {
    if (!latestNotification) return
    setItems(prev => {
      const exists = prev.some(n => n._id === latestNotification._id)
      return exists ? prev : [latestNotification, ...prev].slice(0, 10)
    })
  }, [latestNotification])

  // Close on outside click
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

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition">Mark all read</button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <div className="text-3xl mb-2">🔔</div>
              No notifications yet
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map(item => (
                <button
                  key={item._id}
                  onClick={() => handleClick(item)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition flex gap-3 ${!item.read ? 'bg-indigo-500/5' : ''}`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{ICONS[item.type] ?? 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      {!item.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.body}</p>
                    <p className="text-xs text-slate-500 mt-1">{fmt(item.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t border-slate-800">
            <button onClick={() => { navigate('/notifications'); setOpen(false) }} className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 transition py-1">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

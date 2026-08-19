import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import type { NotificationItem } from '../services/notificationService'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  isUserOnline: (userId: string) => boolean
  // Notifications
  unreadCount: number
  latestNotification: NotificationItem | null
  decrementUnread: () => void
  clearUnread: () => void
  incrementUnread: () => void
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  isUserOnline: () => false,
  unreadCount: 0,
  latestNotification: null,
  decrementUnread: () => {},
  clearUnread: () => {},
  incrementUnread: () => {},
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null)

  // Seed unread count from REST API on login
  useEffect(() => {
    if (!isAuthenticated || !token) { setUnreadCount(0); return }
    import('../services/notificationService').then(({ notificationService }) => {
      notificationService.getAll().then(data => setUnreadCount(data.unreadCount)).catch(() => {})
    })
  }, [isAuthenticated, token])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setOnlineUsers([])
      return
    }

    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    // On reconnect, re-sync unread count to catch anything missed while offline
    socket.on('connect', () => {
      import('../services/notificationService').then(({ notificationService }) => {
        notificationService.getAll().then(data => setUnreadCount(data.unreadCount)).catch(() => {})
      })
    })

    socket.on('online_users', (users: string[]) => {
      if (Array.isArray(users)) setOnlineUsers(users)
    })
    socket.on('user_online', ({ userId }: { userId: string }) => {
      if (userId) setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId])
    })
    socket.on('user_offline', ({ userId }: { userId: string }) => {
      if (userId) setOnlineUsers(prev => prev.filter(id => id !== userId))
    })

    // Real-time notification delivery
    socket.on('notification', (notification: NotificationItem) => {
      setLatestNotification(notification)
      setUnreadCount(prev => prev + 1)
    })


    socketRef.current = socket

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setOnlineUsers([])
    }
  }, [isAuthenticated, token])

  const isUserOnline = useCallback((userId: string): boolean => onlineUsers.includes(userId), [onlineUsers])
  const decrementUnread = useCallback(() => setUnreadCount(prev => Math.max(0, prev - 1)), [])
  const clearUnread = useCallback(() => setUnreadCount(0), [])
  const incrementUnread = useCallback(() => setUnreadCount(prev => prev + 1), [])

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, isConnected, onlineUsers, isUserOnline,
      unreadCount, latestNotification, decrementUnread, clearUnread, incrementUnread,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}

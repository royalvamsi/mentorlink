import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  isUserOnline: (userId: string) => boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  isUserOnline: () => false,
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

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
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('online_users', (users: string[]) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users)
      }
    })

    socket.on('user_online', ({ userId }: { userId: string }) => {
      if (userId) {
        setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
      }
    })

    socket.on('user_offline', ({ userId }: { userId: string }) => {
      if (userId) {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId))
      }
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setOnlineUsers([])
    }
  }, [isAuthenticated, token])

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId)
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}


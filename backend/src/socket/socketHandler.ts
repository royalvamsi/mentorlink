import { Server as HttpServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types/auth.types'
import { saveMessage, markRead } from '../services/chat.service'
import Conversation from '../models/Conversation'
import { Types } from 'mongoose'

// Map userId -> Set<socketId> (supports multiple active tabs per user)
const onlineUsers = new Map<string, Set<string>>()

export function initSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
  })

  // ─── JWT Authentication Middleware ───────────────────────────────────────
  io.use((socket: Socket, next) => {
    const rawAuth = socket.handshake.auth?.['token'] || socket.handshake.headers?.['authorization']
    const token = typeof rawAuth === 'string' ? rawAuth.replace('Bearer ', '').trim() : undefined

    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid token payload'))
      }
      ;(socket as Socket & { user: JwtPayload }).user = decoded
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: JwtPayload }).user
    if (!user || !user.userId) {
      socket.disconnect(true)
      return
    }
    const userId = user.userId

    // ─── Presence Management ────────────────────────────────────────────────
    const existingSockets = onlineUsers.get(userId) ?? new Set<string>()
    const wasOnline = existingSockets.size > 0
    existingSockets.add(socket.id)
    onlineUsers.set(userId, existingSockets)

    // Emit list of currently online user IDs to the newly connected client
    socket.emit('online_users', Array.from(onlineUsers.keys()))

    // Broadcast to others only if this is the user's first connected socket
    if (!wasOnline) {
      socket.broadcast.emit('user_online', { userId })
    }

    // ─── Join Conversation Room ─────────────────────────────────────────────
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        if (!conversationId || !Types.ObjectId.isValid(conversationId)) return
        const conv = await Conversation.findById(conversationId)
        if (!conv) return
        const isMember = conv.participants.some((p) => p.toString() === userId)
        if (!isMember) return
        socket.join(conversationId)
      } catch (err) {
        console.error('[Socket] join_conversation error:', err)
      }
    })

    // ─── Send Message ───────────────────────────────────────────────────────
    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data
        if (!content?.trim() || !conversationId || !Types.ObjectId.isValid(conversationId)) return

        // Verify membership before saving
        const conv = await Conversation.findById(conversationId)
        if (!conv) return
        const isMember = conv.participants.some((p) => p.toString() === userId)
        if (!isMember) return

        const message = await saveMessage(conversationId, userId, content)
        io.to(conversationId).emit('receive_message', message)
      } catch (err) {
        console.error('[Socket] send_message error:', err)
      }
    })

    // ─── Typing Indicators ──────────────────────────────────────────────────
    socket.on('typing', async (conversationId: string) => {
      try {
        if (!conversationId || !Types.ObjectId.isValid(conversationId)) return
        const conv = await Conversation.findById(conversationId)
        if (!conv) return
        const isMember = conv.participants.some((p) => p.toString() === userId)
        if (!isMember) return

        socket.to(conversationId).emit('user_typing', { userId, conversationId })
      } catch { /* ignore */ }
    })

    socket.on('stop_typing', async (conversationId: string) => {
      try {
        if (!conversationId || !Types.ObjectId.isValid(conversationId)) return
        socket.to(conversationId).emit('user_stop_typing', { userId, conversationId })
      } catch { /* ignore */ }
    })

    // ─── Mark Read ──────────────────────────────────────────────────────────
    socket.on('mark_read', async (conversationId: string) => {
      try {
        if (!conversationId || !Types.ObjectId.isValid(conversationId)) return
        await markRead(conversationId, userId)
        socket.to(conversationId).emit('messages_read', { conversationId, userId })
      } catch { /* ignore */ }
    })

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          io.emit('user_offline', { userId })
        }
      }
    })
  })

  return io
}

export function isUserOnline(userId: string): boolean {
  const sockets = onlineUsers.get(userId)
  return !!(sockets && sockets.size > 0)
}


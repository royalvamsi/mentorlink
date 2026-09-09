import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { chatService, type Conversation, type Message } from '../services/chatService'
import { Navbar } from '../components/Navbar'
import {
  Send,
  MessageSquare,
  Calendar,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

export default function ChatPage() {
  const { user } = useAuth()
  const { socket, isConnected, isUserOnline } = useSocket()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const targetUserId = (location.state as { targetUserId?: string })?.targetUserId || searchParams.get('userId')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [input, setInput] = useState('')
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)

  const activeConvRef = useRef<Conversation | null>(null)
  activeConvRef.current = activeConv

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Load Initial Conversations & Unread Counts ────────────────────────────
  useEffect(() => {
    let isMounted = true

    async function initData() {
      setLoadingConvs(true)
      try {
        const [convs, unreads] = await Promise.all([
          chatService.getConversations(),
          chatService.getUnreadCounts().catch(() => ({} as Record<string, number>)),
        ])

        if (!isMounted) return
        setConversations(convs)
        setUnreadCounts(unreads)

        // Handle targetUserId if requested via navigation
        if (targetUserId && targetUserId !== user?.id) {
          const existing = convs.find((c) => c.participants.some((p) => p._id === targetUserId))
          if (existing) {
            setActiveConv(existing)
          } else {
            try {
              const newConv = await chatService.openConversation(targetUserId)
              setConversations((prev) => [newConv, ...prev.filter((c) => c._id !== newConv._id)])
              setActiveConv(newConv)
            } catch {
              setErrorBanner('Could not open conversation with requested user.')
            }
          }
        } else if (convs.length > 0 && !activeConvRef.current) {
          setActiveConv(convs[0])
        }
      } catch {
        if (isMounted) setErrorBanner('Failed to load conversations.')
      } finally {
        if (isMounted) setLoadingConvs(false)
      }
    }

    initData()

    return () => {
      isMounted = false
    }
  }, [targetUserId, user?.id])

  // ─── Select & Load Messages ────────────────────────────────────────────────
  const loadMessages = useCallback(
    async (conv: Conversation) => {
      setLoadingMsgs(true)
      setMessages([])
      setTypingUser(null)
      socket?.emit('join_conversation', conv._id)

      try {
        const msgs = await chatService.getMessages(conv._id)
        setMessages(msgs)

        // Mark as read in backend and through socket
        await chatService.markRead(conv._id).catch(() => {})
        socket?.emit('mark_read', conv._id)

        // Clear local unread counter
        setUnreadCounts((prev) => ({ ...prev, [conv._id]: 0 }))
      } catch {
        setErrorBanner('Failed to load message history.')
      } finally {
        setLoadingMsgs(false)
      }
    },
    [socket]
  )

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv)
    }
  }, [activeConv, loadMessages])

  // ─── Auto Scroll to Bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  // ─── Stable Socket Event Listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (msg: Message) => {
      const currentActive = activeConvRef.current

      if (currentActive && msg.conversationId === currentActive._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        chatService.markRead(currentActive._id).catch(() => {})
        socket.emit('mark_read', currentActive._id)
      } else {
        // Increment unread count for other conversations
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.conversationId]: (prev[msg.conversationId] || 0) + 1,
        }))
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt, updatedAt: msg.createdAt }
            : c
        )
      )
    }

    const handleUserTyping = (data: { userId: string; conversationId: string }) => {
      const currentActive = activeConvRef.current
      if (currentActive && data.conversationId === currentActive._id && data.userId !== user?.id) {
        setTypingUser(data.userId)
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => setTypingUser(null), 2500)
      }
    }

    const handleUserStopTyping = (data: { userId: string; conversationId: string }) => {
      const currentActive = activeConvRef.current
      if (currentActive && data.conversationId === currentActive._id && data.userId !== user?.id) {
        setTypingUser(null)
      }
    }

    const handleMessagesRead = (data: { conversationId: string; userId: string }) => {
      const currentActive = activeConvRef.current
      if (currentActive && data.conversationId === currentActive._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.readBy.includes(data.userId) ? m : { ...m, readBy: [...m.readBy, data.userId] }
          )
        )
      }
    }

    socket.on('receive_message', handleReceiveMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('user_stop_typing', handleUserStopTyping)
    socket.on('messages_read', handleMessagesRead)

    return () => {
      socket.off('receive_message', handleReceiveMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stop_typing', handleUserStopTyping)
      socket.off('messages_read', handleMessagesRead)
    }
  }, [socket, user?.id])

  // ─── Input & Typing Handlers ────────────────────────────────────────────────
  function handleInputChange(value: string) {
    setInput(value)
    if (activeConv && socket && isConnected) {
      socket.emit('typing', activeConv._id)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => {
        if (activeConv) socket.emit('stop_typing', activeConv._id)
      }, 1500)
    }
  }

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const content = input.trim()
    if (!content || !activeConv || !socket || sendingMsg) return

    setSendingMsg(true)
    try {
      socket.emit('send_message', { conversationId: activeConv._id, content })
      socket.emit('stop_typing', activeConv._id)
      setInput('')
    } catch {
      setErrorBanner('Failed to send message.')
    } finally {
      setSendingMsg(false)
    }
  }

  function getOtherParticipant(conv: Conversation) {
    return conv.participants.find((p) => p._id !== user?.id) ?? conv.participants[0]
  }

  const activeOther = activeConv ? getOtherParticipant(activeConv) : null
  const activeIsOnline = activeOther ? isUserOnline(activeOther._id) : false

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Error Banner */}
      {errorBanner && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="hover:text-rose-900 ml-4 font-bold">×</button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 105px)' }}>
        {/* Conversation List Sidebar */}
        <aside className={`w-full md:w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Direct Messages</h2>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} title={isConnected ? 'Connected' : 'Reconnecting...'} />
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConvs ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 mb-1">No conversations yet</p>
                <p className="text-slate-400">Accepted mentorship requests will automatically appear here.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv)
                const isActive = activeConv?._id === conv._id
                const isOnline = other ? isUserOnline(other._id) : false
                const unread = unreadCounts[conv._id] || 0

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 transition text-left relative ${
                      isActive ? 'bg-indigo-50/60 border-l-3 border-indigo-600' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                        {other?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">{other?.name ?? 'User'}</span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1 font-medium">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">
                          {conv.lastMessage ?? 'Started a conversation'}
                        </p>
                        {unread > 0 && (
                          <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Chat Message Window */}
        <main className={`flex-1 flex flex-col bg-slate-50 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {!activeConv || !activeOther ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Select a conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a conversation from the sidebar or connect with a mentor to start collaborating.
              </p>
            </div>
          ) : (
            <>
              {/* Chat View Header */}
              <div className="px-4 sm:px-6 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                      {activeOther.name[0]?.toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        activeIsOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm leading-tight">{activeOther.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-600">
                        {activeOther.role}
                      </span>
                      <span>·</span>
                      <span className={activeIsOnline ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                        {activeIsOnline ? 'Active now' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/scheduling`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Schedule Session</span>
                  </Link>
                  <Link
                    to={`/profile`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    Profile
                  </Link>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMsgs ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 mb-1">Start the conversation</p>
                    <p className="text-[11px] text-slate-400">Say hello and introduce your goals or questions!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const sender = typeof msg.senderId === 'object' ? msg.senderId : null
                    const isMe = (sender?._id ?? msg.senderId) === user?.id
                    const isReadByOther = msg.readBy.some((id) => id === activeOther._id)

                    return (
                      <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-md md:max-w-lg px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs break-words ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400 font-medium">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span className={isReadByOther ? 'text-indigo-600' : 'text-slate-400'}>
                              {isReadByOther ? '✓✓ Read' : '✓ Sent'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Typing Indicator */}
                {typingUser && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 pl-1 pt-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                    <span className="font-semibold">{activeOther.name} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={isConnected ? 'Type your message...' : 'Reconnecting to chat...'}
                    disabled={!isConnected}
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || !isConnected || sendingMsg}
                    className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-sm flex items-center justify-center shrink-0"
                    aria-label="Send message"
                  >
                    {sendingMsg ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}



import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'

export function ConnectionStatusBanner() {
  const { isAuthenticated } = useAuth()
  const { isConnected } = useSocket()

  if (!isAuthenticated || isConnected) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-800 border border-amber-500/40 shadow-lg flex items-center gap-2 text-sm text-amber-300 animate-pulse">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Real-time connection lost — reconnecting…
    </div>
  )
}

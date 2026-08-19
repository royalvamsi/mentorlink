import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { schedulingService, type AvailabilitySlot, type Booking } from '../services/schedulingService'
import axios from 'axios'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-500/20 text-amber-300',
  CONFIRMED: 'bg-green-500/20 text-green-300',
  CANCELLED: 'bg-slate-700 text-slate-400',
  COMPLETED: 'bg-blue-500/20 text-blue-300',
  NO_SHOW:   'bg-red-500/20 text-red-300',
}

function fmt(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function toLocalInput(utcString?: string): string {
  if (!utcString) return ''
  const d = new Date(utcString)
  // Format as yyyy-MM-ddTHH:mm for datetime-local input
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function SchedulingPage() {
  const { user, logout } = useAuth()
  const isMentor = user?.role === 'SENIOR' || user?.role === 'ALUMNI'

  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Add slot form
  const [showAdd, setShowAdd] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [adding, setAdding] = useState(false)

  // Cancel modal
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      if (isMentor && user?.id) {
        const [s, b] = await Promise.all([schedulingService.getMentorSlots(user.id), schedulingService.getBookings('mentor')])
        setSlots(s); setBookings(b)
      } else {
        const b = await schedulingService.getBookings('mentee')
        setBookings(b)
      }
    } catch { setError('Failed to load scheduling data') }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [isMentor, user?.id])

  async function handleAddSlot(e: FormEvent) {
    e.preventDefault(); setAdding(true); setError(''); setSuccess('')
    try {
      await schedulingService.addSlot(new Date(startTime).toISOString(), new Date(endTime).toISOString())
      setSuccess('Slot added!'); setShowAdd(false); setStartTime(''); setEndTime('')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed to add slot')
    } finally { setAdding(false) }
  }

  async function handleDeleteSlot(id: string) {
    setError(''); setSuccess('')
    try { await schedulingService.deleteSlot(id); setSuccess('Slot deleted'); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed') }
  }

  async function handleStatus(bookingId: string, status: string) {
    if (status === 'CANCELLED') { setCancelId(bookingId); return }
    setError(''); setSuccess('')
    try { await schedulingService.updateBookingStatus(bookingId, status); setSuccess(`Session marked as ${status}`); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed') }
  }

  async function handleCancelConfirm() {
    if (!cancelId) return
    setError(''); setSuccess('')
    try {
      await schedulingService.updateBookingStatus(cancelId, 'CANCELLED', cancelReason || undefined)
      setSuccess('Booking cancelled'); setCancelId(null); setCancelReason('')
      await refresh()
    } catch (err) { if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed') }
  }

  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status) && new Date(b.startTime) >= new Date())
  const past = bookings.filter(b => !upcoming.includes(b))

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/mentorships" className="hover:text-white">Mentorships</Link>
            <Link to="/chat" className="hover:text-white">Chat</Link>
          </nav>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Scheduling</h1>
            <p className="text-sm text-slate-400 mt-1">All times shown in your local timezone</p>
          </div>
          {isMentor && (
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
              + Add Availability
            </button>
          )}
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}

        {/* Add Slot Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="font-bold text-white mb-4">Add Availability Slot</h2>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Start Time</label>
                  <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">End Time</label>
                  <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition">Cancel</button>
                  <button type="submit" disabled={adding} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition">
                    {adding ? 'Adding…' : 'Add Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {cancelId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="font-bold text-white mb-2">Cancel Booking</h2>
              <p className="text-slate-400 text-sm mb-4">Provide an optional reason for cancellation.</p>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="Reason (optional)"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition">Keep Booking</button>
                <button onClick={handleCancelConfirm} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">Cancel Booking</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Mentor: Available Slots */}
            {isMentor && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Slots ({slots.length})</h2>
                {slots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">No availability slots yet. Add your first slot!</div>
                ) : (
                  <div className="space-y-2">
                    {slots.map(slot => (
                      <div key={slot._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium text-sm">{fmt(slot.startTime)}</div>
                          <div className="text-slate-400 text-xs">to {fmt(slot.endTime)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {slot.isBooked ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">Booked</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">Open</span>
                          )}
                          {!slot.isBooked && (
                            <button onClick={() => handleDeleteSlot(slot._id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">Delete</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Upcoming Sessions */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming Sessions ({upcoming.length})</h2>
              {upcoming.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
                  {isMentor ? 'No upcoming confirmed sessions.' : <span>No sessions booked yet. <Link to="/mentors" className="text-indigo-400">Find a mentor</Link></span>}
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(b => {
                    const other = isMentor ? b.menteeId : b.mentorId
                    return (
                      <div key={b._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">{other.name[0]}</div>
                            <div>
                              <div className="font-medium text-white">{other.name}</div>
                              <div className="text-xs text-slate-400">{other.role}</div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                        </div>
                        <div className="text-sm text-slate-300 ml-12 mb-3">
                          <span className="font-medium">{fmt(b.startTime)}</span>
                          <span className="text-slate-500"> → </span>
                          <span>{fmt(b.endTime)}</span>
                        </div>
                        {b.notes && <p className="text-xs text-slate-400 ml-12 mb-3 italic">"{b.notes}"</p>}
                        <div className="flex gap-2 ml-12">
                          {isMentor && b.status === 'CONFIRMED' && (
                            <>
                              <button onClick={() => handleStatus(b._id, 'COMPLETED')} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition">Mark Completed</button>
                              <button onClick={() => handleStatus(b._id, 'NO_SHOW')} className="px-3 py-1.5 text-xs rounded-lg bg-orange-600/60 hover:bg-orange-600/80 text-white transition">No Show</button>
                            </>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(b.status) && (
                            <button onClick={() => handleStatus(b._id, 'CANCELLED')} className="px-3 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">Cancel</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Past Sessions */}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Past Sessions ({past.length})</h2>
                <div className="space-y-2">
                  {past.map(b => {
                    const other = isMentor ? b.menteeId : b.mentorId
                    return (
                      <div key={b._id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center justify-between opacity-75">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-slate-400 text-sm shrink-0">{other.name[0]}</div>
                          <div>
                            <div className="text-slate-300 text-sm font-medium">{other.name}</div>
                            <div className="text-slate-500 text-xs">{fmt(b.startTime)}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

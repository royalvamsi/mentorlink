import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { schedulingService, type AvailabilitySlot, type Booking } from '../services/schedulingService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-800 border-amber-200/80',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200/80',
  NO_SHOW:   'bg-rose-50 text-rose-700 border-rose-200/80',
}

function fmt(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export default function SchedulingPage() {
  const { user } = useAuth()
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
      setSuccess('Availability slot added successfully!'); setShowAdd(false); setStartTime(''); setEndTime('')
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
    try { await schedulingService.updateBookingStatus(bookingId, status); setSuccess(`Session marked as ${status.toLowerCase()}`); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed') }
  }

  async function handleCancelConfirm() {
    if (!cancelId) return
    setError(''); setSuccess('')
    try {
      await schedulingService.updateBookingStatus(cancelId, 'CANCELLED', cancelReason || undefined)
      setSuccess('Session cancelled'); setCancelId(null); setCancelReason('')
      await refresh()
    } catch (err) { if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed') }
  }

  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status) && new Date(b.startTime) >= new Date())
  const past = bookings.filter(b => !upcoming.includes(b))

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Calendar & 1-on-1 Sessions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Session Scheduling</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">All times automatically converted to your local timezone.</p>
          </div>

          {isMentor && (
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Availability Slot</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Add Slot Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Add Availability Slot</h2>
              <p className="text-xs text-slate-500 mb-5">Define when juniors can book 1-on-1 guidance sessions with you.</p>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 transition shadow-xs"
                  >
                    {adding ? 'Adding...' : 'Save Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {cancelId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Cancel Session</h2>
              <p className="text-xs text-slate-500 mb-4">Provide an optional note to let the other person know why you are cancelling.</p>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Reason for cancellation (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none mb-4"
              />
              <div className="flex gap-2.5">
                <button
                  onClick={() => setCancelId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Keep Session
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Mentor: Available Slots */}
            {isMentor && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    My Active Availability Slots ({slots.length})
                  </h2>
                </div>

                {slots.length === 0 ? (
                  <div className="text-center py-8 px-4 text-slate-500 text-xs bg-white border border-slate-200/80 rounded-2xl">
                    <Clock className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                    No open slots configured. Add your first time slot to let mentees book sessions with you!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map(slot => (
                      <div key={slot._id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between hover:shadow-xs transition">
                        <div>
                          <div className="text-slate-900 font-bold text-xs">{fmt(slot.startTime)}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">to {fmt(slot.endTime)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.isBooked ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                              Booked
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                              Open
                            </span>
                          )}
                          {!slot.isBooked && (
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Upcoming Sessions ({upcoming.length})
              </h2>

              {upcoming.length === 0 ? (
                <div className="text-center py-10 px-4 text-slate-400 text-xs bg-white border border-slate-200/80 rounded-2xl">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700 mb-1">No upcoming sessions</p>
                  {isMentor ? (
                    <p className="text-slate-400">Sessions booked by mentees will appear here.</p>
                  ) : (
                    <p>
                      Need guidance? <Link to="/mentors" className="text-indigo-600 font-bold hover:underline">Find a mentor</Link> and book a 1-on-1 session.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(b => {
                    const other = isMentor ? b.menteeId : b.mentorId
                    return (
                      <div key={b._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-xs transition">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0">
                              {other?.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm">{other?.name ?? 'User'}</span>
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              </div>
                              <span className="text-slate-500 text-xs font-medium">{other?.role}</span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${STATUS_COLORS[b.status] ?? 'bg-slate-100 text-slate-700'}`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700 mb-3">
                          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold">{fmt(b.startTime)}</span>
                          <span className="text-slate-400">→</span>
                          <span>{fmt(b.endTime)}</span>
                        </div>

                        {b.notes && (
                          <p className="text-xs text-slate-600 mb-3 italic">
                            "{b.notes}"
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                          {isMentor && b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleStatus(b._id, 'COMPLETED')}
                                className="px-3 py-1.5 text-xs rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold transition"
                              >
                                Mark Completed
                              </button>
                              <button
                                onClick={() => handleStatus(b._id, 'NO_SHOW')}
                                className="px-3 py-1.5 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-semibold transition"
                              >
                                No Show
                              </button>
                            </>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(b.status) && (
                            <button
                              onClick={() => handleStatus(b._id, 'CANCELLED')}
                              className="px-3 py-1.5 text-xs rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold transition"
                            >
                              Cancel Session
                            </button>
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
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Past Sessions History ({past.length})
                </h2>
                <div className="space-y-2">
                  {past.map(b => {
                    const other = isMentor ? b.menteeId : b.mentorId
                    return (
                      <div key={b._id} className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between opacity-85">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                            {other?.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <div className="text-slate-800 text-xs font-bold">{other?.name ?? 'User'}</div>
                            <div className="text-slate-400 text-[11px]">{fmt(b.startTime)}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STATUS_COLORS[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {b.status}
                        </span>
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


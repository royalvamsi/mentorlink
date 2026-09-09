import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { schedulingService, type AvailabilitySlot } from '../services/schedulingService'
import { mentorService, type MentorProfile } from '../services/mentorService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

function fmt(d: string) {
  return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function duration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim() : `${mins}m`
}

export default function BookSessionPage() {
  const { mentorId } = useParams<{ mentorId: string }>()
  const navigate = useNavigate()

  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mentorId) return
    Promise.all([
      mentorService.getMentorById(mentorId),
      schedulingService.getMentorSlots(mentorId),
    ]).then(([m, s]) => {
      setMentor(m)
      setSlots(s.filter(slot => !slot.isBooked))
    }).catch(() => setError('Failed to load availability')).finally(() => setLoading(false))
  }, [mentorId])

  async function handleBook() {
    if (!selected) return
    setBooking(true); setError('')
    try {
      await schedulingService.bookSlot(selected._id, notes || undefined)
      navigate('/scheduling', { state: { success: 'Session booked successfully!' } })
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Booking failed')
    } finally { setBooking(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Book a 1-on-1 Session</h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">Select an available time slot that fits your schedule.</p>

        {mentor && (
          <div className="flex items-center gap-3.5 mb-6 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              {mentor.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{mentor.name}</span>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                <span>{mentor.role}</span>
                {mentor.profile?.department && <span> · {mentor.profile.department}</span>}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Slot Picker */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Available Time Slots ({slots.length})
          </h2>

          {slots.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white border border-slate-200/80 rounded-2xl text-slate-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 mb-1">No open slots available</p>
              <p className="text-slate-400">This mentor currently has no available time slots. Check back soon or message them directly.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {slots.map(slot => (
                <button
                  key={slot._id}
                  onClick={() => setSelected(slot._id === selected?._id ? null : slot)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    selected?._id === slot._id
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected?._id === slot._id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-xs sm:text-sm">{fmt(slot.startTime)}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        Until {fmt(slot.endTime)} · <span className="font-semibold text-indigo-600">{duration(slot.startTime, slot.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  {selected?._id === slot._id && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Details Card */}
        {selected && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-base font-extrabold text-slate-900">Confirm Your Booking</h2>
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <p><strong className="text-slate-700">Scheduled Date:</strong> <span className="text-slate-900 font-semibold">{fmt(selected.startTime)}</span></p>
              <p><strong className="text-slate-700">Estimated Duration:</strong> <span className="text-indigo-600 font-semibold">{duration(selected.startTime, selected.endTime)}</span></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Session Agenda / Notes for Mentor (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="E.g., Resume review, system design prep, project architecture guidance..."
              />
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
            >
              {booking ? 'Confirming Booking...' : 'Confirm Session Booking'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { schedulingService, type AvailabilitySlot } from '../services/schedulingService'
import { mentorService, type MentorProfile } from '../services/mentorService'
import axios from 'axios'

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
    ]).then(([m, s]) => { setMentor(m); setSlots(s) }).catch(() => setError('Failed to load availability')).finally(() => setLoading(false))
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/mentors" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <Link to={`/mentors/${mentorId}`} className="text-sm text-slate-400 hover:text-white">← Back to Profile</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Book a Session</h1>
        {mentor && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">{mentor.name[0]}</div>
            <div>
              <div className="font-medium text-white">{mentor.name}</div>
              <div className="text-sm text-slate-400">{mentor.role} · {mentor.profile?.department}</div>
            </div>
          </div>
        )}

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Available Slots</h2>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
              No available slots at the moment. Check back later!
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map(slot => (
                <button
                  key={slot._id}
                  onClick={() => setSelected(slot._id === selected?._id ? null : slot)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selected?._id === slot._id
                      ? 'bg-indigo-600/20 border-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-sm">{fmt(slot.startTime)}</div>
                      <div className="text-slate-400 text-xs">to {fmt(slot.endTime)} · {duration(slot.startTime, slot.endTime)}</div>
                    </div>
                    {selected?._id === slot._id && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Confirm Booking</h2>
            <div className="text-sm text-slate-300 space-y-1">
              <p><span className="text-slate-500">Date:</span> {fmt(selected.startTime)}</p>
              <p><span className="text-slate-500">Duration:</span> {duration(selected.startTime, selected.endTime)}</p>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Notes for mentor (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} maxLength={500}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="What would you like to discuss?" />
            </div>
            <button onClick={handleBook} disabled={booking} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition">
              {booking ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

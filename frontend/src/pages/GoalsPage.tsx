import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { goalService, type Goal, type GoalStatus } from '../services/goalService'
import axios from 'axios'

const STATUS_COLORS: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-slate-700 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  COMPLETED:   'bg-green-500/20 text-green-300',
  ABANDONED:   'bg-slate-700/50 text-slate-500',
}

const STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  ABANDONED:   'Abandoned',
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}

function fmt(d: string) { return new Date(d).toLocaleDateString([], { dateStyle: 'medium' }) }

export default function GoalsPage() {
  const { user, logout } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  // Create goal modal
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [tags, setTags] = useState('')
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>([''])
  const [creating, setCreating] = useState(false)

  // Add milestone
  const [addingMilestoneTo, setAddingMilestoneTo] = useState<string | null>(null)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')

  async function refresh() {
    setLoading(true)
    try { setGoals(await goalService.getGoals(filterStatus || undefined)) }
    catch { setError('Failed to load goals') }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [filterStatus])

  async function handleCreate(e: FormEvent) {
    e.preventDefault(); setCreating(true); setError('')
    try {
      const ms = milestoneInputs.filter(t => t.trim()).map(t => ({ title: t }))
      await goalService.createGoal({ title, description: description || undefined, targetDate: targetDate || undefined, milestones: ms, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
      setSuccess('Goal created!'); setShowCreate(false); resetForm()
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed')
    } finally { setCreating(false) }
  }

  function resetForm() { setTitle(''); setDescription(''); setTargetDate(''); setTags(''); setMilestoneInputs(['']) }

  async function handleToggleMilestone(goalId: string, msId: string) {
    try {
      const updated = await goalService.toggleMilestone(goalId, msId)
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g))
    } catch { /* ignore */ }
  }

  async function handleAddMilestone(goalId: string) {
    if (!newMilestoneTitle.trim()) return
    try {
      const updated = await goalService.addMilestone(goalId, newMilestoneTitle)
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g))
      setAddingMilestoneTo(null); setNewMilestoneTitle('')
    } catch { /* ignore */ }
  }

  async function handleStatusChange(goalId: string, status: GoalStatus) {
    try {
      const updated = await goalService.updateGoal(goalId, { status })
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g))
    } catch { /* ignore */ }
  }

  async function handleDelete(goalId: string) {
    if (!confirm('Delete this goal?')) return
    try { await goalService.deleteGoal(goalId); setGoals(prev => prev.filter(g => g._id !== goalId)); setSuccess('Goal deleted') }
    catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/mentorships" className="hover:text-white">Mentorships</Link>
          </nav>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Goal Tracking</h1>
            <p className="text-sm text-slate-400 mt-1">Track your mentorship goals and milestones</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">+ New Goal</button>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-white mb-4">Create Goal</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Goal Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Get an internship at a tech company" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={2000}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="What does success look like?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Target Date</label>
                    <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Tags</label>
                    <input value={tags} onChange={e => setTags(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="internship, resume" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Milestones</label>
                  <div className="space-y-2">
                    {milestoneInputs.map((m, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={m} onChange={e => { const n = [...milestoneInputs]; n[i] = e.target.value; setMilestoneInputs(n) }}
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Milestone ${i + 1}`} />
                        {milestoneInputs.length > 1 && <button type="button" onClick={() => setMilestoneInputs(milestoneInputs.filter((_, j) => j !== i))} className="text-red-400 text-sm px-2">✕</button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setMilestoneInputs([...milestoneInputs, ''])} className="text-indigo-400 text-xs hover:text-indigo-300 transition">+ Add Milestone</button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); resetForm() }} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition">Cancel</button>
                  <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition">
                    {creating ? 'Creating…' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'].map(s => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
              {s ? STATUS_LABELS[s as GoalStatus] : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-3">🎯</div>
            <p className="font-medium text-slate-400">No goals yet</p>
            <p className="text-sm mt-1">Set your first goal to start tracking progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal._id} className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 ${goal.status === 'ABANDONED' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="font-semibold text-white">{goal.title}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[goal.status]}`}>{STATUS_LABELS[goal.status]}</span>
                    </div>
                    {goal.description && <p className="text-sm text-slate-400">{goal.description}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      {goal.targetDate && <span>🎯 Due {fmt(goal.targetDate)}</span>}
                      {goal.completedAt && <span>✅ Completed {fmt(goal.completedAt)}</span>}
                      {goal.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">#{t}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <select value={goal.status} onChange={e => handleStatusChange(goal._id, e.target.value as GoalStatus)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none cursor-pointer">
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ABANDONED">Abandoned</option>
                    </select>
                    <button onClick={() => handleDelete(goal._id)} className="text-xs px-2 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">✕</button>
                  </div>
                </div>

                {/* Progress */}
                {goal.milestones.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <ProgressBar value={goal.progress} />
                  </div>
                )}

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {goal.milestones.map(ms => (
                      <div key={ms._id} className="flex items-center gap-2">
                        <button onClick={() => handleToggleMilestone(goal._id, ms._id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${ms.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600 hover:border-indigo-500'}`}>
                          {ms.completed && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <span className={`text-sm ${ms.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{ms.title}</span>
                        {ms.dueDate && <span className="text-xs text-slate-500">({fmt(ms.dueDate)})</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add milestone */}
                {addingMilestoneTo === goal._id ? (
                  <div className="flex gap-2 mt-2">
                    <input autoFocus value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(goal._id) } if (e.key === 'Escape') { setAddingMilestoneTo(null); setNewMilestoneTitle('') } }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Milestone title…" />
                    <button onClick={() => handleAddMilestone(goal._id)} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition">Add</button>
                    <button onClick={() => { setAddingMilestoneTo(null); setNewMilestoneTitle('') }} className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs transition">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingMilestoneTo(goal._id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition mt-2">+ Add Milestone</button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

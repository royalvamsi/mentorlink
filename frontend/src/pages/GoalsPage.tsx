import { useState, useEffect, type FormEvent } from 'react'
import { goalService, type Goal, type GoalStatus } from '../services/goalService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react'

const STATUS_COLORS: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  ABANDONED:   'bg-slate-100 text-slate-400 border-slate-200',
}

const STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  ABANDONED:   'Abandoned',
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-500 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString([], { dateStyle: 'medium' })
}

export default function GoalsPage() {
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

  function resetForm() {
    setTitle('')
    setDescription('')
    setTargetDate('')
    setTags('')
    setMilestoneInputs([''])
  }

  async function refresh() {
    setLoading(true)
    try {
      setGoals(await goalService.getGoals(filterStatus || undefined))
    } catch {
      setError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [filterStatus])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true); setError(''); setSuccess('')
    try {
      const validMilestones = milestoneInputs.filter(m => m.trim()).map(t => ({ title: t }))
      await goalService.createGoal({
        title,
        description: description || undefined,
        targetDate: targetDate || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        milestones: validMilestones.length ? validMilestones : undefined,
      })
      setSuccess('Mentorship goal created successfully!');
      setShowCreate(false)
      resetForm()
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed to create goal')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleMilestone(goalId: string, milestoneId: string) {
    try {
      const updated = await goalService.toggleMilestone(goalId, milestoneId)
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g))
    } catch { /* ignore */ }
  }

  async function handleAddMilestone(goalId: string) {
    if (!newMilestoneTitle.trim()) return
    try {
      const updated = await goalService.addMilestone(goalId, newMilestoneTitle.trim())
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g))
      setNewMilestoneTitle(''); setAddingMilestoneTo(null)
    } catch { /* ignore */ }
  }

  async function handleStatusChange(goalId: string, status: GoalStatus) {
    try {
      const updated = await goalService.updateGoal(goalId, { status })
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g))
    } catch { /* ignore */ }
  }

  async function handleDelete(goalId: string) {
    if (!confirm('Are you sure you want to delete this goal?')) return
    try {
      await goalService.deleteGoal(goalId)
      setGoals(prev => prev.filter(g => g._id !== goalId))
      setSuccess('Goal deleted')
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Mentorship Milestones</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Goals & Progress</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Track your personal, academic, and internship roadmap.</p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
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

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Create Mentorship Goal</h2>
              <p className="text-xs text-slate-500 mb-5">Set a structured target and break it down into actionable milestones.</p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Goal Title *</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Build Full-Stack Portfolio & Secure Summer SWE Internship"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Description & Scope</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="What specific skills or milestones will define success?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Completion Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags (Comma-separated)</label>
                    <input
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="react, resume, leetcode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Milestones</label>
                  <div className="space-y-2">
                    {milestoneInputs.map((m, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={m}
                          onChange={e => {
                            const n = [...milestoneInputs]
                            n[i] = e.target.value
                            setMilestoneInputs(n)
                          }}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Milestone ${i + 1} (e.g. Finish Resume Draft)`}
                        />
                        {milestoneInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMilestoneInputs(milestoneInputs.filter((_, j) => j !== i))}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMilestoneInputs([...milestoneInputs, ''])}
                      className="text-indigo-600 text-xs font-bold hover:text-indigo-700 transition"
                    >
                      + Add Another Milestone
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); resetForm() }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 transition shadow-xs"
                  >
                    {creating ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {['', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s ? STATUS_LABELS[s as GoalStatus] : 'All Goals'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">No goals recorded yet</p>
            <p className="text-xs text-slate-500 mb-5">
              Set clear objectives to keep your mentor informed and track your measurable growth.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              Set First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => (
              <div
                key={goal._id}
                className={`bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow ${
                  goal.status === 'ABANDONED' ? 'opacity-65' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="font-extrabold text-slate-900 text-base">{goal.title}</h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[goal.status]}`}>
                        {STATUS_LABELS[goal.status]}
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mb-2 leading-relaxed">{goal.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {goal.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Due {fmt(goal.targetDate)}</span>
                        </span>
                      )}
                      {goal.completedAt && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed {fmt(goal.completedAt)}</span>
                        </span>
                      )}
                      {goal.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={goal.status}
                      onChange={e => handleStatusChange(goal._id, e.target.value as GoalStatus)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ABANDONED">Abandoned</option>
                    </select>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {goal.milestones.length > 0 && (
                  <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Overall Progress</span>
                      <span className="text-indigo-600">{goal.progress}%</span>
                    </div>
                    <ProgressBar value={goal.progress} />
                  </div>
                )}

                {/* Milestones checklist */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {goal.milestones.map(ms => (
                      <div key={ms._id} className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleToggleMilestone(goal._id, ms._id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                            ms.completed
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 hover:border-indigo-500 bg-white'
                          }`}
                        >
                          {ms.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`text-xs ${ms.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-medium'}`}>
                          {ms.title}
                        </span>
                        {ms.dueDate && (
                          <span className="text-[10px] text-slate-400">({fmt(ms.dueDate)})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add milestone inline */}
                {addingMilestoneTo === goal._id ? (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <input
                      autoFocus
                      value={newMilestoneTitle}
                      onChange={e => setNewMilestoneTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(goal._id) }
                        if (e.key === 'Escape') { setAddingMilestoneTo(null); setNewMilestoneTitle('') }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Milestone title..."
                    />
                    <button
                      onClick={() => handleAddMilestone(goal._id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingMilestoneTo(null); setNewMilestoneTitle('') }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingMilestoneTo(goal._id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


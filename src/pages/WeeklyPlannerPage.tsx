import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../stores/useStore'
import { Calendar, Plus, X, Save, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useSaveToast } from '../components/SaveToast'
import type { WodType } from '../types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekStart(offset: number = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7) // Monday
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

// One-time migration from localStorage to Dexie
const LEGACY_KEY = 'trackvolt_weekly_plans'
async function migrateLegacyPlans(saveFn: (plan: { weekKey: string; dayIndex: number; name: string; type: WodType; description: string; completed: boolean }) => Promise<void>) {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return
    const legacy = JSON.parse(raw) as Record<string, { dayIndex: number; name: string; type: WodType; description: string; completed: boolean }[]>
    for (const [weekKey, plans] of Object.entries(legacy)) {
      for (const plan of plans) {
        await saveFn({ weekKey, dayIndex: plan.dayIndex, name: plan.name, type: plan.type, description: plan.description, completed: plan.completed })
      }
    }
    localStorage.removeItem(LEGACY_KEY)
  } catch { /* ignore migration errors */ }
}

export function WeeklyPlannerPage() {
  const { workouts, loadWorkouts, weeklyPlans, loadWeeklyPlans, saveWeeklyPlan, deleteWeeklyPlan, toggleWeeklyPlanComplete } = useStore()
  const { showToast, toastEl } = useSaveToast()
  const [weekOffset, setWeekOffset] = useState(0)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<WodType>('AMRAP')
  const [editDesc, setEditDesc] = useState('')
  const [migrated, setMigrated] = useState(false)

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset])
  const weekKey = formatDate(weekStart)

  useEffect(() => { loadWorkouts() }, [])

  // Migrate legacy localStorage data once
  useEffect(() => {
    if (!migrated) {
      migrateLegacyPlans(saveWeeklyPlan).then(() => {
        setMigrated(true)
        loadWeeklyPlans(weekKey)
      })
    }
  }, [migrated])

  // Load plans when week changes
  useEffect(() => { loadWeeklyPlans(weekKey) }, [weekKey])

  const weekDates = useMemo(() => {
    return DAYS.map((_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return formatDate(d)
    })
  }, [weekStart])

  // Check which days have actual logged workouts
  const loggedDays = useMemo(() => {
    const set = new Set<number>()
    weekDates.forEach((date, i) => {
      if (workouts.some(w => w.date === date)) set.add(i)
    })
    return set
  }, [weekDates, workouts])

  const todayIndex = (() => {
    const today = formatDate(new Date())
    return weekDates.indexOf(today)
  })()

  const isThisWeek = weekOffset === 0

  const addWorkout = async () => {
    if (!editName.trim()) {
      showToast('Enter a workout name', 'error')
      return
    }
    if (editingDay === null) return
    await saveWeeklyPlan({
      weekKey,
      dayIndex: editingDay,
      name: editName.trim(),
      type: editType,
      description: editDesc.trim(),
      completed: false,
    })
    setEditingDay(null)
    setEditName('')
    setEditDesc('')
    showToast('Workout planned!')
  }

  const removeWorkout = async (id: number) => {
    await deleteWeeklyPlan(id)
  }

  const handleToggleComplete = async (id: number) => {
    await toggleWeeklyPlanComplete(id)
  }

  const plannedCount = weeklyPlans.length
  const completedCount = weeklyPlans.filter((p: import('../types').WeeklyPlan) => p.completed || loggedDays.has(p.dayIndex)).length

  return (
    <div className="space-y-3">
      {toastEl}
      <h2 className="text-lg font-bold text-ct-1 flex items-center gap-2">
        <Calendar size={20} className="text-cyan-400" />
        Weekly Planner
      </h2>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
        <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-lg active:bg-ct-elevated/50" aria-label="Previous week">
          <ChevronLeft size={20} className="text-ct-2" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-ct-1">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} \u2014 {
              (() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })()
            }
          </p>
          {isThisWeek && <p className="text-[11px] text-cyan-400 font-bold">This Week</p>}
        </div>
        <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-lg active:bg-ct-elevated/50" aria-label="Next week">
          <ChevronRight size={20} className="text-ct-2" />
        </button>
      </div>

      {/* Progress bar */}
      {plannedCount > 0 && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[11px] text-ct-2">Week Progress</p>
            <p className="text-xs font-bold text-cyan-400">{completedCount}/{plannedCount}</p>
          </div>
          <div className="h-2 bg-ct-elevated rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${(completedCount / plannedCount) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Day cards */}
      {DAYS.map((day, i) => {
        const dayPlans = weeklyPlans.filter((p: { dayIndex: number }) => p.dayIndex === i)
        const hasLogged = loggedDays.has(i)
        const isToday = i === todayIndex && isThisWeek
        return (
          <div key={i} className={`bg-ct-surface rounded-ct-lg p-3 border ${
            isToday ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-ct-border'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${isToday ? 'text-cyan-400' : 'text-ct-1'}`}>{day}</p>
                <p className="text-[11px] text-ct-2">{weekDates[i].slice(5)}</p>
                {isToday && <span className="text-[11px] font-bold bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full">TODAY</span>}
                {hasLogged && <Check size={12} className="text-green-400" />}
              </div>
              <button onClick={() => { setEditingDay(i); setEditName(''); setEditDesc('') }}
                className="p-2 rounded-lg bg-ct-elevated/50 active:bg-slate-600/50" aria-label={`Add workout for ${day}`}>
                <Plus size={14} className="text-ct-2" />
              </button>
            </div>

            {dayPlans.length === 0 && !hasLogged && (
              <p className="text-[11px] text-ct-2 italic">Rest day</p>
            )}

            {dayPlans.map((p: import('../types').WeeklyPlan) => (
              <div key={p.id} className={`flex items-center gap-2 py-1.5 border-t border-slate-700/30`}>
                <button onClick={() => handleToggleComplete(p.id!)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    p.completed || hasLogged ? 'bg-green-500/20 border-green-500' : 'border-slate-600'
                  }`}>
                  {(p.completed || hasLogged) && <Check size={10} className="text-green-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${p.completed ? 'text-ct-2 line-through' : 'text-ct-1'}`}>{p.name}</p>
                  <p className="text-[11px] text-ct-2">{p.type}{p.description ? ` \u2014 ${p.description}` : ''}</p>
                </div>
                <button onClick={() => removeWorkout(p.id!)}
                  className="p-2 rounded-lg active:bg-ct-elevated/50" aria-label={`Remove ${p.name}`}>
                  <X size={12} className="text-ct-2" />
                </button>
              </div>
            ))}
          </div>
        )
      })}

      {/* Add workout modal */}
      {editingDay !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setEditingDay(null)}>
          <div className="bg-slate-800 rounded-t-2xl p-5 w-full max-w-lg border-t border-slate-700" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-ct-1 mb-3">Plan {DAYS[editingDay]}'s Workout</p>
            <input
              type="text" value={editName} onChange={e => setEditName(e.target.value)}
              placeholder="Workout name (e.g. Fran, Back Squat)"
              className="w-full bg-ct-elevated/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-ct-1 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 mb-2"
              autoFocus
            />
            <select value={editType} onChange={e => setEditType(e.target.value as WodType)}
              className="w-full bg-ct-elevated/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-ct-1 mb-2 focus:outline-none focus:ring-1 focus:ring-cyan-400">
              {['AMRAP', 'ForTime', 'EMOM', 'Tabata', 'Chipper', 'Strength', 'StrengthMetcon', 'HYROX', 'Running', 'Cardio', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full bg-ct-elevated/50 border border-slate-600/50 rounded-xl py-2.5 px-3 text-sm text-ct-1 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setEditingDay(null)} className="flex-1 bg-ct-elevated text-ct-2 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={addWorkout} disabled={!editName.trim()}
                className={`flex-1 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 ${
                  editName.trim() ? 'bg-cyan-500 text-black active:scale-[0.98]' : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
                }`}>
                <Save size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
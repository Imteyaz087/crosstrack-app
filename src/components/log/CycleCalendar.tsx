import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X, Droplets } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday as isDateToday } from 'date-fns'
import { PHASE_COLORS } from '../../hooks/useCycleTracking'
import type { CycleLog, CycleSettings, CyclePhase } from '../../types'

interface CycleCalendarProps {
  cycleLogs: CycleLog[]
  settings: CycleSettings | null
  currentPhase: CyclePhase | null
  cycleDay: number | null
  onClose: () => void
  onDaySelect?: (date: string) => void
}

export function CycleCalendar({
  cycleLogs,
  settings,
  currentPhase,
  cycleDay,
  onClose,
  onDaySelect,
}: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Calculate phase for a given date
  const getPhaseForDate = (date: Date): CyclePhase | null => {
    if (!settings?.lastPeriodStart) return null
    const start = new Date(settings.lastPeriodStart)
    const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const cycleLen = settings.averageCycleLength || 28
    const periodLen = settings.averagePeriodLength || 5
    const ovDay = cycleLen - 14

    const dayInCycle = ((diff % cycleLen) + cycleLen) % cycleLen + 1

    if (dayInCycle <= periodLen) return 'menstrual'
    if (dayInCycle < ovDay - 1) return 'follicular'
    if (dayInCycle <= ovDay + 1) return 'ovulation'
    return 'luteal'
  }

  // Calculate cycle day for a given date
  const getCycleDayForDate = (date: Date): number => {
    if (!settings?.lastPeriodStart) return 1
    const start = new Date(settings.lastPeriodStart)
    const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const cycleLen = settings.averageCycleLength || 28
    const dayInCycle = ((diff % cycleLen) + cycleLen) % cycleLen + 1
    return dayInCycle
  }

  // Get log for date
  const getLogForDate = (date: Date): CycleLog | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return cycleLogs.find(l => l.date === dateStr)
  }

  // Calendar setup
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate stats
  const nextPeriodDate = useMemo(() => {
    if (!settings?.lastPeriodStart) return null
    const start = new Date(settings.lastPeriodStart)
    const cycleLen = settings.averageCycleLength || 28
    let nextStart = new Date(start.getTime() + cycleLen * 24 * 60 * 60 * 1000)
    const now = new Date()
    // If next period is in past, keep adding cycle length until we get a future date
    while (nextStart <= now) {
      nextStart = new Date(nextStart.getTime() + cycleLen * 24 * 60 * 60 * 1000)
    }
    return nextStart
  }, [settings])

  const daysUntilPeriod = useMemo(() => {
    if (!nextPeriodDate) return null
    const diff = Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }, [nextPeriodDate])

  // Get selected day details
  const selectedDayLog = selectedDate ? cycleLogs.find(l => l.date === selectedDate) : null
  const selectedPhase = selectedDate ? getPhaseForDate(new Date(selectedDate)) : null
  const selectedCycleDay = selectedDate ? getCycleDayForDate(new Date(selectedDate)) : null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50" role="dialog" aria-modal="true" aria-label="Cycle Calendar">
      <div className="w-full bg-ct-bg rounded-t-3xl p-4 pb-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ct-1">Cycle Calendar</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg active:bg-ct-elevated/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="text-ct-2" />
          </button>
        </div>

        {/* Cycle Stats Bar */}
        {settings && cycleDay !== null && (
          <div className="mb-4 bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">Cycle Day</p>
                <p className="text-lg font-bold text-ct-1">{cycleDay}/{settings.averageCycleLength}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">Next Period</p>
                <p className="text-lg font-bold text-ct-1">{daysUntilPeriod ?? '-'} days</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">Phase</p>
                {currentPhase ? (
                  <p className="text-lg font-bold" style={{ color: PHASE_COLORS[currentPhase].bg }}>{PHASE_COLORS[currentPhase].label}</p>
                ) : (
                  <p className="text-lg font-bold text-ct-1"> - </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Month Navigation */}
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border mb-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
              }
              className="p-2 rounded-lg active:bg-ct-elevated/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} className="text-ct-2" />
            </button>
            <span className="text-sm font-bold text-ct-1">{format(currentMonth, 'MMMM yyyy')}</span>
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
              }
              className="p-2 rounded-lg active:bg-ct-elevated/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight size={20} className="text-ct-2" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayHeaders.map((d, i) => (
              <div key={i} className="text-[11px] text-ct-2 font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding for days before month starts */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {/* Days of month */}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const phase = getPhaseForDate(day)
              const log = getLogForDate(day)
              const isToday = isDateToday(day)
              const isSelected = selectedDate === dateStr
              const phaseColor = phase ? PHASE_COLORS[phase] : null

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(selectedDate === dateStr ? null : dateStr)
                    onDaySelect?.(dateStr)
                  }}
                  className={`relative min-h-[52px] flex flex-col items-center justify-center rounded-lg transition-all border-2 ${
                    isToday
                      ? 'border-white ring-2 ring-white/20'
                      : isSelected
                        ? 'border-ct-1'
                        : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor: phaseColor
                      ? `${phaseColor.bg}20`
                      : 'transparent',
                  }}
                >
                  {/* Day number */}
                  <span className="text-xs font-semibold text-ct-1">
                    {day.getDate()}
                  </span>

                  {/* Period indicator dot */}
                  {log?.periodActive && (
                    <div
                      className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PHASE_COLORS.menstrual.bg }}
                      aria-label="Period active"
                    />
                  )}

                  {/* Symptom/mood indicator */}
                  {log?.symptoms && log.symptoms.length > 0 && (
                    <div
                      className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-ct-2"
                      aria-label="Has symptoms logged"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Phase Legend */}
        <div className="mb-4 bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
          <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-3">
            Phases
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg }}
                />
                <span className="text-xs text-ct-2">{color.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Detail */}
        {selectedDate && selectedPhase && selectedCycleDay && (
          <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: PHASE_COLORS[selectedPhase].bg }}
              />
              <h3 className="text-sm font-bold text-ct-1">
                {PHASE_COLORS[selectedPhase].label} (Day {selectedCycleDay})
              </h3>
            </div>

            {selectedDayLog ? (
              <div className="space-y-3">
                {/* Period */}
                {selectedDayLog.periodActive && (
                  <div className="flex items-center gap-2 pb-3 border-b border-ct-border">
                    <Droplets size={14} className="text-red-400 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold">
                        Period
                      </p>
                      <p className="text-sm text-ct-1 font-medium">
                        {selectedDayLog.flowLevel
                          ? selectedDayLog.flowLevel.charAt(0).toUpperCase() +
                            selectedDayLog.flowLevel.slice(1)
                          : 'Active'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                {selectedDayLog.symptoms && selectedDayLog.symptoms.length > 0 && (
                  <div className="pb-3 border-b border-ct-border">
                    <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">
                      Symptoms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDayLog.symptoms.map(symptom => (
                        <span
                          key={symptom}
                          className="px-2 py-1 bg-ct-elevated/50 text-ct-1 rounded-md text-[11px] font-medium"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mood & Energy */}
                {(selectedDayLog.mood || selectedDayLog.energy) && (
                  <div className="pb-3 border-b border-ct-border">
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDayLog.mood && (
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-1">
                            Mood
                          </p>
                          <p className="text-xs text-ct-1 capitalize">
                            {selectedDayLog.mood}
                          </p>
                        </div>
                      )}
                      {selectedDayLog.energy && (
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-1">
                            Energy
                          </p>
                          <p className="text-xs text-ct-1 capitalize">
                            {selectedDayLog.energy}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sleep Quality */}
                {selectedDayLog.sleepQuality && (
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-1">
                      Sleep
                    </p>
                    <p className="text-xs text-ct-1 capitalize">
                      {selectedDayLog.sleepQuality}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedDayLog.notes && (
                  <div className="pt-2 border-t border-ct-border">
                    <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-1">
                      Notes
                    </p>
                    <p className="text-xs text-ct-2">{selectedDayLog.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-ct-2">No log for this day</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

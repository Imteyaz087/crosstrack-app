import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Shield, ChevronRight, Droplets, Heart } from 'lucide-react'
import { PHASE_COLORS, PHASE_TRAINING, SYMPTOM_OPTIONS } from '../../hooks/useCycleTracking'
import type { CyclePhase, CycleMood, CycleEnergy, FlowLevel, CycleLog } from '../../types'

interface CycleLoggerProps {
  currentPhase: CyclePhase | null
  cycleDay: number | null
  daysUntilPeriod: number | null
  todayLog: CycleLog | null
  trainingRec: typeof PHASE_TRAINING[CyclePhase] | null
  phaseColor: typeof PHASE_COLORS[CyclePhase] | null
  onSave: (log: {
    periodActive: boolean
    flowLevel?: FlowLevel
    symptoms: string[]
    mood?: CycleMood
    energy?: CycleEnergy
    sleepQuality?: 'great' | 'good' | 'poor' | 'terrible'
    notes?: string
  }) => Promise<void>
  onOpenCalendar: () => void
  onClose: () => void
}

const MOOD_OPTIONS: { value: CycleMood; emoji: string }[] = [
  { value: 'great', emoji: '😊' },
  { value: 'good', emoji: '😌' },
  { value: 'okay', emoji: '😐' },
  { value: 'low', emoji: '😔' },
  { value: 'bad', emoji: '😤' },
]

const ENERGY_OPTIONS: { value: CycleEnergy; color: string }[] = [
  { value: 'high', color: 'bg-green-500/20 text-green-400 border-green-400/30' },
  { value: 'normal', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' },
  { value: 'low', color: 'bg-orange-500/20 text-orange-400 border-orange-400/30' },
  { value: 'exhausted', color: 'bg-red-500/20 text-red-400 border-red-400/30' },
]

export function CycleLogger({
  currentPhase: _currentPhase, cycleDay, daysUntilPeriod, todayLog,
  trainingRec, phaseColor,
  onSave, onOpenCalendar, onClose,
}: CycleLoggerProps) {
  void _currentPhase
  const { t } = useTranslation()
  const [periodActive, setPeriodActive] = useState(todayLog?.periodActive || false)
  const [flowLevel, setFlowLevel] = useState<FlowLevel | undefined>(todayLog?.flowLevel)
  const [symptoms, setSymptoms] = useState<string[]>(todayLog?.symptoms || [])
  const [mood, setMood] = useState<CycleMood | undefined>(todayLog?.mood)
  const [energy, setEnergy] = useState<CycleEnergy | undefined>(todayLog?.energy)
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)
  const [showTrainingRec, setShowTrainingRec] = useState(false)

  // Restore from todayLog if it changes
  useEffect(() => {
    if (todayLog) {
      setPeriodActive(todayLog.periodActive)
      setFlowLevel(todayLog.flowLevel)
      setSymptoms(todayLog.symptoms || [])
      setMood(todayLog.mood)
      setEnergy(todayLog.energy)
    }
  }, [todayLog])

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSave = async () => {
    await onSave({ periodActive, flowLevel, symptoms, mood, energy })
    onClose()
  }

  const phaseLabel = phaseColor?.label || 'Unknown'
  const phaseEmoji = phaseColor?.emoji || '⚪'

  // Flow level options using translation keys
  const FLOW_OPTIONS: { value: FlowLevel; labelKey: string }[] = [
    { value: 'spotting', labelKey: 'cycle.spotting' },
    { value: 'light', labelKey: 'cycle.light' },
    { value: 'medium', labelKey: 'cycle.medium' },
    { value: 'heavy', labelKey: 'cycle.heavy' },
  ]

  // Quick symptoms — keep English as stored values, show translated labels
  const quickSymptoms = [
    { value: 'Cramps', labelKey: 'cycle.cramps' },
    { value: 'Fatigue', labelKey: 'cycle.fatigue' },
    { value: 'Bloating', labelKey: 'cycle.bloating' },
    { value: 'Headache', labelKey: 'cycle.headache' },
    { value: 'Back pain', labelKey: 'cycle.backPain' },
    { value: 'Mood swings', labelKey: 'cycle.moodSwings' },
  ]
  const quickSymptomValues = quickSymptoms.map(s => s.value)

  // Mood key lookup
  const moodKeyMap: Record<string, string> = {
    great: 'cycle.moodGreat',
    good: 'cycle.moodGood',
    okay: 'cycle.moodOkay',
    low: 'cycle.moodLow',
    bad: 'cycle.moodBad',
  }

  // Energy key lookup
  const energyKeyMap: Record<string, string> = {
    high: 'cycle.energyHigh',
    normal: 'cycle.energyNormal',
    low: 'cycle.energyLow',
    exhausted: 'cycle.energyExhausted',
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-ct-1">{t('cycle.tracker')}</h1>
          <p className="text-xs text-ct-2 mt-0.5">{t('cycle.howAreYouToday')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenCalendar}
            className="w-11 h-11 rounded-xl bg-ct-surface flex items-center justify-center text-ct-2 active:text-ct-1 active:bg-slate-700"
            aria-label={t('cycle.calendar')}>
            <ChevronRight size={20} />
          </button>
          <button onClick={onClose}
            className="w-11 h-11 rounded-xl bg-ct-surface flex items-center justify-center text-ct-2 active:text-ct-1 active:bg-slate-700"
            aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Phase indicator card */}
      <div className="rounded-ct-lg p-4 border" style={{
        background: `linear-gradient(135deg, ${phaseColor?.bg || '#64748b'}15, transparent)`,
        borderColor: `${phaseColor?.bg || '#64748b'}30`,
      }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: `${phaseColor?.bg || '#94a3b8'}` }}>
              {phaseEmoji} {phaseLabel} {t('cycle.phase')}
            </p>
            <p className="text-2xl font-bold text-ct-1 mt-1">{t('cycle.dayOf')} {cycleDay || '—'}</p>
          </div>
          <div className="text-right">
            {daysUntilPeriod !== null && daysUntilPeriod > 0 && (
              <p className="text-xs text-ct-2">
                {t('cycleCard.daysUntilPeriod', { count: daysUntilPeriod })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Period toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => { setPeriodActive(true); if (!flowLevel) setFlowLevel('medium') }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all min-h-[48px] ${
            periodActive
              ? 'bg-red-500/15 text-red-400 border border-red-400/30 shadow-sm'
              : 'bg-slate-800/40 text-ct-2 border border-slate-700/30'
          }`}
        >
          <Droplets size={16} /> {t('cycle.periodStarted')}
        </button>
        <button
          onClick={() => { setPeriodActive(false); setFlowLevel(undefined) }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all min-h-[48px] ${
            !periodActive
              ? 'bg-green-500/15 text-green-400 border border-green-400/30 shadow-sm'
              : 'bg-slate-800/40 text-ct-2 border border-slate-700/30'
          }`}
        >
          <Heart size={16} /> {t('cycle.noPeriod')}
        </button>
      </div>

      {/* Flow level — only when period active */}
      {periodActive && (
        <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
          <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('cycle.flowLevelLabel')}</p>
          <div className="flex gap-2">
            {FLOW_OPTIONS.map(f => (
              <button key={f.value}
                onClick={() => setFlowLevel(f.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                  flowLevel === f.value
                    ? 'bg-red-500/15 text-red-400 border border-red-400/30'
                    : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                }`}>{t(f.labelKey)}</button>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms — quick access */}
      <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('cycle.symptoms')}</p>
        <div className="flex flex-wrap gap-1.5">
          {quickSymptoms.map(s => (
            <button key={s.value}
              onClick={() => toggleSymptom(s.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                symptoms.includes(s.value)
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30'
                  : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
              }`}>{t(s.labelKey)}</button>
          ))}
        </div>
        <button onClick={() => setShowAllSymptoms(!showAllSymptoms)}
          className="text-[11px] text-cyan-400 font-semibold mt-2 active:text-cyan-300">
          {showAllSymptoms ? t('cycle.showLess') : t('cycle.moreSymptoms')}
        </button>
        {showAllSymptoms && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] text-ct-2 font-medium">{t('cycle.physical')}</p>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_OPTIONS.physical.filter(s => !quickSymptomValues.includes(s)).map(s => (
                <button key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    symptoms.includes(s)
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/30'
                      : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                  }`}>{s}</button>
              ))}
            </div>
            <p className="text-[11px] text-ct-2 font-medium">{t('cycle.moodMental')}</p>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_OPTIONS.mood.map(s => (
                <button key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    symptoms.includes(s)
                      ? 'bg-violet-500/15 text-violet-400 border border-violet-400/30'
                      : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mood */}
      <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('cycle.mood')}</p>
        <div className="flex gap-1.5">
          {MOOD_OPTIONS.map(m => (
            <button key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all min-h-[56px] ${
                mood === m.value
                  ? 'bg-violet-500/15 border border-violet-400/30 shadow-sm'
                  : 'bg-ct-elevated/50 border border-transparent'
              }`}>
              <span className="text-lg">{m.emoji}</span>
              <span className={`text-[11px] font-semibold ${mood === m.value ? 'text-violet-400' : 'text-ct-2'}`}>
                {t(moodKeyMap[m.value] || m.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div className="bg-ct-surface rounded-ct-lg p-3 border border-ct-border">
        <p className="text-[11px] uppercase tracking-widest text-ct-2 font-semibold mb-2">{t('cycle.energyLevel')}</p>
        <div className="flex gap-2">
          {ENERGY_OPTIONS.map(e => (
            <button key={e.value}
              onClick={() => setEnergy(e.value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] border ${
                energy === e.value ? e.color : 'bg-ct-elevated/50 text-ct-2 border-transparent'
              }`}>{t(energyKeyMap[e.value] || e.value)}</button>
          ))}
        </div>
      </div>

      {/* Training recommendation — collapsible */}
      {trainingRec && (
        <button
          onClick={() => setShowTrainingRec(!showTrainingRec)}
          className="w-full text-left rounded-ct-lg p-3 border transition-all"
          style={{
            background: `linear-gradient(135deg, ${phaseColor?.bg || '#64748b'}08, transparent)`,
            borderColor: `${phaseColor?.bg || '#64748b'}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: phaseColor?.bg }}>
                {t('cycle.trainingRecommendation')}
              </p>
              <p className="text-sm text-ct-1 font-medium mt-0.5">{trainingRec.title}</p>
            </div>
            <ChevronRight size={16} className={`text-ct-2 transition-transform ${showTrainingRec ? 'rotate-90' : ''}`} />
          </div>

          {showTrainingRec && (
            <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
              <p className="text-xs text-ct-2">{trainingRec.subtitle}</p>

              {trainingRec.recommended.length > 0 && (
                <div>
                  <p className="text-[11px] text-green-400 font-semibold mb-1">{t('cycle.recommended')}</p>
                  <div className="flex flex-wrap gap-1">
                    {trainingRec.recommended.map(r => (
                      <span key={r} className="text-[11px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {trainingRec.avoid.length > 0 && (
                <div>
                  <p className="text-[11px] text-red-400 font-semibold mb-1">{t('cycle.avoid')}</p>
                  <div className="flex flex-wrap gap-1">
                    {trainingRec.avoid.map(a => (
                      <span key={a} className="text-[11px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {trainingRec.nutrition.length > 0 && (
                <div>
                  <p className="text-[11px] text-amber-400 font-semibold mb-1">{t('cycle.nutritionTips')}</p>
                  {trainingRec.nutrition.map(n => (
                    <p key={n} className="text-[11px] text-ct-2 ml-2">• {n}</p>
                  ))}
                </div>
              )}

              {trainingRec.injuryNote && (
                <p className="text-[11px] text-orange-400 bg-orange-500/10 px-2 py-1.5 rounded-lg">
                  ⚠️ {trainingRec.injuryNote}
                </p>
              )}
            </div>
          )}
        </button>
      )}

      {/* Privacy badge */}
      <div className="flex items-center gap-2 px-1">
        <Shield size={12} className="text-green-400" />
        <p className="text-[11px] text-ct-2">{t('cycle.privacyOnDevice')}</p>
      </div>

      {/* Save button */}
      <div className="sticky-save">
        <button onClick={handleSave}
          className="w-full font-bold py-4 rounded-xl active:scale-[0.98] transition-transform text-base shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${phaseColor?.bg || '#06b6d4'}, ${phaseColor?.bg || '#06b6d4'}cc)`,
            color: '#0f172a',
            boxShadow: `0 10px 25px ${phaseColor?.bg || '#06b6d4'}40`,
          }}
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  )
}

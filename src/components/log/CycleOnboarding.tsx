import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Shield, Heart, Moon } from 'lucide-react'
import type { ContraceptionType } from '../../types'

interface CycleOnboardingProps {
  onComplete: (data: {
    lastPeriodStart: string
    averageCycleLength: number
    averagePeriodLength: number
    contraceptionType: ContraceptionType
    isPregnant: boolean
    isTryingToConceive: boolean
  }) => Promise<void>
  onSkip: () => void
}

const CONTRACEPTION_OPTIONS: { value: ContraceptionType; labelKey: string }[] = [
  { value: 'none', labelKey: 'cycle.contraNone' },
  { value: 'pill', labelKey: 'cycle.contraPill' },
  { value: 'iud_hormonal', labelKey: 'cycle.contraHormonalIUD' },
  { value: 'iud_copper', labelKey: 'cycle.contraCopperIUD' },
  { value: 'implant', labelKey: 'cycle.contraImplant' },
  { value: 'patch', labelKey: 'cycle.contraPatch' },
  { value: 'ring', labelKey: 'cycle.contraRing' },
  { value: 'injection', labelKey: 'cycle.contraInjection' },
  { value: 'condom', labelKey: 'cycle.contraCondom' },
  { value: 'natural', labelKey: 'cycle.contraNatural' },
]

export function CycleOnboarding({ onComplete, onSkip }: CycleOnboardingProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [lastPeriodStart, setLastPeriodStart] = useState(new Date().toISOString().split('T')[0])
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  const [contraceptionType, setContraceptionType] = useState<ContraceptionType>('none')
  const [pregnancyStatus, setPregnancyStatus] = useState<'not_pregnant' | 'trying' | 'pregnant'>('not_pregnant')

  const totalSteps = 7
  const progress = (step / totalSteps) * 100

  const handleComplete = async () => {
    await onComplete({
      lastPeriodStart,
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      contraceptionType,
      isPregnant: pregnancyStatus === 'pregnant',
      isTryingToConceive: pregnancyStatus === 'trying',
    })
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}
            className="w-11 h-11 rounded-xl bg-ct-surface flex items-center justify-center text-ct-2 active:text-ct-1 shrink-0"
            aria-label={t('common.goBack')}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex-1">
          <div className="h-1 bg-ct-elevated rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-[11px] text-ct-2 font-bold tabular-nums shrink-0">{step}/{totalSteps}</span>
      </div>

      {/* Step 1: Opt-in */}
      {step === 1 && (
        <div className="space-y-6 text-center pt-8">
          <div className="w-16 h-16 mx-auto bg-violet-500/15 rounded-ct-lg flex items-center justify-center">
            <Moon size={32} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ct-1">{t('cycle.onboardingWelcome')}</h2>
            <p className="text-sm text-ct-2 mt-2 max-w-[280px] mx-auto">
              {t('cycle.onboardingDesc')}
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <button onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-400 text-ct-1 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform text-base shadow-lg shadow-violet-500/25">
              {t('cycle.yesSetUp')}
            </button>
            <button onClick={onSkip}
              className="w-full py-3 text-ct-2 font-medium text-sm active:text-ct-2">
              {t('cycle.maybeLater')}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Shield size={12} className="text-green-400" />
            <p className="text-[11px] text-ct-2">{t('cycle.onboardingPrivacy')}</p>
          </div>
        </div>
      )}

      {/* Step 2: Last period start */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-ct-1">{t('cycle.whenLastPeriod')}</h2>
            <p className="text-xs text-ct-2 mt-1">{t('cycle.bestEstimate')}</p>
          </div>
          <input
            type="date"
            value={lastPeriodStart}
            onChange={e => setLastPeriodStart(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-ct-elevated/60 rounded-xl py-4 px-4 text-ct-1 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-400/40 border border-slate-600/30"
          />
          <button onClick={() => setStep(3)}
            className="w-full bg-violet-500 text-ct-1 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform">
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Step 3: Cycle length */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-ct-1">{t('cycle.howLongCycle')}</h2>
            <p className="text-xs text-ct-2 mt-1">{t('cycle.cycleLengthDesc')}</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-ct-1">{cycleLength}</p>
            <p className="text-sm text-ct-2 mt-1">{t('cycle.days')}</p>
          </div>
          <input
            type="range" min={21} max={35} value={cycleLength}
            onChange={e => setCycleLength(Number(e.target.value))}
            className="w-full h-2 bg-ct-elevated rounded-full appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-[11px] text-ct-2">
            <span>21 {t('cycle.days')}</span>
            <span className="text-violet-400 font-bold">28 ({t('cycle.average')})</span>
            <span>35 {t('cycle.days')}</span>
          </div>
          <button onClick={() => setStep(4)}
            className="w-full bg-violet-500 text-ct-1 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform">
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Step 4: Period length */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-ct-1">{t('cycle.howLongPeriod')}</h2>
            <p className="text-xs text-ct-2 mt-1">{t('cycle.periodLengthDesc')}</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-ct-1">{periodLength}</p>
            <p className="text-sm text-ct-2 mt-1">{t('cycle.days')}</p>
          </div>
          <input
            type="range" min={2} max={8} value={periodLength}
            onChange={e => setPeriodLength(Number(e.target.value))}
            className="w-full h-2 bg-ct-elevated rounded-full appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-[11px] text-ct-2">
            <span>2 {t('cycle.days')}</span>
            <span className="text-violet-400 font-bold">5 ({t('cycle.average')})</span>
            <span>8 {t('cycle.days')}</span>
          </div>
          <button onClick={() => setStep(5)}
            className="w-full bg-violet-500 text-ct-1 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform">
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Step 5: Contraception */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-ct-1">{t('cycle.contraceptionQ')}</h2>
            <p className="text-xs text-ct-2 mt-1">{t('cycle.personalizeDesc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pb-2">
            {CONTRACEPTION_OPTIONS.map(c => (
              <button key={c.value}
                onClick={() => setContraceptionType(c.value)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] text-left ${
                  contraceptionType === c.value
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-400/30'
                    : 'bg-ct-elevated/50 text-ct-2 border border-transparent'
                }`}>{t(c.labelKey)}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setContraceptionType('none'); setStep(6) }}
              className="flex-1 py-3 text-ct-2 font-medium text-sm rounded-xl active:bg-slate-700/30">
              {t('cycle.skipLabel')}
            </button>
            <button onClick={() => setStep(6)}
              className="flex-1 bg-violet-500 text-ct-1 font-bold py-3 rounded-xl active:scale-[0.98] transition-transform">
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Pregnancy status */}
      {step === 6 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-ct-1">{t('cycle.pregnancyQ')}</h2>
          </div>
          <div className="space-y-3">
            {([
              { value: 'not_pregnant' as const, labelKey: 'cycle.notPregnant', descKey: 'cycle.notPregnantDesc' },
              { value: 'trying' as const, labelKey: 'cycle.tryingConceive', descKey: 'cycle.tryingConceiveDesc' },
              { value: 'pregnant' as const, labelKey: 'cycle.currentlyPregnant', descKey: 'cycle.currentlyPregnantDesc' },
            ]).map(opt => (
              <button key={opt.value}
                onClick={() => setPregnancyStatus(opt.value)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  pregnancyStatus === opt.value
                    ? 'bg-violet-500/15 border border-violet-400/30'
                    : 'bg-ct-surface border border-slate-700/30'
                }`}>
                <p className={`text-sm font-bold ${pregnancyStatus === opt.value ? 'text-violet-400' : 'text-ct-1'}`}>{t(opt.labelKey)}</p>
                <p className="text-[11px] text-ct-2 mt-0.5">{t(opt.descKey)}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(7)}
            className="w-full bg-violet-500 text-ct-1 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform">
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Step 7: Privacy notice */}
      {step === 7 && (
        <div className="space-y-6 text-center pt-4">
          <div className="w-16 h-16 mx-auto bg-green-500/15 rounded-ct-lg flex items-center justify-center">
            <Shield size={32} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ct-1">{t('cycle.privacyTitle')}</h2>
            <div className="mt-4 space-y-3 text-left max-w-[300px] mx-auto">
              {([
                t('cycle.privacyItem1'),
                t('cycle.privacyItem2'),
                t('cycle.privacyItem3'),
                t('cycle.privacyItem4'),
                t('cycle.privacyItem5'),
              ]).map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[8px] text-green-400">✓</span>
                  </div>
                  <p className="text-xs text-ct-2">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-slate-900 font-bold py-4 rounded-xl active:scale-[0.98] transition-transform text-base shadow-lg shadow-green-500/25">
            <Heart size={16} className="inline mr-2" />
            {t('cycle.getStarted')}
          </button>
        </div>
      )}
    </div>
  )
}

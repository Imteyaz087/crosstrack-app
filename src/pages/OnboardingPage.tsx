import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { calcNutritionTargets } from '../utils/macros'
import type { Gender, ExperienceLevel, Goal } from '../types'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

export function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const { saveProfile } = useStore()
  const [step, setStep] = useState(0)
  const [_direction, setDirection] = useState<'next' | 'back'>('next')

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('prefer_not_to_say')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [experience, setExperience] = useState<ExperienceLevel>('beginner')
  const [goal, setGoal] = useState<Goal>('general_health')
  const [trainingDays, setTrainingDays] = useState(5)
  const [trainingTime, setTrainingTime] = useState('06:00')
  const [language, setLanguage] = useState<'en' | 'zh-TW' | 'zh-CN'>('en')

  const goNext = () => { setDirection('next'); setStep(s => s + 1) }
  const goBack = () => { setDirection('back'); setStep(s => s - 1) }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-8 stagger-children">
      <div className="mx-auto w-full max-w-sm rounded-[28px] overflow-hidden border border-orange-500/20 bg-[#161B22] shadow-[0_24px_80px_rgba(249,115,22,0.12)]">
        <img
          src="/og-image.png"
          alt="TrackVolt logo"
          className="block w-full h-auto"
          width={1200}
          height={630}
          loading="eager"
        />
      </div>
      <div className="space-y-3 max-w-sm mx-auto">
        <p className="text-ct-2 text-base leading-relaxed">{t('onboarding.tagline')}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setLanguage('en'); i18n.changeLanguage('en') }}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors card-press ${language === 'en' ? 'bg-cyan-500 text-slate-900' : 'bg-ct-surface text-ct-2 border border-ct-border'}`}>English</button>
        <button onClick={() => { setLanguage('zh-TW'); i18n.changeLanguage('zh-TW') }}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors card-press ${language === 'zh-TW' ? 'bg-cyan-500 text-slate-900' : 'bg-ct-surface text-ct-2 border border-ct-border'}`}>繁體中文</button>
        <button onClick={() => { setLanguage('zh-CN'); i18n.changeLanguage('zh-CN') }}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors card-press ${language === 'zh-CN' ? 'bg-cyan-500 text-slate-900' : 'bg-ct-surface text-ct-2 border border-ct-border'}`}>简体中文</button>
      </div>
    </div>,

    // Step 1: Name + age + gender
    <div key="name" className="space-y-6 stagger-children">
      <div>
        <h2 className="text-2xl font-bold text-ct-1">{t('onboarding.aboutYou')}</h2>
        <p className="text-sm text-ct-2 mt-1">{t('onboarding.whatName')}</p>
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder={t('onboarding.namePlaceholder')}
        className="w-full bg-ct-surface border border-ct-border rounded-xl py-4 px-4 text-ct-1 text-lg focus:outline-none focus:ring-1 focus:ring-cyan-400" autoFocus />
      <input value={age} onChange={e => setAge(e.target.value.replace(/\D/g, ''))} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} placeholder={t('onboarding.agePlaceholder')}
        className="w-full bg-ct-surface border border-ct-border rounded-xl py-4 px-4 text-ct-1 focus:outline-none focus:ring-1 focus:ring-cyan-400" />
      <div>
        <p className="text-sm text-ct-2 mb-3">{t('onboarding.genderLabel')}</p>
        <div className="grid grid-cols-2 gap-2">
          {(['male', 'female', 'other', 'prefer_not_to_say'] as Gender[]).map(g => (
            <button key={g} onClick={() => setGender(g)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors card-press ${gender === g ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40' : 'bg-ct-surface text-ct-2 border border-ct-border'}`}>
              {g === 'prefer_not_to_say' ? t('onboarding.ratherNotSay') : t(`onboarding.${g}`)}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2: Body
    <div key="body" className="space-y-6 stagger-children">
      <div>
        <h2 className="text-2xl font-bold text-ct-1">{t('onboarding.yourBody')}</h2>
        <p className="text-sm text-ct-2 mt-1">{t('onboarding.bodyDesc')}</p>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-xs text-ct-2 font-medium uppercase tracking-wider">{t('onboarding.weightKg')}</label>
          <input value={weight} onChange={e => setWeight(e.target.value.replace(/[^\d.]/g, ''))} type="text" inputMode="decimal" pattern="[0-9.]*" placeholder={t('onboarding.weightPlaceholder')}
            className="w-full bg-ct-surface border border-ct-border rounded-xl py-4 px-4 text-ct-1 text-2xl text-center focus:outline-none focus:ring-1 focus:ring-cyan-400" />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs text-ct-2 font-medium uppercase tracking-wider">{t('onboarding.heightCm')}</label>
          <input value={height} onChange={e => setHeight(e.target.value.replace(/\D/g, ''))} type="text" inputMode="numeric" pattern="[0-9]*" placeholder={t('onboarding.heightPlaceholder')}
            className="w-full bg-ct-surface border border-ct-border rounded-xl py-4 px-4 text-ct-1 text-2xl text-center focus:outline-none focus:ring-1 focus:ring-cyan-400" />
        </div>
      </div>
      <div className="bg-ct-surface/50 rounded-xl p-4 border border-ct-border">
        <p className="text-xs text-ct-2 text-center">{t('onboarding.autoCalcNote')}</p>
      </div>
    </div>,

    // Step 3: Experience + Goal
    <div key="goals" className="space-y-6 stagger-children">
      <h2 className="text-2xl font-bold text-ct-1">{t('onboarding.yourTraining')}</h2>
      <div>
        <p className="text-sm text-ct-2 mb-3">{t('onboarding.experience')}</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { v: 'beginner' as ExperienceLevel, d: t('onboarding.expUnder1') },
            { v: 'intermediate' as ExperienceLevel, d: t('onboarding.exp1to3') },
            { v: 'advanced' as ExperienceLevel, d: t('onboarding.exp3to7') },
            { v: 'elite' as ExperienceLevel, d: t('onboarding.exp7plus') },
          ]).map(({ v, d }) => (
            <button key={v} onClick={() => setExperience(v)}
              className={`p-4 rounded-xl text-left transition-colors card-press ${experience === v ? 'bg-cyan-500/20 border-cyan-400/40 border' : 'bg-ct-surface border border-ct-border'}`}>
              <p className={`text-sm font-bold ${experience === v ? 'text-cyan-400' : 'text-ct-1'}`}>{t(`onboarding.${v}`)}</p>
              <p className="text-xs text-ct-2 mt-0.5">{d}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-ct-2 mb-3">{t('onboarding.primaryGoal')}</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { v: 'fat_loss' as Goal, k: 'fatLoss', e: String.fromCodePoint(0x1F525) },
            { v: 'muscle_gain' as Goal, k: 'muscleGain', e: String.fromCodePoint(0x1F4AA) },
            { v: 'performance' as Goal, k: 'performance', e: String.fromCodePoint(0x26A1) },
            { v: 'recomp' as Goal, k: 'recomp', e: String.fromCodePoint(0x1F504) },
            { v: 'endurance' as Goal, k: 'endurance', e: String.fromCodePoint(0x1F3C3) },
            { v: 'general_health' as Goal, k: 'generalHealth', e: String.fromCodePoint(0x2764, 0xFE0F) },
          ]).map(({ v, k, e }) => (
            <button key={v} onClick={() => setGoal(v)}
              className={`p-4 rounded-xl text-left transition-colors card-press ${goal === v ? 'bg-cyan-500/20 border-cyan-400/40 border' : 'bg-ct-surface border border-ct-border'}`}>
              <span className="text-lg">{e}</span>
              <p className={`text-sm font-bold mt-1 ${goal === v ? 'text-cyan-400' : 'text-ct-1'}`}>{t(`onboarding.${k}`)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 4: Training schedule
    <div key="schedule" className="space-y-6 stagger-children">
      <div>
        <h2 className="text-2xl font-bold text-ct-1">{t('onboarding.schedule')}</h2>
        <p className="text-sm text-ct-2 mt-1">{t('onboarding.howOften')}</p>
      </div>
      <div>
        <p className="text-sm text-ct-2 mb-3">{t('onboarding.trainingDays')}</p>
        <div className="flex gap-3 justify-center">
          {[3, 4, 5, 6].map(d => (
            <button key={d} onClick={() => setTrainingDays(d)}
              className={`w-16 h-16 rounded-xl text-xl font-bold transition-colors card-press ${trainingDays === d ? 'bg-cyan-500 text-slate-900' : 'bg-ct-surface text-ct-2 border border-ct-border'}`}>{d}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm text-ct-2 mb-3">{t('onboarding.preferredTime')}</p>
        <input type="time" value={trainingTime} onChange={e => setTrainingTime(e.target.value)}
          className="w-full bg-ct-surface border border-ct-border rounded-xl py-4 px-4 text-ct-1 text-center text-lg focus:outline-none focus:ring-1 focus:ring-cyan-400" />
      </div>
    </div>,
  ]

  const handleFinish = async () => {
    const w = parseFloat(weight) || 70
    const targets = calcNutritionTargets(w, goal, gender)
    await saveProfile({
      displayName: name || 'Athlete',
      age: parseInt(age) || undefined,
      gender,
      weightKg: w,
      heightCm: parseFloat(height) || undefined,
      experienceLevel: experience,
      goal,
      trainingTime,
      trainingDaysPerWeek: trainingDays,
      language,
      units: 'metric',
      proteinTarget: targets.protein,
      carbsTarget: targets.carbs,
      fatTarget: targets.fat,
      calorieTarget: targets.calories,
      waterTarget: targets.water,
      onboardingComplete: true,
    })
  }

  const isLastStep = step === steps.length - 1
  const canNext = step === 0 || (step === 1 && name.trim().length > 0) || step === 2 || step === 3 || step === 4

  return (
    <div className="h-screen-safe bg-ct-bg flex flex-col overflow-hidden">
      {/* Header: safe-area top + progress dots */}
      <div className="shrink-0 pt-safe">
        <div className="flex gap-1.5 justify-center pt-4 pb-3 px-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-cyan-400' : i < step ? 'w-4 bg-cyan-400/40' : 'w-4 bg-ct-elevated'}`} />
          ))}
        </div>
      </div>

      {/* Scrollable content  -  inner wrapper centers when short, scrolls when tall */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }} key={step}>
          <div className="w-full max-w-lg animate-fade-in">
            {steps[step]}
          </div>
        </div>
      </div>

      {/* Bottom nav with safe-area */}
      <div className="shrink-0 px-6 pt-2 pb-4 pb-safe bg-ct-bg">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 0 && (
            <button onClick={goBack} className="flex-1 bg-ct-surface text-ct-2 py-4 rounded-xl font-medium flex items-center justify-center gap-1 active:bg-ct-elevated transition-colors">
              <ChevronLeft size={20} /> {t('common.back')}
            </button>
          )}
          <button
            onClick={() => isLastStep ? handleFinish() : goNext()}
            disabled={!canNext}
            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
              canNext ? 'bg-cyan-500 text-slate-900' : 'bg-ct-elevated text-ct-2'
            }`}
          >
            {isLastStep ? <><Check size={20} /> {t('onboarding.letsGo')}</> : <>{t('common.next')} <ChevronRight size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

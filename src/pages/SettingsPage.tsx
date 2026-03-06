import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { calcNutritionTargets } from '../utils/macros'
import type { Gender, ExperienceLevel, Goal } from '../types'
import { Download, Upload, Globe, Save, RefreshCw, Key, Eye, EyeOff, Cloud } from 'lucide-react'
import { SaveToast } from '../components/SaveToast'
import { hasApiKey, setApiKey, clearApiKey } from '../services/gemini'
import { hasFirebaseConfig, setFirebaseConfig, clearFirebaseConfig } from '../services/firebase'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { profile, loadProfile, saveProfile, exportAllData, importData } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [geminiKey, setGeminiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(hasApiKey())
  const [hasFbConfig, setHasFbConfig] = useState(hasFirebaseConfig())
  const [fbProjectId, setFbProjectId] = useState('')
  const [fbApiKey, setFbApiKey] = useState('')
  const [showFbSetup, setShowFbSetup] = useState(false)

  const [form, setForm] = useState({
    displayName: '',
    age: '' as string,
    gender: 'prefer_not_to_say' as Gender,
    weightKg: '' as string,
    heightCm: '' as string,
    experienceLevel: 'beginner' as ExperienceLevel,
    goal: 'general_health' as Goal,
    trainingTime: '06:00',
    trainingDaysPerWeek: 5,
    proteinTarget: 150,
    carbsTarget: 200,
    fatTarget: 60,
    calorieTarget: 2000,
    waterTarget: 2500,
    language: 'en' as 'en' | 'zh-TW' | 'zh-CN',
  })

  useEffect(() => { loadProfile() }, [])
  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName,
        age: profile.age?.toString() || '',
        gender: profile.gender || 'prefer_not_to_say',
        weightKg: profile.weightKg?.toString() || '',
        heightCm: profile.heightCm?.toString() || '',
        experienceLevel: profile.experienceLevel,
        goal: profile.goal,
        trainingTime: profile.trainingTime,
        trainingDaysPerWeek: profile.trainingDaysPerWeek,
        proteinTarget: profile.proteinTarget,
        carbsTarget: profile.carbsTarget,
        fatTarget: profile.fatTarget,
        calorieTarget: profile.calorieTarget,
        waterTarget: profile.waterTarget,
        language: profile.language,
      })
    }
  }, [profile])

  const handleRecalculate = () => {
    const w = parseFloat(form.weightKg) || 70
    const targets = calcNutritionTargets(w, form.goal, form.gender)
    setForm(f => ({
      ...f,
      proteinTarget: targets.protein,
      carbsTarget: targets.carbs,
      fatTarget: targets.fat,
      calorieTarget: targets.calories,
      waterTarget: targets.water,
    }))
  }

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {}
    if (!form.displayName.trim()) newErrors.name = t('settings.nameRequired')
    if (form.proteinTarget <= 0) newErrors.protein = t('settings.mustBePositive')
    if (form.calorieTarget <= 0) newErrors.calories = t('settings.mustBePositive')
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setToast({ msg: t('settings.fixErrors'), type: 'error' })
      return
    }
    setErrors({})
    await saveProfile({
      displayName: form.displayName.trim(),
      age: parseInt(form.age) || undefined,
      gender: form.gender,
      weightKg: parseFloat(form.weightKg) || undefined,
      heightCm: parseFloat(form.heightCm) || undefined,
      experienceLevel: form.experienceLevel,
      goal: form.goal,
      trainingTime: form.trainingTime,
      trainingDaysPerWeek: form.trainingDaysPerWeek,
      proteinTarget: form.proteinTarget,
      carbsTarget: form.carbsTarget,
      fatTarget: form.fatTarget,
      calorieTarget: form.calorieTarget,
      waterTarget: form.waterTarget,
      language: form.language,
    })
    i18n.changeLanguage(form.language)
    setToast({ msg: t('settings.settingsSaved'), type: 'success' })
  }

  const handleExport = async () => {
    const json = await exportAllData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trackvolt-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importData(text)
    loadProfile()
    setToast({ msg: t('settings.dataImported'), type: 'success' })
  }

  const field = (label: string, value: string | number, onChange: (v: string) => void, type = 'text', min?: number) => (
    <div className="flex justify-between items-center py-2.5 border-b border-ct-border/30 min-h-[44px]">
      <span className="text-sm text-ct-2">{label}</span>
      <input
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={value}
        min={min}
        onChange={e => {
          const v = e.target.value
          if (type === 'number' && min !== undefined && v !== '') {
            const n = parseFloat(v)
            if (!isNaN(n) && n < min) return
          }
          onChange(v)
        }}
        className="bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm text-right w-28 focus:outline-none focus:ring-1 focus:ring-cyan-400 min-h-[44px]"
      />
    </div>
  )

  return (
    <div className="space-y-4 stagger-children">
      {toast && <SaveToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('settings.title')}</h1>

      {/* Profile */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 mb-2">{t('settings.profile')}</p>
        <div>
          {field(t('settings.name'), form.displayName, v => { setForm(f => ({ ...f, displayName: v })); if (v.trim()) setErrors(e => { const { name, ...rest } = e; return rest }) })}
          {errors.name && <p className="text-xs text-red-400 mt-0.5 ml-1">{errors.name}</p>}
        </div>
        {field(t('settings.age'), form.age, v => setForm(f => ({ ...f, age: v })), 'number', 1)}
        {field(t('settings.weightKg'), form.weightKg, v => setForm(f => ({ ...f, weightKg: v })), 'number', 1)}
        {field(t('settings.heightCm'), form.heightCm, v => setForm(f => ({ ...f, heightCm: v })), 'number', 1)}

        {/* Gender */}
        <div className="flex justify-between items-center py-2.5 border-b border-ct-border/30 min-h-[44px]">
          <span className="text-sm text-ct-2">{t('settings.gender')}</span>
          <select
            value={form.gender}
            onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))}
            className="bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm text-right min-h-[44px] focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none"
          >
            <option value="male">{t('settings.genderMale')}</option>
            <option value="female">{t('settings.genderFemale')}</option>
            <option value="other">{t('settings.genderOther')}</option>
            <option value="prefer_not_to_say">{t('settings.genderPreferNot')}</option>
          </select>
        </div>

        {/* Experience Level */}
        <div className="flex justify-between items-center py-2.5 border-b border-ct-border/30 min-h-[44px]">
          <span className="text-sm text-ct-2">{t('settings.experience')}</span>
          <select
            value={form.experienceLevel}
            onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value as ExperienceLevel }))}
            className="bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm text-right min-h-[44px] focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none"
          >
            <option value="beginner">{t('settings.expBeginner')}</option>
            <option value="intermediate">{t('settings.expIntermediate')}</option>
            <option value="advanced">{t('settings.expAdvanced')}</option>
            <option value="elite">{t('settings.expElite')}</option>
          </select>
        </div>

        {/* Goal */}
        <div className="flex justify-between items-center py-2.5 border-b border-ct-border/30 min-h-[44px]">
          <span className="text-sm text-ct-2">{t('settings.goal')}</span>
          <select
            value={form.goal}
            onChange={e => setForm(f => ({ ...f, goal: e.target.value as Goal }))}
            className="bg-ct-elevated rounded-lg py-2 px-3 text-ct-1 text-sm text-right min-h-[44px] focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none"
          >
            <option value="general_health">{t('settings.goalGeneralHealth')}</option>
            <option value="fat_loss">{t('settings.goalFatLoss')}</option>
            <option value="muscle_gain">{t('settings.goalMuscleGain')}</option>
            <option value="performance">{t('settings.goalPerformance')}</option>
            <option value="recomp">{t('settings.goalRecomp')}</option>
            <option value="endurance">{t('settings.goalEndurance')}</option>
            <option value="hyrox">{t('settings.goalHyrox')}</option>
          </select>
        </div>

        {field(t('settings.trainingTime'), form.trainingTime, v => setForm(f => ({ ...f, trainingTime: v })), 'time')}
        <div className="flex justify-between items-center py-2.5 border-b border-ct-border/30">
          <span className="text-sm text-ct-2">{t('settings.trainingDaysWeek')}</span>
          <div className="flex gap-1">
            {[3, 4, 5, 6].map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, trainingDaysPerWeek: d }))}
                className={`w-11 h-11 rounded-lg text-xs font-bold ${form.trainingDaysPerWeek === d ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated text-ct-2'}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2">{t('settings.targets')}</p>
          <button onClick={handleRecalculate} className="flex items-center gap-1 text-xs text-cyan-400 min-h-[44px] px-2">
            <RefreshCw size={12} /> {t('settings.autoCalc')}
          </button>
        </div>
        {field(t('settings.proteinTarget') + ' (g)', form.proteinTarget, v => setForm(f => ({ ...f, proteinTarget: parseFloat(v) || 0 })), 'number', 1)}
        {field(t('settings.carbsTarget') + ' (g)', form.carbsTarget, v => setForm(f => ({ ...f, carbsTarget: parseFloat(v) || 0 })), 'number', 1)}
        {field(t('settings.fatTarget') + ' (g)', form.fatTarget, v => setForm(f => ({ ...f, fatTarget: parseFloat(v) || 0 })), 'number', 1)}
        {field(t('settings.calorieTarget'), form.calorieTarget, v => setForm(f => ({ ...f, calorieTarget: parseFloat(v) || 0 })), 'number', 1)}
        {field(t('settings.waterTarget') + ' (ml)', form.waterTarget, v => setForm(f => ({ ...f, waterTarget: parseFloat(v) || 0 })), 'number', 1)}
      </div>

      {/* App */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 mb-2">{t('settings.app')}</p>
        <div className="flex justify-between items-center py-2.5 border-b border-ct-border/30">
          <span className="text-sm text-ct-2 flex items-center gap-2 shrink-0"><Globe size={14} /> {t('settings.language')}</span>
          <div className="flex gap-1 shrink-0">
            {(['en', 'zh-TW', 'zh-CN'] as const).map(lang => (
              <button key={lang} onClick={() => setForm(f => ({ ...f, language: lang }))}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium min-h-[44px] ${form.language === lang ? 'bg-cyan-500/20 text-cyan-400' : 'bg-ct-elevated text-ct-2'}`}>
                {lang === 'en' ? 'EN' : lang === 'zh-TW' ? '繁中' : '简中'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gemini AI */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 mb-2">{t('settings.aiFeatures')}</p>
        {hasKey ? (
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-green-400 flex items-center gap-2"><Key size={14} /> {t('settings.apiKeyConfigured')}</span>
            <button onClick={() => { clearApiKey(); setHasKey(false); setToast({ msg: t('settings.remove'), type: 'success' }) }}
              className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg min-h-[44px] flex items-center">{t('settings.remove')}</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-ct-2">{t('settings.addGeminiKey')}</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-ct-elevated rounded-lg py-2 px-3 pr-8 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ct-2" aria-label={showKey ? 'Hide API key' : 'Show API key'}>
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button onClick={() => {
                if (geminiKey.trim().startsWith('AIza')) {
                  setApiKey(geminiKey.trim())
                  setHasKey(true)
                  setGeminiKey('')
                  setToast({ msg: t('settings.apiKeySaved', 'Gemini API key saved!'), type: 'success' })
                } else {
                  setToast({ msg: t('settings.invalidKeyFormat', 'Invalid key format — should start with AIza'), type: 'error' })
                }
              }} className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-xs font-bold shrink-0 min-h-[44px]">
                {t('settings.saveKey')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Firebase Cloud Sync */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 mb-2 flex items-center gap-1.5"><Cloud size={10} /> {t('settings.cloudSync')}</p>
        {hasFbConfig ? (
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-green-400 flex items-center gap-2"><Cloud size={14} /> {t('settings.firebaseConfigured')}</span>
            <button onClick={() => { clearFirebaseConfig(); setHasFbConfig(false); setToast({ msg: t('settings.remove'), type: 'success' }) }}
              className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg min-h-[44px] flex items-center">{t('settings.remove')}</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-ct-2">{t('settings.addFirebase')}</p>
            {!showFbSetup ? (
              <button onClick={() => setShowFbSetup(true)} className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold py-2.5 rounded-xl text-xs min-h-[44px]">
                {t('settings.setupFirebase')}
              </button>
            ) : (
              <div className="space-y-2">
                <input value={fbApiKey} onChange={e => setFbApiKey(e.target.value)} placeholder="Firebase API Key (AIza...)"
                  className="w-full bg-ct-elevated rounded-xl py-2 px-3 text-ct-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <input value={fbProjectId} onChange={e => setFbProjectId(e.target.value)} placeholder="Project ID (e.g. my-app-12345)"
                  className="w-full bg-ct-elevated rounded-xl py-2 px-3 text-ct-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <button onClick={() => {
                  if (!fbApiKey.trim() || !fbProjectId.trim()) {
                    setToast({ msg: t('settings.bothRequired'), type: 'error' }); return
                  }
                  setFirebaseConfig({
                    apiKey: fbApiKey.trim(),
                    authDomain: `${fbProjectId.trim()}.firebaseapp.com`,
                    projectId: fbProjectId.trim(),
                    storageBucket: `${fbProjectId.trim()}.firebasestorage.app`,
                    messagingSenderId: '',
                    appId: '',
                  })
                  setHasFbConfig(true); setFbApiKey(''); setFbProjectId(''); setShowFbSetup(false)
                  setToast({ msg: t('settings.firebaseSaved', 'Firebase configured! Go to Cloud Sync to sign in.'), type: 'success' })
                }} className="w-full bg-blue-500/20 text-blue-400 font-bold py-2.5 rounded-xl text-xs min-h-[44px]">
                  {t('settings.saveFirebase')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={handleSave} className="w-full bg-cyan-500 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px]">
        <Save size={16} /> {t('settings.save')}
      </button>

      {/* Data */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 mb-2">{t('settings.data')}</p>
        <button onClick={handleExport} className="w-full flex items-center gap-3 py-2.5 border-b border-ct-border/30 text-cyan-400 text-sm min-h-[44px]">
          <Download size={16} /> {t('settings.exportData')}
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 py-2.5 text-cyan-400 text-sm min-h-[44px]">
          <Upload size={16} /> {t('settings.importData')}
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {/* Version footer */}
      <div className="text-center pb-8">
        <p className="text-[11px] text-ct-3">{t('settings.version')} 1.0.0</p>
        <p className="text-[11px] text-ct-3 mt-0.5">TrackVolt</p>
      </div>
    </div>
  )
}

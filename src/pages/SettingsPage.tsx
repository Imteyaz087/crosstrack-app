import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { Download, Upload, Globe, Save } from 'lucide-react'

const CARD   = 'var(--bg-card)'
const RAISED = 'var(--bg-raised)'
const BORDER = 'var(--border)'
const VOLT   = 'var(--volt)'
const GLOW   = 'var(--volt-glow)'
const BSTR   = 'var(--border-str)'
const TXT2   = 'var(--text-secondary)'
const APP    = 'var(--bg-app)'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { settings, loadSettings, updateSettings, exportAllData, importData } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    displayName:   '',
    weightKg:      72,
    trainingTime:  '06:00',
    proteinTarget: 180,
    carbsTarget:   216,
    fatTarget:     58,
    calorieTarget: 2100,
    waterTarget:   3000,
    language:      'en' as 'en' | 'zh-TW',
  })

  useEffect(() => { loadSettings() }, [])
  useEffect(() => {
    if (settings) setForm({
      displayName:   settings.displayName,
      weightKg:      settings.weightKg,
      trainingTime:  settings.trainingTime,
      proteinTarget: settings.proteinTarget,
      carbsTarget:   settings.carbsTarget,
      fatTarget:     settings.fatTarget,
      calorieTarget: settings.calorieTarget,
      waterTarget:   settings.waterTarget,
      language:      settings.language,
    })
  }, [settings])

  const handleSave = async () => {
    await updateSettings(form)
    i18n.changeLanguage(form.language)
  }

  const handleExport = async () => {
    const json = await exportAllData()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
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
    loadSettings()
    alert('Data imported successfully!')
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div style={{ borderColor: BORDER }} className="flex justify-between items-center py-2.5 border-b">
      <span style={{ color: 'var(--text-primary)' }} className="text-sm">{label}</span>
      <input
        type={type}
        value={form[key] as string | number}
        onChange={e => setForm({ ...form, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
        style={{ background: RAISED, color: 'white' }}
        className="rounded-lg py-1.5 px-3 text-sm text-right w-28 focus:outline-none focus:ring-1 focus:ring-[var(--volt)]"
      />
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">{t('settings.title')}</h1>

      {/* ── Profile ───────────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('settings.profile')}</p>
        {field(t('settings.name'), 'displayName')}
        {field(t('settings.weightGoal') + ' (kg)', 'weightKg', 'number')}
        {field(t('settings.trainingTime'), 'trainingTime', 'time')}
      </div>

      {/* ── Targets ───────────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('settings.targets')}</p>
        {field(t('settings.proteinTarget') + ' (g)', 'proteinTarget', 'number')}
        {field(t('settings.carbsTarget')   + ' (g)', 'carbsTarget',   'number')}
        {field(t('settings.fatTarget')     + ' (g)', 'fatTarget',     'number')}
        {field(t('settings.calorieTarget'),           'calorieTarget', 'number')}
        {field(t('settings.waterTarget')   + ' (ml)', 'waterTarget',   'number')}
      </div>

      {/* ── App / Language ────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('settings.app')}</p>
        <div style={{ borderColor: BORDER }} className="flex justify-between items-center py-2.5 border-b">
          <span style={{ color: 'var(--text-primary)' }} className="text-sm flex items-center gap-2">
            <Globe size={14} /> {t('settings.language')}
          </span>
          <div className="flex gap-1">
            {(['en', 'zh-TW'] as const).map((lang, i) => (
              <button
                key={lang}
                onClick={() => setForm({ ...form, language: lang })}
                style={form.language === lang
                  ? { background: GLOW, color: VOLT, borderColor: BSTR }
                  : { background: RAISED, color: TXT2, borderColor: BORDER }
                }
                className="px-3 py-1 rounded-lg text-xs font-medium border"
              >
                {i === 0 ? 'EN' : '繁中'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Save ──────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        style={{ background: VOLT, color: APP }}
        className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <Save size={16} /> {t('settings.save')}
      </button>

      {/* ── Data ──────────────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest mb-2">{t('settings.data')}</p>
        <button
          onClick={handleExport}
          style={{ borderColor: BORDER, color: VOLT }}
          className="w-full flex items-center gap-3 py-2.5 border-b text-sm"
        >
          <Download size={16} /> {t('settings.exportData')}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          style={{ color: VOLT }}
          className="w-full flex items-center gap-3 py-2.5 text-sm"
        >
          <Upload size={16} /> {t('settings.importData')}
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
    </div>
  )
}

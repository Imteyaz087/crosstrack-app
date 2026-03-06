import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { useSaveToast } from '../components/SaveToast'
import {
  signInWithGoogle, signOutUser, onAuthChange,
  hasFirebaseConfig, uploadAllData, downloadAllData,
  getLastSyncTime, setLastSyncTime,
} from '../services/firebase'
import type { User } from 'firebase/auth'
import {
  Download, Upload, Copy, Share2, FileText, AlertCircle, Check,
  Cloud, LogIn, LogOut, RefreshCw, CloudOff, User as UserIcon
} from 'lucide-react'

export function CloudSyncPage() {
  const { t } = useTranslation()
  const { exportAllData, importData, getAllDataForSync, importFromSync } = useStore()
  const { showToast, toastEl } = useSaveToast()

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const configured = hasFirebaseConfig()

  useEffect(() => {
    if (!configured) return
    try {
      const unsub = onAuthChange((u) => {
        setUser(u)
        if (u) {
          getLastSyncTime(u.uid).then(setLastSync).catch(() => { /* first login — no sync time yet */ })
        }
      })
      return unsub
    } catch { /* Firebase not configured yet — safe to ignore */ }
  }, [configured])

  // ---- Cloud Auth ----
  const handleSignIn = async () => {
    setAuthLoading(true)
    try {
      await signInWithGoogle()
      showToast('Signed in!', 'success')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Sign-in failed', 'error')
    } finally { setAuthLoading(false) }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setUser(null)
      setLastSync(null)
      showToast('Signed out', 'success')
    } catch {
      showToast('Sign-out failed', 'error')
    }
  }

  // ---- Cloud Sync ----
  const handleCloudUpload = async () => {
    if (!user) return
    setSyncLoading(true)
    try {
      const data = await getAllDataForSync()
      await uploadAllData(user.uid, data)
      await setLastSyncTime(user.uid)
      const now = new Date().toISOString()
      setLastSync(now)
      showToast('Data synced to cloud!', 'success')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Upload failed', 'error')
    } finally { setSyncLoading(false) }
  }

  const handleCloudDownload = async () => {
    if (!user) return
    setSyncLoading(true)
    try {
      const data = await downloadAllData(user.uid)
      if (!data) { showToast('No cloud data found', 'error'); return }
      await importFromSync(data)
      showToast('Data restored from cloud!', 'success')
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Download failed', 'error')
    } finally { setSyncLoading(false) }
  }

  // ---- Local Export/Import ----
  const [exportedData, setExportedData] = useState<string | null>(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [stats, setStats] = useState<{ workouts: number; meals: number; logs: number } | null>(null)

  const handleExport = async () => {
    try {
      const data = await exportAllData()
      setExportedData(data)
      const parsed = JSON.parse(data)
      setStats({
        workouts: parsed.workouts?.length || 0,
        meals: parsed.mealLogs?.length || 0,
        logs: parsed.dailyLogs?.length || 0,
      })
      showToast('Backup created!', 'success')
    } catch { showToast('Export failed', 'error') }
  }

  const handleCopyToClipboard = async () => {
    if (!exportedData) return
    try {
      await navigator.clipboard.writeText(exportedData)
      showToast('Copied to clipboard!', 'success')
    } catch { showToast('Copy failed — try Download instead', 'error') }
  }

  const handleDownload = () => {
    if (!exportedData) return
    const blob = new Blob([exportedData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trackvolt-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded!', 'success')
  }

  const handleShare = async () => {
    if (!exportedData) return
    try {
      const blob = new Blob([exportedData], { type: 'application/json' })
      const file = new File([blob], `trackvolt-backup-${new Date().toISOString().split('T')[0]}.json`, { type: 'application/json' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'TRACKVOLT Backup' })
        showToast('Shared!', 'success')
      } else { handleCopyToClipboard() }
    } catch { handleCopyToClipboard() }
  }

  const handleImportJson = async () => {
    if (!importText.trim()) { showToast('Paste backup data first', 'error'); return }
    try {
      const parsed = JSON.parse(importText)
      if (!parsed.workouts && !parsed.dailyLogs) { showToast('Invalid backup format', 'error'); return }
      await importData(importText)
      showToast('Data restored!', 'success')
      setShowImport(false); setImportText('')
    } catch { showToast('Invalid JSON data', 'error') }
  }

  const handleFileImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const parsed = JSON.parse(text)
        if (!parsed.workouts && !parsed.dailyLogs) { showToast('Invalid backup file', 'error'); return }
        await importData(text)
        showToast(`Restored from ${file.name}!`, 'success')
      } catch { showToast('Failed to read file', 'error') }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      {toastEl}
      <h1 className="text-xl font-bold text-ct-1">{t('cloudSyncPage.title')}</h1>
      <p className="text-xs text-ct-2">{t('cloudSyncPage.desc')}</p>

      {/* =============== CLOUD SYNC SECTION =============== */}
      <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-ct-lg p-4 border border-blue-500/20 space-y-3">
        {!configured ? (
          /* Firebase not configured */
          <div className="text-center py-4 space-y-2">
            <CloudOff size={28} className="mx-auto text-ct-2" />
            <p className="text-sm text-ct-2">{t('cloudSyncPage.notSetUp')}</p>
            <p className="text-[11px] text-ct-2">{t('cloudSyncPage.addFirebase')}</p>
          </div>
        ) : !user ? (
          /* Not signed in */
          <div className="text-center py-2 space-y-3">
            <Cloud size={28} className="mx-auto text-blue-400" />
            <p className="text-sm text-ct-1 font-semibold">{t('cloudSyncPage.signInToSync')}</p>
            <p className="text-[11px] text-ct-2">{t('cloudSyncPage.onDeviceNote')}</p>
            <button onClick={handleSignIn} disabled={authLoading}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {authLoading ? <RefreshCw size={14} className="animate-spin" /> : <LogIn size={14} />}
              {authLoading ? t('cloudSyncPage.signingIn') : t('cloudSyncPage.signInGoogle')}
            </button>
          </div>
        ) : (
          /* Signed in — show sync controls */
          <>
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile photo" className="w-11 h-11 rounded-full border-2 border-blue-400/30" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <UserIcon size={20} className="text-blue-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ct-1 truncate">{user.displayName || user.email}</p>
                <p className="text-[11px] text-ct-2 truncate">{user.email}</p>
              </div>
              <button onClick={handleSignOut} className="text-xs text-ct-2 bg-ct-elevated/50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <LogOut size={12} /> {t('cloudSyncPage.signOut')}
              </button>
            </div>

            {lastSync && (
              <p className="text-[11px] text-ct-2">
                {t('cloudSyncPage.lastSynced')} {new Date(lastSync).toLocaleString()}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCloudUpload} disabled={syncLoading}
                className="bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {syncLoading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                {t('cloudSyncPage.uploadCloud')}
              </button>
              <button onClick={handleCloudDownload} disabled={syncLoading}
                className="bg-violet-500/20 border border-violet-500/30 text-violet-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {syncLoading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                {t('cloudSyncPage.downloadCloud')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* =============== LOCAL EXPORT =============== */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Upload size={16} className="text-cyan-400" />
          <p className="text-sm font-semibold text-ct-1">{t('cloudSyncPage.localExport')}</p>
        </div>
        <p className="text-[11px] text-ct-2">{t('cloudSyncPage.exportDesc')}</p>

        <button onClick={handleExport}
          className="w-full bg-cyan-500 text-slate-900 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          <Upload size={14} /> {t('cloudSyncPage.createBackup')}
        </button>

        {exportedData && (
          <>
            {stats && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={14} className="text-green-400" />
                  <p className="text-xs font-semibold text-green-400">{t('cloudSyncPage.backupReady')}</p>
                </div>
                <div className="flex gap-3 text-center">
                  <div className="flex-1"><p className="text-sm font-bold text-ct-1">{stats.workouts}</p><p className="text-[11px] text-ct-2">{t('cloudSyncPage.workouts')}</p></div>
                  <div className="flex-1"><p className="text-sm font-bold text-ct-1">{stats.meals}</p><p className="text-[11px] text-ct-2">{t('cloudSyncPage.meals')}</p></div>
                  <div className="flex-1"><p className="text-sm font-bold text-ct-1">{stats.logs}</p><p className="text-[11px] text-ct-2">{t('cloudSyncPage.dailyLogs')}</p></div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleCopyToClipboard} className="bg-ct-elevated/50 text-ct-2 rounded-xl py-2.5 text-xs font-semibold flex flex-col items-center gap-1"><Copy size={14} /> {t('cloudSyncPage.copy')}</button>
              <button onClick={handleDownload} className="bg-ct-elevated/50 text-ct-2 rounded-xl py-2.5 text-xs font-semibold flex flex-col items-center gap-1"><Download size={14} /> {t('cloudSyncPage.download')}</button>
              <button onClick={handleShare} className="bg-ct-elevated/50 text-ct-2 rounded-xl py-2.5 text-xs font-semibold flex flex-col items-center gap-1"><Share2 size={14} /> {t('cloudSyncPage.share')}</button>
            </div>
          </>
        )}
      </div>

      {/* =============== LOCAL IMPORT =============== */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Download size={16} className="text-emerald-400" />
          <p className="text-sm font-semibold text-ct-1">{t('cloudSyncPage.localImport')}</p>
        </div>
        <p className="text-[11px] text-ct-2">{t('cloudSyncPage.importDesc')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleFileImport} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2"><FileText size={14} /> {t('cloudSyncPage.fromFile')}</button>
          <button onClick={() => setShowImport(!showImport)} className="bg-ct-elevated/50 text-ct-2 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2"><Copy size={14} /> {t('cloudSyncPage.pasteJSON')}</button>
        </div>
        {showImport && (
          <>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder={t('cloudSyncPage.pastePlaceholder')} rows={4}
              className="w-full bg-ct-elevated text-ct-1 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none" />
            <button onClick={handleImportJson} className="w-full bg-emerald-500 text-slate-900 font-bold py-2.5 rounded-xl text-sm">{t('cloudSyncPage.restoreData')}</button>
          </>
        )}
      </div>

      {/* Warning */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle size={14} className="text-orange-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-orange-400">{t('cloudSyncPage.warning')}</p>
      </div>
    </div>
  )
}

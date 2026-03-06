import { useTranslation } from 'react-i18next'
import { Shield, Smartphone, Eye, Trash2, Download, Lock, Server, Bell } from 'lucide-react'

interface PolicySection {
  icon: typeof Shield
  title: string
  content: string
  color: string
}

export function PrivacyPolicyPage() {
  const { t } = useTranslation()

  const sections: PolicySection[] = [
    {
      icon: Smartphone,
      title: t('privacy.localFirst'),
      content: t('privacy.localFirstDesc'),
      color: 'text-cyan-400',
    },
    {
      icon: Eye,
      title: t('privacy.noTracking'),
      content: t('privacy.noTrackingDesc'),
      color: 'text-green-400',
    },
    {
      icon: Server,
      title: t('privacy.dataStorage'),
      content: t('privacy.dataStorageDesc'),
      color: 'text-blue-400',
    },
    {
      icon: Lock,
      title: t('privacy.thirdParty'),
      content: t('privacy.thirdPartyDesc'),
      color: 'text-violet-400',
    },
    {
      icon: Bell,
      title: t('privacy.optionalFeatures'),
      content: t('privacy.optionalFeaturesDesc'),
      color: 'text-orange-400',
    },
    {
      icon: Trash2,
      title: t('privacy.dataDeletion'),
      content: t('privacy.dataDeletionDesc'),
      color: 'text-red-400',
    },
    {
      icon: Download,
      title: t('privacy.dataExport'),
      content: t('privacy.dataExportDesc'),
      color: 'text-emerald-400',
    },
  ]

  return (
    <div className="space-y-5 stagger-children">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-ct-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Shield size={28} className="text-cyan-400" />
        </div>
        <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">
          {t('privacy.title')}
        </h1>
        <p className="text-sm text-ct-2 max-w-xs mx-auto">
          {t('privacy.subtitle')}
        </p>
      </div>

      {/* Key promise banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-ct-lg border border-cyan-500/20 p-4">
        <p className="text-sm font-semibold text-ct-1 text-center">
          {t('privacy.promise')}
        </p>
      </div>

      {/* Policy sections */}
      <div className="space-y-3">
        {sections.map((section, i) => {
          const Icon = section.icon
          return (
            <div
              key={i}
              className="bg-ct-surface rounded-ct-lg border border-ct-border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-ct-elevated/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={16} className={section.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ct-1 mb-1">{section.title}</p>
                  <p className="text-xs text-ct-2 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Health data notice */}
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
        <p className="text-xs font-semibold text-rose-400 mb-1">{t('privacy.healthDataTitle')}</p>
        <p className="text-xs text-ct-2 leading-relaxed">{t('privacy.healthDataDesc')}</p>
      </div>

      {/* Last updated + contact */}
      <div className="text-center space-y-1 pb-8">
        <p className="text-[11px] text-ct-2">{t('privacy.lastUpdated')}</p>
        <p className="text-[11px] text-ct-2">{t('privacy.contact')}</p>
      </div>
    </div>
  )
}

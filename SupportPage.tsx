import { useTranslation } from 'react-i18next'
import { HelpCircle, Mail, MessageSquare, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  q: string
  a: string
}

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full bg-ct-surface rounded-ct-lg border border-ct-border p-4 text-left card-press"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ct-1">{item.q}</p>
          {open && (
            <p className="text-xs text-ct-2 leading-relaxed mt-2">{item.a}</p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-ct-2 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
    </button>
  )
}

export function SupportPage() {
  const { t } = useTranslation()

  const faqs: FAQItem[] = [
    { q: t('support.faq1Q'), a: t('support.faq1A') },
    { q: t('support.faq2Q'), a: t('support.faq2A') },
    { q: t('support.faq3Q'), a: t('support.faq3A') },
    { q: t('support.faq4Q'), a: t('support.faq4A') },
    { q: t('support.faq5Q'), a: t('support.faq5A') },
    { q: t('support.faq6Q'), a: t('support.faq6A') },
  ]

  return (
    <div className="space-y-5 stagger-children">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-ct-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <HelpCircle size={28} className="text-cyan-400" />
        </div>
        <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">
          {t('support.title')}
        </h1>
        <p className="text-sm text-ct-2 max-w-xs mx-auto">
          {t('support.subtitle')}
        </p>
      </div>

      {/* Contact card */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-ct-lg border border-cyan-500/20 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ct-elevated/60 rounded-xl flex items-center justify-center shrink-0">
            <Mail size={18} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ct-1">{t('support.emailUs')}</p>
            <a
              href="mailto:support@trackvolt.app"
              className="text-xs text-cyan-400 underline"
            >
              support@trackvolt.app
            </a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <MessageSquare size={14} className="text-ct-2" />
          <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">
            {t('support.faqTitle')}
          </p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FAQAccordion key={i} item={faq} />
          ))}
        </div>
      </div>

      {/* Version info */}
      <div className="text-center space-y-1 pb-8">
        <p className="text-[11px] text-ct-2">TRACKVOLT v1.0.0</p>
        <p className="text-[11px] text-ct-2">{t('support.madeWith')}</p>
      </div>
    </div>
  )
}

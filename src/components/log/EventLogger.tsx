/**
 * EventLogger — Parent orchestrator for CrossFit Events
 * Flow: Browse/Scan → (Review) → Score Entry → Save → (Optional Share)
 */

import { useState } from 'react'
import { ArrowLeft, Camera } from 'lucide-react'
import { EventBrowser } from './EventBrowser'
import { EventScoreEntry, type EventScoreData } from './EventScoreEntry'
import { EventScanner } from './EventScanner'
import { EventReview } from './EventReview'
import type { EventTemplate, EventCategory, EventScanResult, EventLog } from '../../types/eventTypes'
import type { WodType } from '../../types'
import { ShareCardExporter } from '../sharecard/ShareCardExporter'
import type { ShareCardData } from '../sharecard/types'
import { useStore } from '../../stores/useStore'
import { haptic } from '../../hooks/useHaptic'
import { today } from '../../utils/macros'

type EventStep = 'browse' | 'custom' | 'score' | 'scan' | 'review' | 'share'

interface EventLoggerProps {
  onDone: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}

export function EventLogger({ onDone, onToast }: EventLoggerProps) {
  const { saveEventLog } = useStore()
  const [step, setStep] = useState<EventStep>('browse')
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null)

  // Custom event state
  const [customTitle, setCustomTitle] = useState('')
  const [customWodType, setCustomWodType] = useState<WodType>('ForTime')
  const [customLines, setCustomLines] = useState('')
  const [customTimeCap, setCustomTimeCap] = useState('')

  // Scan state
  const [scanResult, setScanResult] = useState<EventScanResult | null>(null)
  const [scanImage, setScanImage] = useState<string | undefined>(undefined)
  const [eventSource, setEventSource] = useState<'template' | 'manual' | 'scanned'>('manual')

  // Share card state (after save)
  const [savedEvent, setSavedEvent] = useState<EventLog | null>(null)

  const handleSelectTemplate = (template: EventTemplate) => {
    setSelectedTemplate(template)
    setEventSource('template')
    setStep('score')
    haptic('selection')
  }

  const handleCreateCustom = () => {
    setSelectedTemplate(null)
    setEventSource('manual')
    setStep('custom')
  }

  const handleCustomNext = () => {
    if (!customTitle.trim()) return
    setStep('score')
  }

  // Scanner completed OCR
  const handleScanComplete = (result: EventScanResult, sourceImage?: string) => {
    setScanResult(result)
    setScanImage(sourceImage)
    setStep('review')
    haptic('selection')
  }

  // Review confirmed — populate custom fields from scan and go to score entry
  const handleReviewConfirm = (edited: EventScanResult, keepImage: boolean) => {
    setCustomTitle(edited.eventTitle)
    setCustomWodType((edited.wodType as WodType) || 'ForTime')
    setCustomLines(edited.workoutLines.join('\n'))
    setCustomTimeCap(edited.timeCapMinutes ? String(edited.timeCapMinutes) : '')
    setSelectedTemplate(null)
    setEventSource('scanned')
    setScanImage(keepImage ? scanImage : undefined)
    // Store scan data for score entry
    setScanResult(edited)
    setStep('score')
    haptic('success')
  }

  const handleSave = async (data: EventScoreData) => {
    try {
      const eventData = {
        date: data.date || today(),
        eventCategory: data.eventCategory,
        eventYear: data.eventYear,
        eventNumber: data.eventNumber,
        eventTitle: data.eventTitle,
        eventSource: eventSource,
        wodType: data.wodType,
        workoutLines: data.workoutLines,
        rxStandard: data.rxStandard,
        scaledStandard: data.scaledStandard,
        timeCapSeconds: data.timeCapSeconds,
        finished: data.finished,
        finalTimeSeconds: data.finalTimeSeconds,
        capped: data.capped,
        repsAtCap: data.repsAtCap,
        roundsRepsAtCap: data.roundsRepsAtCap,
        scoreDisplay: data.scoreDisplay,
        rxOrScaled: data.rxOrScaled,
        location: data.location || undefined,
        notes: data.notes || undefined,
        prFlag: data.prFlag,
        sourceImage: scanImage,
      }
      await saveEventLog(eventData)
      haptic('success')
      onToast('Event saved!', 'success')

      // Build a synthetic EventLog for the share card
      const now = new Date().toISOString()
      setSavedEvent({
        ...eventData,
        createdAt: now,
        updatedAt: now,
      } as EventLog)
      setStep('share')
    } catch {
      onToast('Failed to save event', 'error')
    }
  }

  // Back button logic
  const handleBack = () => {
    if (step === 'browse') onDone()
    else if (step === 'share') onDone() // After save, back = done
    else if (step === 'scan') setStep('browse')
    else if (step === 'review') setStep('scan')
    else if (step === 'score' && eventSource === 'scanned') setStep('review')
    else if (step === 'score' && selectedTemplate) setStep('browse')
    else if (step === 'score') setStep('custom')
    else setStep('browse')
  }

  // Determine score entry props when coming from scan
  const getScanScoreProps = () => {
    if (!scanResult) return {}
    return {
      customTitle: scanResult.eventTitle,
      customWodType: (scanResult.wodType as WodType) || 'ForTime',
      customLines: scanResult.workoutLines,
      customTimeCap: scanResult.timeCapMinutes,
      customCategory: (scanResult.eventType || 'custom') as EventCategory,
      customRxStandard: scanResult.rxStandard,
      customScaledStandard: scanResult.scaledStandard,
      customYear: scanResult.eventYear,
      customNumber: scanResult.eventNumber,
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-ct-2" />
        </button>
        <h1 className="text-xl font-bold text-ct-1">
          {step === 'browse' && 'CrossFit Events'}
          {step === 'custom' && 'Custom Event'}
          {step === 'score' && (selectedTemplate?.name || customTitle || 'Log Score')}
          {step === 'scan' && 'Scan Event'}
          {step === 'review' && 'Review Scan'}
          {step === 'share' && 'Share Result'}
        </h1>
      </div>

      {/* Scan Event CTA — shown on browse step */}
      {step === 'browse' && (
        <button
          onClick={() => { setStep('scan'); haptic('selection') }}
          className="w-full flex items-center gap-3 p-4 mb-4 bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border border-violet-400/30 rounded-ct-lg active:scale-[0.98] transition-transform min-h-[56px]"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Camera size={20} className="text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-ct-1">Scan Event Poster</p>
            <p className="text-[11px] text-ct-3">Take a photo or upload — auto-fills everything</p>
          </div>
        </button>
      )}

      {/* Step: Browse templates */}
      {step === 'browse' && (
        <EventBrowser
          onSelectEvent={handleSelectTemplate}
          onCreateCustom={handleCreateCustom}
        />
      )}

      {/* Step: Scan event poster */}
      {step === 'scan' && (
        <EventScanner
          onScanComplete={handleScanComplete}
          onClose={() => setStep('browse')}
        />
      )}

      {/* Step: Review scanned data */}
      {step === 'review' && scanResult && (
        <EventReview
          result={scanResult}
          sourceImage={scanImage}
          onConfirm={handleReviewConfirm}
          onRetry={() => { setScanResult(null); setScanImage(undefined); setStep('scan') }}
          onCancel={() => setStep('browse')}
        />
      )}

      {/* Step: Custom event entry */}
      {step === 'custom' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Event Name</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Box Birthday WOD"
              className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 placeholder:text-ct-3 min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Workout Type</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {(['ForTime', 'AMRAP', 'EMOM', 'Chipper', 'Other'] as WodType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setCustomWodType(type)}
                  className={`px-3 py-2 rounded-ct-lg text-xs font-semibold transition-all min-h-[36px] ${
                    customWodType === type
                      ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                      : 'bg-ct-surface text-ct-2 border border-ct-border'
                  }`}
                >
                  {type === 'ForTime' ? 'For Time' : type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Workout Lines</label>
            <textarea
              value={customLines}
              onChange={(e) => setCustomLines(e.target.value)}
              placeholder={"21-15-9:\nThrusters (95/65 lb)\nPull-ups"}
              rows={5}
              className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 placeholder:text-ct-3 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-ct-2 font-semibold">Time Cap (minutes, optional)</label>
            <input
              type="number"
              value={customTimeCap}
              onChange={(e) => setCustomTimeCap(e.target.value)}
              placeholder="e.g., 20"
              className="w-full mt-1 px-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 placeholder:text-ct-3 min-h-[44px]"
            />
          </div>

          <button
            onClick={handleCustomNext}
            disabled={!customTitle.trim()}
            className="w-full py-3 bg-cyan-500 rounded-ct-lg text-sm font-bold text-slate-900 btn-press min-h-[44px] disabled:opacity-40 disabled:pointer-events-none"
          >
            Next → Enter Score
          </button>
        </div>
      )}

      {/* Step: Share card (after save) */}
      {step === 'share' && savedEvent && (
        <ShareCardExporter
          data={{
            title: savedEvent.eventTitle,
            category: savedEvent.eventCategory === 'open' ? 'CROSSFIT OPEN'
              : savedEvent.eventCategory === 'hero' ? 'HERO WOD'
              : savedEvent.eventCategory === 'girl' ? 'GIRLS BENCHMARK'
              : 'CROSSFIT EVENT',
            categoryType: savedEvent.eventCategory,
            year: savedEvent.eventYear,
            wodType: savedEvent.wodType,
            scoreDisplay: savedEvent.scoreDisplay || '—',
            rxOrScaled: savedEvent.rxOrScaled,
            prFlag: savedEvent.prFlag,
            date: savedEvent.date,
            location: savedEvent.location,
            workoutLines: savedEvent.workoutLines,
            rxStandard: savedEvent.rxStandard,
            timeCapSeconds: savedEvent.timeCapSeconds,
          } satisfies ShareCardData}
          onClose={onDone}
          onToast={onToast}
        />
      )}

      {/* Step: Score entry */}
      {step === 'score' && (
        <EventScoreEntry
          template={selectedTemplate}
          customTitle={eventSource === 'scanned' ? getScanScoreProps().customTitle : (customTitle || undefined)}
          customWodType={eventSource === 'scanned' ? getScanScoreProps().customWodType! : customWodType}
          customLines={eventSource === 'scanned' ? getScanScoreProps().customLines : (customLines ? customLines.split('\n').filter(l => l.trim()) : undefined)}
          customTimeCap={eventSource === 'scanned' ? getScanScoreProps().customTimeCap : (customTimeCap ? parseInt(customTimeCap) : undefined)}
          customCategory={eventSource === 'scanned' ? getScanScoreProps().customCategory! : ('custom' as EventCategory)}
          customRxStandard={eventSource === 'scanned' ? getScanScoreProps().customRxStandard : undefined}
          customScaledStandard={eventSource === 'scanned' ? getScanScoreProps().customScaledStandard : undefined}
          customYear={eventSource === 'scanned' ? getScanScoreProps().customYear : undefined}
          customNumber={eventSource === 'scanned' ? getScanScoreProps().customNumber : undefined}
          onSave={handleSave}
          onBack={() => {
            if (eventSource === 'scanned') setStep('review')
            else setStep(selectedTemplate ? 'browse' : 'custom')
          }}
        />
      )}
    </div>
  )
}
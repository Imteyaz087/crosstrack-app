/**
 * EventBrowser — Browse CrossFit Event templates
 * Categories: Open | Hero | Girls | Custom
 */

import { useState } from 'react'
import { Search, Trophy, Flame, Star, Plus } from 'lucide-react'
import { EVENT_TEMPLATES, getTemplatesByCategory, searchTemplates } from '../../data/eventTemplates'
import type { EventTemplate, EventCategory } from '../../types/eventTypes'

interface EventBrowserProps {
  onSelectEvent: (event: EventTemplate) => void
  onCreateCustom: () => void
}

const CATEGORIES: { id: EventCategory | 'all'; label: string; icon: typeof Trophy }[] = [
  { id: 'all', label: 'All', icon: Star },
  { id: 'open', label: 'Open', icon: Trophy },
  { id: 'hero', label: 'Hero', icon: Flame },
  { id: 'girl', label: 'Girls', icon: Star },
]

const CATEGORY_COLORS: Record<string, string> = {
  open: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  hero: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  girl: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  custom: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
}

const WOD_TYPE_BADGE: Record<string, string> = {
  ForTime: 'bg-emerald-500/20 text-emerald-400',
  AMRAP: 'bg-cyan-500/20 text-cyan-400',
  EMOM: 'bg-violet-500/20 text-violet-400',
  Chipper: 'bg-orange-500/20 text-orange-400',
  Other: 'bg-slate-500/20 text-slate-400',
}

export function EventBrowser({ onSelectEvent, onCreateCustom }: EventBrowserProps) {
  const [activeTab, setActiveTab] = useState<EventCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const templates = searchQuery
    ? searchTemplates(searchQuery)
    : activeTab === 'all'
      ? EVENT_TEMPLATES
      : getTemplatesByCategory(activeTab as EventCategory)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ct-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-10 pr-4 py-3 bg-ct-surface border border-ct-border rounded-ct-lg text-sm text-ct-1 placeholder:text-ct-3 focus:border-cyan-400/50 focus:outline-none min-h-[44px]"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setSearchQuery('') }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-ct-lg text-xs font-semibold transition-all min-h-[36px] ${
              activeTab === id
                ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                : 'bg-ct-surface text-ct-2 border border-ct-border'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Create Custom button */}
      <button
        onClick={onCreateCustom}
        className="w-full flex items-center gap-3 p-4 bg-ct-surface border border-dashed border-ct-border rounded-ct-lg active:scale-[0.98] transition-transform min-h-[56px]"
      >
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <Plus size={20} className="text-violet-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-ct-1">Create Custom Event</p>
          <p className="text-[11px] text-ct-3">Enter your own workout manually</p>
        </div>
      </button>

      {/* Template list */}
      <div className="space-y-2">
        {templates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-ct-3">No events found</p>
          </div>
        )}
        {templates.map((event, idx) => (
          <button
            key={`${event.name}-${idx}`}
            onClick={() => onSelectEvent(event)}
            className="w-full text-left bg-ct-surface border border-ct-border rounded-ct-lg p-4 active:scale-[0.98] transition-transform card-press"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[event.category]}`}>
                    {event.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${WOD_TYPE_BADGE[event.wodType] || WOD_TYPE_BADGE.Other}`}>
                    {event.wodType === 'ForTime' ? 'For Time' : event.wodType}
                  </span>
                </div>
                <p className="text-sm font-bold text-ct-1 truncate">{event.name}</p>
                <p className="text-[11px] text-ct-2 mt-0.5 line-clamp-2">{event.description}</p>
                {event.timeCapMinutes && (
                  <p className="text-[11px] text-ct-3 mt-1">Time Cap: {event.timeCapMinutes} min</p>
                )}
              </div>
              <div className="text-ct-3 mt-1">›</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

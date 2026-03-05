export type EventCategory = 'open' | 'hero' | 'girl' | 'custom'

export interface EventTemplate {
  id: string
  name: string
  category: EventCategory
  description?: string
  wodType?: string
  scoreType?: string
  timeCapMinutes?: number | null
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  { id: 'fran', name: 'Fran', category: 'girl', description: '21-15-9 Thrusters & Pull-ups' },
  { id: 'grace', name: 'Grace', category: 'girl', description: '30 Clean & Jerks for time' },
  { id: 'helen', name: 'Helen', category: 'girl', description: '3 RFT: 400m Run, 21 KB Swings, 12 Pull-ups' },
  { id: 'murph', name: 'Murph', category: 'hero', description: '1 mi Run, 100 PU, 200 Push-ups, 300 Squats, 1 mi Run' },
  { id: 'open24.1', name: '24.1', category: 'open', description: 'Open Workout 24.1' },
]

export function getTemplatesByCategory(cat: EventCategory | 'all'): EventTemplate[] {
  if (cat === 'all') return EVENT_TEMPLATES
  return EVENT_TEMPLATES.filter(e => e.category === cat)
}

export function searchTemplates(q: string): EventTemplate[] {
  const lower = q.toLowerCase()
  return EVENT_TEMPLATES.filter(e =>
    e.name.toLowerCase().includes(lower) || (e.description || '').toLowerCase().includes(lower)
  )
}

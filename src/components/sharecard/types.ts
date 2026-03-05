import type { WodType, RxScaled } from '../../types'

export interface ShareCardData {
  title: string
  category: string
  categoryType: 'open' | 'hero' | 'girl' | 'custom' | 'wod' | 'strength'
  year?: number
  wodType: WodType
  scoreDisplay: string
  rxOrScaled: RxScaled
  prFlag: boolean
  date: string
  location?: string
  workoutLines?: string[]
  rxStandard?: string
  timeCapSeconds?: number
  description?: string
}
import type { VercelRequest, VercelResponse } from '@vercel/node'

// In-memory rate limiter (resets when serverless function cold-starts)
let requestCount = 0
let windowStart = Date.now()
const MAX_REQUESTS_PER_HOUR = 900 // Stay well under USDA's 1000/hr limit

// USDA Nutrient IDs
const NUTRIENT_IDS = {
  ENERGY: 1008,    // Energy (kcal)
  PROTEIN: 1003,   // Protein
  FAT: 1004,       // Total lipid (fat)
  CARBS: 1005,     // Carbohydrate, by difference
  FIBER: 1079,     // Fiber, total dietary
  SUGAR: 2000,     // Sugars, total
  SODIUM: 1093,    // Sodium
}

interface USDANutrient {
  nutrientId: number
  nutrientName: string
  nutrientNumber: string
  value: number
  unitName: string
}

interface USDAFoodItem {
  fdcId: number
  description: string
  dataType: string
  brandOwner?: string
  brandName?: string
  foodNutrients: USDANutrient[]
  servingSize?: number
  servingSizeUnit?: string
}

interface USDASearchResponse {
  foods: USDAFoodItem[]
  totalHits: number
  currentPage: number
  totalPages: number
}

export interface NutritionResult {
  fdcId: string
  name: string
  brand?: string
  source: 'usda'
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  sugarPer100g: number
  sodiumPer100g: number
  servingSize?: number
  dataQuality: 'high' | 'medium' | 'low'
}

function getNutrientValue(nutrients: USDANutrient[], nutrientId: number): number {
  const n = nutrients.find(x => x.nutrientId === nutrientId)
  return n ? Math.round(n.value * 10) / 10 : 0
}

function assessDataQuality(nutrients: USDANutrient[]): 'high' | 'medium' | 'low' {
  const hasCal = nutrients.some(n => n.nutrientId === NUTRIENT_IDS.ENERGY && n.value > 0)
  const hasProtein = nutrients.some(n => n.nutrientId === NUTRIENT_IDS.PROTEIN)
  const hasCarbs = nutrients.some(n => n.nutrientId === NUTRIENT_IDS.CARBS)
  const hasFat = nutrients.some(n => n.nutrientId === NUTRIENT_IDS.FAT)
  if (hasCal && hasProtein && hasCarbs && hasFat) return 'high'
  if (hasCal && (hasProtein || hasCarbs || hasFat)) return 'medium'
  return 'low'
}

function transformFood(food: USDAFoodItem): NutritionResult {
  const n = food.foodNutrients
  return {
    fdcId: String(food.fdcId),
    name: food.description,
    brand: food.brandOwner || food.brandName || undefined,
    source: 'usda',
    caloriesPer100g: Math.round(getNutrientValue(n, NUTRIENT_IDS.ENERGY)),
    proteinPer100g: getNutrientValue(n, NUTRIENT_IDS.PROTEIN),
    carbsPer100g: getNutrientValue(n, NUTRIENT_IDS.CARBS),
    fatPer100g: getNutrientValue(n, NUTRIENT_IDS.FAT),
    fiberPer100g: getNutrientValue(n, NUTRIENT_IDS.FIBER),
    sugarPer100g: getNutrientValue(n, NUTRIENT_IDS.SUGAR),
    sodiumPer100g: getNutrientValue(n, NUTRIENT_IDS.SODIUM),
    servingSize: food.servingSize || undefined,
    dataQuality: assessDataQuality(n),
  }
}

function checkRateLimit(): boolean {
  const now = Date.now()
  // Reset window every hour
  if (now - windowStart > 3600000) {
    requestCount = 0
    windowStart = now
  }
  if (requestCount >= MAX_REQUESTS_PER_HOUR) return false
  requestCount++
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    return res.status(500).json({ foods: [], error: 'API key not configured' })
  }

  if (!checkRateLimit()) {
    return res.status(429).json({ foods: [], error: 'rate_limited', retryAfter: 3600 })
  }

  try {
    const { query, pageSize = 8 } = req.body || {}
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({ foods: [], error: 'Query must be at least 2 characters' })
    }

    const clampedPageSize = Math.min(Math.max(1, pageSize), 20)

    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`
    const usdaRes = await fetch(usdaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query.trim(),
        pageSize: clampedPageSize,
        dataType: ['Foundation', 'SR Legacy', 'Branded'],
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
        nutrients: [
          NUTRIENT_IDS.ENERGY,
          NUTRIENT_IDS.PROTEIN,
          NUTRIENT_IDS.FAT,
          NUTRIENT_IDS.CARBS,
          NUTRIENT_IDS.FIBER,
          NUTRIENT_IDS.SUGAR,
          NUTRIENT_IDS.SODIUM,
        ],
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!usdaRes.ok) {
      const errText = await usdaRes.text().catch(() => '')
      console.error('USDA API error:', usdaRes.status, errText)
      return res.status(502).json({ foods: [], error: 'upstream_error' })
    }

    const data: USDASearchResponse = await usdaRes.json()
    const foods = (data.foods || [])
      .map(transformFood)
      .filter(f => f.caloriesPer100g > 0 || f.proteinPer100g > 0) // Skip empty entries

    return res.status(200).json({
      foods,
      totalHits: data.totalHits || 0,
    })
  } catch (err) {
    console.error('nutrition-search error:', err)
    if ((err as Error).name === 'TimeoutError') {
      return res.status(504).json({ foods: [], error: 'timeout' })
    }
    return res.status(500).json({ foods: [], error: 'internal_error' })
  }
}
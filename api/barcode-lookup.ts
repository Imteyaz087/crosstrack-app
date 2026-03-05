import type { VercelRequest, VercelResponse } from '@vercel/node'

// Simple throttle: 1 request per second to be polite to OpenFoodFacts
let lastRequestTime = 0

interface OFFNutriments {
  'energy-kcal_100g'?: number
  proteins_100g?: number
  carbohydrates_100g?: number
  fat_100g?: number
  fiber_100g?: number
  sugars_100g?: number
  sodium_100g?: number
}

interface OFFProduct {
  product_name?: string
  product_name_en?: string
  product_name_zh?: string
  brands?: string
  categories?: string
  serving_size?: string
  serving_quantity?: number
  nutriments?: OFFNutriments
  image_front_small_url?: string
}

export interface BarcodeResult {
  name: string
  brand?: string
  source: 'off'
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  sugarPer100g: number
  sodiumPer100g: number
  servingSize?: number
  category?: string
  imageUrl?: string
  dataQuality: 'high' | 'medium' | 'low'
}

function round1(v: number | undefined): number {
  return v ? Math.round(v * 10) / 10 : 0
}

function assessQuality(n: OFFNutriments): 'high' | 'medium' | 'low' {
  const hasCal = (n['energy-kcal_100g'] ?? 0) > 0
  const hasP = (n.proteins_100g ?? 0) > 0
  const hasC = (n.carbohydrates_100g ?? 0) > 0
  const hasF = (n.fat_100g ?? 0) > 0
  if (hasCal && hasP && hasC && hasF) return 'high'
  if (hasCal) return 'medium'
  return 'low'
}

function guessCategory(categories: string): string {
  const lower = categories.toLowerCase()
  if (/meat|chicken|fish|seafood|beef|pork|turkey/.test(lower)) return 'Protein'
  if (/dairy|milk|cheese|yogurt/.test(lower)) return 'Dairy'
  if (/fruit/.test(lower)) return 'Fruits'
  if (/vegetable/.test(lower)) return 'Vegetables'
  if (/cereal|bread|pasta|rice|grain/.test(lower)) return 'Carbs'
  if (/snack|chip|cookie|candy|chocolate/.test(lower)) return 'Snacks'
  if (/beverage|drink|juice|water|soda/.test(lower)) return 'Beverages'
  if (/oil|nut|seed|butter/.test(lower)) return 'Fats'
  if (/sauce|condiment|dressing/.test(lower)) return 'Condiments'
  return 'Other'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ product: null, error: 'Method not allowed' })

  const code = (req.query.code as string)?.trim()
  if (!code || !/^\d{4,14}$/.test(code)) {
    return res.status(400).json({ product: null, error: 'Invalid barcode format' })
  }

  // Throttle: wait if <1s since last request
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime
  if (timeSinceLast < 1000) {
    await new Promise(r => setTimeout(r, 1000 - timeSinceLast))
  }
  lastRequestTime = Date.now()

  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`
    const offRes = await fetch(offUrl, {
      headers: {
        'User-Agent': 'TrackVolt/1.0 (trackvolt.app; contact@trackvolt.app)',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!offRes.ok) {
      return res.status(502).json({ product: null, error: 'upstream_error' })
    }

    const data = await offRes.json()

    if (data.status !== 1 || !data.product) {
      return res.status(200).json({ product: null, found: false })
    }

    const p: OFFProduct = data.product
    const n = p.nutriments || {}
    const name = p.product_name_en || p.product_name || 'Unknown Product'
    const brand = p.brands?.split(',')[0]?.trim()

    const result: BarcodeResult = {
      name: brand ? `${name} (${brand})` : name,
      brand: brand || undefined,
      source: 'off',
      caloriesPer100g: Math.round(n['energy-kcal_100g'] || 0),
      proteinPer100g: round1(n.proteins_100g),
      carbsPer100g: round1(n.carbohydrates_100g),
      fatPer100g: round1(n.fat_100g),
      fiberPer100g: round1(n.fiber_100g),
      sugarPer100g: round1(n.sugars_100g),
      sodiumPer100g: round1((n.sodium_100g || 0) * 1000), // g → mg
      servingSize: p.serving_quantity || undefined,
      category: guessCategory(p.categories || ''),
      imageUrl: p.image_front_small_url || undefined,
      dataQuality: assessQuality(n),
    }

    return res.status(200).json({ product: result, found: true })
  } catch (err) {
    console.error('barcode-lookup error:', err)
    if ((err as Error).name === 'TimeoutError') {
      return res.status(504).json({ product: null, error: 'timeout' })
    }
    return res.status(500).json({ product: null, error: 'internal_error' })
  }
}

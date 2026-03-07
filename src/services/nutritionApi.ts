/**
 * Nutrition API Client  -  Offline-first with IndexedDB caching
 *
 * Flow: Check cache -> (miss) -> fetch /api/* -> cache response -> return
 * Fallback: If offline or API fails -> search local foodLibrary
 */

import { db } from '../db/database'
import type { NutritionResult, NutritionCache, FoodItem } from '../types'
import { filterFoodsByQuery } from '../utils/nutritionSearch'

// Cache TTLs
const SEARCH_CACHE_TTL = 7 * 24 * 60 * 60 * 1000   // 7 days for search results
const BARCODE_FOUND_TTL = 30 * 24 * 60 * 60 * 1000  // 30 days for found barcodes
const BARCODE_MISS_TTL = 7 * 24 * 60 * 60 * 1000    // 7 days for not-found barcodes

// ─── Fetch with timeout + exponential backoff retry ───

interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
}

async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 6000, retries = 2, ...fetchOpts } = options

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, { ...fetchOpts, signal: controller.signal })
      clearTimeout(timer)

      // Don't retry on 4xx client errors (except 429 rate limit)
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res
      }

      // 429 or 5xx  -  retry with backoff
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 4000) // 1s, 2s, 4s cap
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      return res // Return last response even if failed
    } catch (err) {
      clearTimeout(timer)

      // On last attempt, throw
      if (attempt >= retries) throw err

      // Backoff before retry
      const delay = Math.min(1000 * Math.pow(2, attempt), 4000)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  // Should never reach here, but TS needs it
  throw new Error('Fetch failed after retries')
}

// ─── Cache Helpers ───

async function getCached(cacheKey: string): Promise<NutritionCache | undefined> {
  try {
    const entry = await db.nutritionCache.where('cacheKey').equals(cacheKey).first()
    if (entry && entry.expiresAt > Date.now()) return entry
    // Expired  -  delete it
    if (entry?.id) db.nutritionCache.delete(entry.id).catch(() => {})
    return undefined
  } catch {
    return undefined
  }
}

async function setCache(cacheKey: string, source: 'usda' | 'off', data: NutritionResult[] | NutritionResult | null, ttl: number): Promise<void> {
  try {
    // Upsert: delete old entry then add new one
    await db.nutritionCache.where('cacheKey').equals(cacheKey).delete()
    await db.nutritionCache.add({
      cacheKey,
      source,
      data,
      expiresAt: Date.now() + ttl,
      createdAt: new Date().toISOString(),
    })
  } catch {
    // Non-critical  -  cache write failures are OK
  }
}

// ─── Local Food Library Search ───

async function searchLocalLibrary(query: string): Promise<NutritionResult[]> {
  try {
    const foods = await db.foodLibrary.toArray()
    return filterFoodsByQuery(foods, query)
      .slice(0, 15)
      .map(foodItemToResult)
  } catch {
    return []
  }
}

function foodItemToResult(f: FoodItem): NutritionResult {
  return {
    name: f.name,
    source: 'local',
    caloriesPer100g: f.caloriesPer100g,
    proteinPer100g: f.proteinPer100g,
    carbsPer100g: f.carbsPer100g,
    fatPer100g: f.fatPer100g,
    fiberPer100g: f.fiberPer100g,
    sugarPer100g: f.sugarPer100g,
    sodiumPer100g: f.sodiumPer100g,
    category: f.category,
    servingSize: f.defaultServingG,
    dataQuality: 'high',
  }
}

// ─── Public API: Search Foods ───

export async function searchFood(query: string): Promise<{
  localResults: NutritionResult[]
  apiResults: NutritionResult[]
  fromCache: boolean
}> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return { localResults: [], apiResults: [], fromCache: false }

  // Always search local library
  const localResults = await searchLocalLibrary(trimmed)

  // Check cache
  const cacheKey = `usda:${trimmed.toLowerCase()}`
  const cached = await getCached(cacheKey)
  if (cached) {
    return {
      localResults,
      apiResults: Array.isArray(cached.data) ? cached.data : [],
      fromCache: true,
    }
  }

  // If offline -> local only
  if (!navigator.onLine) {
    return { localResults, apiResults: [], fromCache: false }
  }

  // Fetch from API
  try {
    const res = await fetchWithRetry('/api/nutrition-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: trimmed, pageSize: 10 }),
      timeout: 6000,
    })

    if (!res.ok) {
      // Rate limited or error  -  return local only
      return { localResults, apiResults: [], fromCache: false }
    }

    const data = await res.json()
    const apiResults: NutritionResult[] = data.foods || []

    // Cache the results
    if (apiResults.length > 0) {
      await setCache(cacheKey, 'usda', apiResults, SEARCH_CACHE_TTL)
    }

    return { localResults, apiResults, fromCache: false }
  } catch {
    // Network error  -  return local only
    return { localResults, apiResults: [], fromCache: false }
  }
}

// ─── Public API: Barcode Lookup ───

export interface BarcodeLookupResult {
  product: NutritionResult | null
  found: boolean
  fromCache: boolean
  source: 'cache' | 'api' | 'offline'
}

export async function lookupBarcode(code: string): Promise<BarcodeLookupResult> {
  const trimmed = code.trim()
  if (!trimmed) return { product: null, found: false, fromCache: false, source: 'offline' }

  // Check cache
  const cacheKey = `barcode:${trimmed}`
  const cached = await getCached(cacheKey)
  if (cached) {
    const product = cached.data && !Array.isArray(cached.data) ? cached.data : null
    return {
      product,
      found: product !== null,
      fromCache: true,
      source: 'cache',
    }
  }

  // If offline -> no result
  if (!navigator.onLine) {
    return { product: null, found: false, fromCache: false, source: 'offline' }
  }

  // Fetch from API proxy
  try {
    const res = await fetchWithRetry(`/api/barcode-lookup?code=${encodeURIComponent(trimmed)}`, {
      timeout: 8000,
    })

    if (!res.ok) {
      return { product: null, found: false, fromCache: false, source: 'api' }
    }

    const data = await res.json()

    if (data.found && data.product) {
      const product: NutritionResult = {
        ...data.product,
        source: 'off' as const,
      }
      await setCache(cacheKey, 'off', product, BARCODE_FOUND_TTL)
      return { product, found: true, fromCache: false, source: 'api' }
    } else {
      // Cache "not found" so we don't re-query
      await setCache(cacheKey, 'off', null, BARCODE_MISS_TTL)
      return { product: null, found: false, fromCache: false, source: 'api' }
    }
  } catch {
    return { product: null, found: false, fromCache: false, source: 'offline' }
  }
}

// ─── Convert API result -> FoodItem for saving to library ───

export function resultToFoodItem(result: NutritionResult): FoodItem {
  return {
    name: result.name,
    category: result.category || 'Other',
    caloriesPer100g: result.caloriesPer100g,
    proteinPer100g: result.proteinPer100g,
    carbsPer100g: result.carbsPer100g,
    fatPer100g: result.fatPer100g,
    fiberPer100g: result.fiberPer100g,
    sugarPer100g: result.sugarPer100g,
    sodiumPer100g: result.sodiumPer100g,
    defaultServingG: result.servingSize || 100,
    isCustom: true,
  }
}

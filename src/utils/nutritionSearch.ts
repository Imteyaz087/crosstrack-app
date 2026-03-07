import type { FoodItem } from '../types'

const CHARACTER_NORMALIZATIONS: Array<[RegExp, string]> = [
  [/[\s\u3000()（）\[\]【】'".,·•/_-]+/g, ''],
  [/臺/g, '台'],
  [/雞/g, '鸡'],
  [/豬/g, '猪'],
  [/魚/g, '鱼'],
  [/鮪/g, '鲔'],
  [/蝦/g, '虾'],
  [/飯/g, '饭'],
  [/麵/g, '面'],
  [/優/g, '优'],
  [/蘋/g, '苹'],
  [/鳳/g, '凤'],
  [/蘿/g, '萝'],
  [/蔔/g, '卜'],
  [/麗/g, '丽'],
  [/黃/g, '黄'],
  [/鮮/g, '鲜'],
  [/堅/g, '坚'],
  [/醬/g, '酱'],
  [/穀/g, '谷'],
  [/鈴/g, '铃'],
  [/藍/g, '蓝'],
  [/鴨/g, '鸭'],
  [/龍/g, '龙'],
  [/異/g, '异'],
]

const ALIAS_GROUPS = [
  ['地瓜', '番薯', '紅薯', '红薯', '甘薯'],
  ['優格', '优格', '酸奶', '酸奶酪', '優酪乳'],
  ['鮪魚', '金槍魚', '金枪鱼', '吞拿魚', '吞拿鱼'],
  ['酪梨', '牛油果'],
  ['鳳梨', '菠蘿', '菠萝'],
  ['花椰菜', '西蘭花', '西兰花'],
  ['高麗菜', '卷心菜', '包菜'],
  ['白飯', '米飯', '米饭'],
  ['燕麥', '燕麦', '麥片', '麦片'],
  ['義大利麵', '意大利面', '意麵', '意面'],
  ['雞胸肉', '鸡胸肉'],
  ['雞蛋', '鸡蛋'],
  ['胡蘿蔔', '胡萝卜'],
  ['奇異果', '猕猴桃', '獼猴桃'],
  ['花生醬', '花生酱'],
  ['優格', '酸奶'],
]

export function normalizeNutritionText(value: string): string {
  let normalized = value.toLowerCase().trim()
  for (const [pattern, replacement] of CHARACTER_NORMALIZATIONS) {
    normalized = normalized.replace(pattern, replacement)
  }
  return normalized
}

function expandAliases(value: string): string[] {
  const expanded = new Set<string>([value])

  for (const group of ALIAS_GROUPS) {
    if (group.some(term => value.includes(term))) {
      for (const alias of group) expanded.add(alias)
    }
  }

  return Array.from(expanded)
}

function getSearchCandidates(food: Pick<FoodItem, 'name' | 'nameZh' | 'category'>): string[] {
  const raw = [food.name, food.nameZh, food.category].filter(Boolean) as string[]
  const expanded = raw.flatMap(expandAliases)
  return Array.from(new Set(expanded.map(normalizeNutritionText).filter(Boolean)))
}

function getSearchScore(query: string, candidates: string[], favoriteBoost = 0): number {
  let best = 0

  for (const candidate of candidates) {
    if (candidate === query) best = Math.max(best, 120)
    else if (candidate.startsWith(query)) best = Math.max(best, 90)
    else if (candidate.includes(query)) best = Math.max(best, 70)
    else if (query.includes(candidate) && candidate.length >= 2) best = Math.max(best, 40)
  }

  return best + favoriteBoost
}

export function matchesNutritionQuery(food: Pick<FoodItem, 'name' | 'nameZh' | 'category'>, query: string): boolean {
  const normalizedQuery = normalizeNutritionText(query)
  if (!normalizedQuery) return true
  return getSearchScore(normalizedQuery, getSearchCandidates(food)) > 0
}

export function filterFoodsByQuery<T extends Pick<FoodItem, 'name' | 'nameZh' | 'category' | 'isFavorite'>>(
  foods: T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeNutritionText(query)
  if (!normalizedQuery) return foods

  return foods
    .map(food => ({
      food,
      score: getSearchScore(
        normalizedQuery,
        getSearchCandidates(food),
        food.isFavorite ? 5 : 0,
      ),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .map(entry => entry.food)
}

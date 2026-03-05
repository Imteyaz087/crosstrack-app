import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { MacroBar } from '../components/MacroBar'
import type { MealType } from '../types'
import { Trash2, Plus, Repeat } from 'lucide-react'

const CARD   = 'var(--bg-card)'
const BORDER = 'var(--border)'
const VOLT   = 'var(--volt)'
const GLOW   = 'var(--volt-glow)'
const BSTR   = 'var(--border-str)'
const TXT2   = 'var(--text-secondary)'
const TXT3   = 'var(--text-muted)'

export function NutritionPage() {
  const { t } = useTranslation()
  const { settings, todayMeals, todayMacros, templates, loadTodayMeals, loadTemplates, loadSettings, deleteMealLog, addMealFromTemplate, setActiveTab } = useStore()

  useEffect(() => { loadTodayMeals(); loadTemplates(); loadSettings() }, [])

  const mealTypes: MealType[] = ['breakfast', 'post_workout', 'lunch', 'snack', 'dinner']

  const getMealsForType = (type: MealType) => todayMeals.filter(m => m.mealType === type)
  const getMealTotal    = (type: MealType) => {
    const meals = getMealsForType(type)
    return meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein:  acc.protein  + m.protein,
      carbs:    acc.carbs    + m.carbs,
      fat:      acc.fat      + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">{t('nutrition.todayNutrition')}</h1>

      {/* ── Macro overview ────────────────────────────────────────────── */}
      <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
        <div className="flex gap-3 mb-3">
          <MacroBar label="Protein" current={todayMacros.protein} target={settings?.proteinTarget || 180} unit="g" color="#4ade80" />
          <MacroBar label="Carbs"   current={todayMacros.carbs}   target={settings?.carbsTarget   || 216} unit="g" color="#fb923c" />
          <MacroBar label="Fat"     current={todayMacros.fat}     target={settings?.fatTarget     || 58}  unit="g" color="#f472b6" />
        </div>
        {/* Calories bar uses volt */}
        <MacroBar label="Calories" current={todayMacros.calories} target={settings?.calorieTarget || 2100} unit="" color="#C8FF00" />
      </div>

      {/* ── Meals by type ─────────────────────────────────────────────── */}
      {mealTypes.map(type => {
        const meals          = getMealsForType(type)
        const total          = getMealTotal(type)
        const hasItems       = meals.length > 0
        const templatesForType = templates.filter(tmpl => tmpl.mealType === type)

        return (
          <div
            key={type}
            style={{ background: CARD, borderColor: hasItems ? BORDER : 'rgba(255,255,255,0.08)' }}
            className={`rounded-2xl p-4 border ${!hasItems ? 'border-dashed' : ''}`}
          >
            <div className="flex justify-between items-center mb-2">
              <p style={{ color: TXT2 }} className="text-[10px] uppercase tracking-widest">
                {t(`meals.${type}`)} {hasItems && <span className="text-green-400">({t('nutrition.logged')})</span>}
              </p>
            </div>

            {hasItems ? (
              <>
                {meals.map(m => (
                  <div key={m.id} style={{ borderColor: BORDER }} className="flex items-center py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm text-white">{m.foodName}</p>
                      <p style={{ color: TXT3 }} className="text-[10px]">{m.grams}g | {m.calories}cal | P:{Math.round(m.protein)}g</p>
                    </div>
                    <button onClick={() => m.id && deleteMealLog(m.id)} style={{ color: TXT3 }} className="p-1 active:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-green-400 font-semibold mt-2">
                  {t('nutrition.total')}: {total.calories}cal | P:{Math.round(total.protein)}g | C:{Math.round(total.carbs)}g | F:{Math.round(total.fat)}g
                </p>
              </>
            ) : (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setActiveTab('log')}
                  style={{ background: GLOW, borderColor: BSTR, color: VOLT }}
                  className="flex-1 border py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> {t('nutrition.addMeal')}
                </button>
                {templatesForType.length > 0 && (
                  <button
                    onClick={() => addMealFromTemplate(templatesForType[0])}
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: BORDER, color: 'var(--text-primary)' }}
                    className="flex-1 border py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Repeat size={14} /> {t('nutrition.useTemplate')}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

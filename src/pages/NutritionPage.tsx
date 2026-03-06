import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { MacroBar } from '../components/MacroBar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { MealType } from '../types'
import { Trash2, Plus, Repeat, Flame, Loader2, UtensilsCrossed, ChevronRight } from 'lucide-react'

export function NutritionPage() {
  const { t } = useTranslation()
  const { profile, todayMeals, todayMacros, templates, loadTodayMeals, loadTemplates, loadProfile, deleteMealLog, addMealFromTemplate, setActiveTab } = useStore()
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.allSettled([loadTodayMeals(), loadTemplates(), loadProfile()]).finally(() => setLoading(false)) }, [])

  const mealTypes: MealType[] = ['breakfast', 'post_workout', 'lunch', 'snack', 'dinner']
  const calTarget = profile?.calorieTarget || 2000
  const calPct = Math.round((todayMacros.calories / calTarget) * 100)

  const getMealsForType = (type: MealType) => todayMeals.filter(m => m.mealType === type)
  const getMealTotal = (type: MealType) => {
    const meals = getMealsForType(type)
    return meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('nutrition.todayNutrition')}</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-cyan-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 stagger-children">
      <h1 className="text-[1.75rem] font-bold text-ct-1 leading-tight tracking-tight">{t('nutrition.todayNutrition')}</h1>

      {/* Calorie + Macro overview */}
      <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
        {/* Calorie header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-400" />
            <p className="text-lg font-bold text-ct-1 tabular-nums">{Math.round(todayMacros.calories)} <span className="text-sm font-normal text-ct-2">/ {calTarget} cal</span></p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            calPct > 100 ? 'bg-red-500/20 text-red-400' : calPct > 80 ? 'bg-green-500/20 text-green-400' : 'bg-ct-elevated text-ct-2'
          }`}><span className="tabular-nums">{calPct}%</span></span>
        </div>

        {/* Macro bars */}
        <div className="flex gap-3">
          <MacroBar label={t('log.protein')} current={todayMacros.protein} target={profile?.proteinTarget || 150} unit="g" color="#4ade80" />
          <MacroBar label={t('log.carbs')} current={todayMacros.carbs} target={profile?.carbsTarget || 200} unit="g" color="#fb923c" />
          <MacroBar label={t('log.fat')} current={todayMacros.fat} target={profile?.fatTarget || 60} unit="g" color="#f472b6" />
        </div>
      </div>

      {/* First-time empty state — shown when zero meals logged today */}
      {todayMeals.length === 0 && (
        <button
          onClick={() => setActiveTab('log')}
          className="w-full text-left bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-ct-surface rounded-ct-lg p-5 border border-orange-500/20 card-press"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/15 rounded-2xl flex items-center justify-center shrink-0">
              <UtensilsCrossed size={22} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-ct-1 mb-1">{t('nutrition.emptyTitle', 'No meals logged yet')}</p>
              <p className="text-[13px] text-ct-2 leading-relaxed mb-2">
                {t('nutrition.emptyDesc', 'Track your first meal to see macros, calories, and daily progress here.')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-400">
                {t('nutrition.emptyCta', 'Log a meal')}
                <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Meals by type */}
      {mealTypes.map(type => {
        const meals = getMealsForType(type)
        const total = getMealTotal(type)
        const hasItems = meals.length > 0
        const templatesForType = templates.filter(tmpl => tmpl.mealType === type)

        return (
          <div key={type} className={`bg-ct-surface rounded-ct-lg p-4 border ${hasItems ? 'border-ct-border' : 'border-dashed border-ct-border/40'}`}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] uppercase tracking-[0.1em] text-ct-2 font-semibold">
                {t(`meals.${type}`)} {hasItems && <span className="text-green-400">({t('nutrition.logged')})</span>}
              </p>
              {hasItems && <p className="text-[11px] text-ct-2 tabular-nums">{Math.round(total.calories)} cal</p>}
            </div>

            {hasItems ? (
              <>
                {meals.map(m => (
                  <div key={m.id} className="flex items-center py-2.5 border-b border-ct-border/30 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ct-1 font-medium">{m.foodName}</p>
                      <p className="text-[11px] text-ct-2 tabular-nums">{m.grams}g  -  {Math.round(m.calories)} cal | P:{Math.round(m.protein)}g C:{Math.round(m.carbs)}g F:{Math.round(m.fat)}g</p>
                    </div>
                    <button onClick={() => m.id && setDeleteTarget({ id: m.id, name: m.foodName })} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-ct-2 active:text-red-400" aria-label={`${t('common.delete')} ${m.foodName}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-ct-border/30">
                  <p className="text-xs text-green-400 font-semibold">
                    P:{Math.round(total.protein)}g C:{Math.round(total.carbs)}g F:{Math.round(total.fat)}g
                  </p>
                  <button onClick={() => setActiveTab('log')} className="text-xs text-cyan-400 font-medium flex items-center gap-0.5 touch-active">
                    <Plus size={12} /> {t('nutrition.addMeal')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 mt-1">
                <button onClick={() => setActiveTab('log')} className="flex-1 bg-ct-elevated/40 border border-ct-border/50 text-cyan-400 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 card-press min-h-[44px]">
                  <Plus size={14} /> {t('nutrition.addMeal')}
                </button>
                {templatesForType.length > 0 && (
                  <button onClick={() => addMealFromTemplate(templatesForType[0])} className="flex-1 bg-ct-elevated/40 border border-ct-border/50 text-ct-2 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1 card-press min-h-[44px]">
                    <Repeat size={14} /> {t('nutrition.useTemplate')}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('common.delete')}
        message={deleteTarget ? `${deleteTarget.name}?` : ''}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => { if (deleteTarget) { deleteMealLog(deleteTarget.id); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
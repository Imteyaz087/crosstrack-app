import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/useStore';
import { db } from '../db/database';
import type { FoodItem, MealTemplate as MealTemplateType, MealTemplateItem, MealType } from '../types';

export function MealPrepPage() {
  const { t } = useTranslation();
  const { addMealFromTemplate } = useStore();
  const [templates, setTemplates] = useState<MealTemplateType[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<MealTemplateType>>({
    name: '',
    mealType: 'breakfast',
    items: [],
  });
  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [foodGrams, setFoodGrams] = useState<string>('100');
  const [weekChecklist, setWeekChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTemplates();
    loadFoods();
    initWeekChecklist();
  }, []);

  const loadTemplates = async () => {
    try {
      const loaded = await db.mealTemplates?.toArray() || [];
      setTemplates(loaded);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadFoods = async () => {
    try {
      const foods = await db.foodLibrary?.toArray() || [];
      setAvailableFoods(foods);
    } catch (error) {
      console.error('Failed to load foods:', error);
    }
  };

  const initWeekChecklist = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const checklist: Record<string, boolean> = {};
    days.forEach(day => {
      checklist[day] = false;
    });
    setWeekChecklist(checklist);
  };

  const calculateMacros = (items: MealTemplateItem[]) => {
    let protein = 0, carbs = 0, fat = 0, calories = 0;
    
    items.forEach(item => {
      const food = availableFoods.find(f => f.id === item.foodId);
      if (food) {
        const multiplier = item.grams / 100;
        protein += food.proteinPer100g * multiplier;
        carbs += food.carbsPer100g * multiplier;
        fat += food.fatPer100g * multiplier;
        calories += food.caloriesPer100g * multiplier;
      }
    });

    return { protein, carbs, fat, calories };
  };

  const addFoodToTemplate = () => {
    if (selectedFood === null || !foodGrams) return;
    
    const food = availableFoods.find(f => f.id === selectedFood);
    if (!food) return;

    const newItems = [
      ...(newTemplate.items || []),
      {
        foodId: food.id!,
        foodName: food.name,
        grams: parseFloat(foodGrams),
      },
    ];
    
    setNewTemplate({ ...newTemplate, items: newItems });
    setSelectedFood(null);
    setFoodGrams('100');
  };

  const removeFoodFromTemplate = (index: number) => {
    const newItems = newTemplate.items?.filter((_, i) => i !== index) || [];
    setNewTemplate({ ...newTemplate, items: newItems });
  };

  const saveTemplate = async () => {
    if (!newTemplate.name || (newTemplate.items?.length || 0) === 0) {
      alert(t('fill_template_fields') || 'Please fill in all template fields');
      return;
    }

    try {
      const templateToSave: MealTemplateType = {
        name: newTemplate.name,
        nameZh: newTemplate.nameZh,
        mealType: newTemplate.mealType as MealType,
        items: newTemplate.items || [],
      };

      const id = await db.mealTemplates?.add(templateToSave);
      if (id) {
        templateToSave.id = id;
        setTemplates([...templates, templateToSave]);
      }

      setNewTemplate({ name: '', mealType: 'breakfast', items: [] });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const addMealFromTemplateToToday = async (template: MealTemplateType) => {
    try {
      await addMealFromTemplate(template);
      alert(t('meal_added') || 'Meal added to today!');
    } catch (error) {
      console.error('Failed to add meal:', error);
    }
  };

  const deleteTemplate = async (templateId: number | undefined) => {
    if (!templateId) return;
    
    try {
      await db.mealTemplates?.delete(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const mealTypeLabels: Partial<Record<MealType, string>> = {
    breakfast: '🥐 Breakfast',
    post_workout: '🍲 Post-Workout',
    lunch: '🥗 Lunch',
    snack: '🥜 Snack',
    morning_snack: '🥜 Morning Snack',
    afternoon_snack: '🥜 Afternoon Snack',
    dinner: '🍽️ Dinner',
  };

  return (
    <div className="page-container">
      <style>{`
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin: 16px 0;
        }
        .template-card {
          padding: 12px;
          min-height: 160px;
          display: flex;
          flex-direction: column;
        }
        .template-card h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--text-primary);
        }
        .template-card p {
          margin: 4px 0;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .macro-label {
          font-weight: 600;
          color: var(--volt);
          font-size: 11px;
        }
        .template-actions {
          display: flex;
          gap: 6px;
          margin-top: auto;
          justify-content: space-between;
        }
        .template-btn {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-raised);
          color: var(--text-primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .template-btn:hover {
          background: var(--volt);
          color: white;
          border-color: var(--volt);
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg-raised);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--volt);
          box-shadow: 0 0 0 3px rgba(0, 255, 157, 0.1);
        }
        .food-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: var(--bg-raised);
          border-radius: 6px;
          margin: 6px 0;
          font-size: 13px;
        }
        .food-item-remove {
          background: none;
          border: none;
          color: #ff4444;
          cursor: pointer;
          padding: 4px;
          font-size: 16px;
        }
        .add-food-section {
          display: grid;
          grid-template-columns: 1fr 80px 40px;
          gap: 8px;
          margin: 12px 0;
          align-items: flex-end;
        }
        .form-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }
        .btn-primary, .btn-secondary, .btn-danger {
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-primary {
          background: var(--volt);
          color: white;
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
        .btn-secondary {
          background: var(--bg-raised);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }
        .btn-secondary:hover {
          background: var(--border);
        }
        .btn-danger {
          background: #ff4444;
          color: white;
          padding: 6px 10px;
          font-size: 12px;
        }
        .btn-danger:hover {
          background: #cc0000;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card);
          border-radius: 16px 16px 0 0;
          padding: 24px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
          margin: 16px 0;
        }
        .checklist-day {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: var(--bg-raised);
          border-radius: 6px;
          cursor: pointer;
        }
        .checklist-day input {
          cursor: pointer;
        }
        .checklist-day.checked {
          background: rgba(0, 255, 157, 0.1);
          border-left: 3px solid var(--volt);
        }
      `}</style>

      <div className={`glass-card page-enter stagger-1`}>
        <h1 style={{ marginTop: 0, color: 'var(--text-primary)' }}>
          {t('meal_prep') || 'Meal Prep'}
        </h1>

        <button
          className="btn-primary"
          onClick={() => setIsCreating(!isCreating)}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {isCreating ? '✕ ' : '+ '}{t('new_template') || 'New Template'}
        </button>

        {isCreating && (
          <div className={`glass-card stagger-2`} style={{ marginBottom: '16px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginTop: 0 }}>
              {t('create_template') || 'Create New Template'}
            </h3>

            <div className="form-group">
              <label className="form-label">{t('name') || 'Template Name'}</label>
              <input
                className="form-input"
                type="text"
                placeholder={t('e_g_protein_breakfast') || 'e.g., Protein Breakfast'}
                value={newTemplate.name || ''}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('meal_type') || 'Meal Type'}</label>
              <select
                className="form-select"
                value={newTemplate.mealType || 'breakfast'}
                onChange={(e) => setNewTemplate({ ...newTemplate, mealType: e.target.value as MealType })}
              >
                <option value="breakfast">{mealTypeLabels.breakfast}</option>
                <option value="post_workout">{mealTypeLabels.post_workout}</option>
                <option value="lunch">{mealTypeLabels.lunch}</option>
                <option value="snack">{mealTypeLabels.snack}</option>
                <option value="dinner">{mealTypeLabels.dinner}</option>
              </select>
            </div>

            <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
              {t('add_foods') || 'Add Foods'}
            </h4>

            <div className="add-food-section">
              <select
                className="form-select"
                value={selectedFood || ''}
                onChange={(e) => setSelectedFood(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">{t('select_food') || 'Select Food'}</option>
                {availableFoods.map(food => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.caloriesPer100g} cal/100g)
                  </option>
                ))}
              </select>
              <input
                className="form-input"
                type="number"
                placeholder={t('grams') || 'Grams'}
                value={foodGrams}
                onChange={(e) => setFoodGrams(e.target.value)}
                min="1"
              />
              <button className="btn-primary" onClick={addFoodToTemplate} style={{ width: '100%' }}>
                +
              </button>
            </div>

            {(newTemplate.items || []).length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {t('selected_foods') || 'Selected Foods'}
                </h4>
                {newTemplate.items!.map((item, idx) => (
                  <div key={idx} className="food-item-row">
                    <span>{item.foodName} ({item.grams}g)</span>
                    <button className="food-item-remove" onClick={() => removeFoodFromTemplate(idx)}>
                      ✕
                    </button>
                  </div>
                ))}
                {(() => {
                  const macros = calculateMacros(newTemplate.items || []);
                  return (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg-raised)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span className="macro-label">P:</span> {macros.protein.toFixed(1)}g | 
                        <span className="macro-label"> C:</span> {macros.carbs.toFixed(1)}g | 
                        <span className="macro-label"> F:</span> {macros.fat.toFixed(1)}g | 
                        <span className="macro-label"> {macros.calories.toFixed(0)}</span> cal
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="form-buttons">
              <button className="btn-primary" onClick={saveTemplate}>
                {t('save_template') || 'Save Template'}
              </button>
              <button className="btn-secondary" onClick={() => {
                setIsCreating(false);
                setNewTemplate({ name: '', mealType: 'breakfast', items: [] });
              }}>
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        )}

        <h2 style={{ color: 'var(--text-primary)' }}>
          {t('your_templates') || 'Your Templates'}
        </h2>
        <div className="template-grid">
          {templates.map((template) => {
            const macros = calculateMacros(template.items);
            return (
              <div key={template.id} className={`glass-card template-card tap-target stagger-${Math.min((templates.indexOf(template) % 5) + 2, 6)}`}>
                <h3>{mealTypeLabels[template.mealType]}</h3>
                <p style={{ fontWeight: 600 }}>{template.name}</p>
                <p>{(template.items || []).length} {t('foods') || 'foods'}</p>
                <p>
                  <span className="macro-label">P:</span> {macros.protein.toFixed(0)}g
                </p>
                <p>
                  <span className="macro-label">Cal:</span> {macros.calories.toFixed(0)}
                </p>
                <div className="template-actions">
                  <button className="template-btn" onClick={() => addMealFromTemplateToToday(template)}>
                    {t('add_today') || 'Add Today'}
                  </button>
                  <button className="btn-danger" onClick={() => deleteTemplate(template.id)}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <h2 style={{ color: 'var(--text-primary)', marginTop: '24px' }}>
          {t('prep_checklist') || 'Weekly Prep Checklist'}
        </h2>
        <div className="checklist-grid">
          {Object.entries(weekChecklist).map(([day, checked]) => (
            <label
              key={day}
              className={`checklist-day ${checked ? 'checked' : ''}`}
              style={{ userSelect: 'none' }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setWeekChecklist({ ...weekChecklist, [day]: e.target.checked })}
              />
              <span style={{ fontSize: '12px' }}>{day}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

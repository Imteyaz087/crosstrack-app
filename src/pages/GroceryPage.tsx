import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { db } from '../db/database'
import { Check, RotateCcw, Plus } from 'lucide-react'

const CARD   = 'var(--bg-card)'
const RAISED = 'var(--bg-raised)'
const BORDER = 'var(--border)'
const VOLT   = 'var(--volt)'
const GLOW   = 'var(--volt-glow)'
const BSTR   = 'var(--border-str)'
const TXT2   = 'var(--text-secondary)'
const TXT3   = 'var(--text-muted)'
const APP    = 'var(--bg-app)'

export function GroceryPage() {
  const { t } = useTranslation()
  const { groceryItems, loadGrocery, toggleGroceryItem, resetGrocery } = useStore()
  const [newItem, setNewItem]         = useState('')
  const [newCategory, setNewCategory] = useState('Protein')
  const [newQty, setNewQty]           = useState('')
  const [showAdd, setShowAdd]         = useState(false)

  useEffect(() => { loadGrocery() }, [])

  const categories: string[] = ['Protein', 'Carbs', 'Vegetables', 'Fats']
  const categoryColors: Record<string, string> = {
    Protein: '#4ade80', Carbs: '#fb923c', Vegetables: '#60a5fa', Fats: '#f472b6',
  }
  const categoryKeys: Record<string, string> = {
    Protein: 'grocery.protein', Carbs: 'grocery.carbs',
    Vegetables: 'grocery.vegetables', Fats: 'grocery.fats',
  }

  const checkedCount = groceryItems.filter(i => i.isChecked).length

  const handleAdd = async () => {
    if (!newItem) return
    await db.groceryItems.add({
      name: newItem, nameZh: '', category: newCategory,
      quantity: newQty, unit: '', isRecurring: false,
      isChecked: false, weekStartDate: '',
    })
    setNewItem(''); setNewQty(''); setShowAdd(false); loadGrocery()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">{t('grocery.title')}</h1>
          <p style={{ color: TXT3 }} className="text-[10px]">{checkedCount}/{groceryItems.length} items checked</p>
        </div>
        <button onClick={resetGrocery} style={{ color: TXT2 }} className="flex items-center gap-1 text-xs">
          <RotateCcw size={12} /> {t('grocery.resetAll')}
        </button>
      </div>

      {categories.map(cat => {
        const items = groceryItems.filter(i => i.category === cat)
        if (items.length === 0) return null
        return (
          <div key={cat} style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border">
            <p style={{ color: categoryColors[cat] }} className="text-[10px] uppercase tracking-widest mb-2">
              {t(categoryKeys[cat])}
            </p>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => item.id && toggleGroceryItem(item.id)}
                style={{ borderColor: BORDER }}
                className="w-full flex items-center gap-3 py-2.5 border-b last:border-0 active:opacity-70 transition-opacity"
              >
                <div
                  style={item.isChecked
                    ? { background: VOLT, borderColor: VOLT }
                    : { borderColor: 'rgba(255,255,255,0.2)' }
                  }
                  className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                >
                  {item.isChecked && <Check size={12} style={{ color: APP }} />}
                </div>
                <span
                  style={item.isChecked ? { color: TXT3 } : { color: 'var(--text-primary)' }}
                  className={`text-sm flex-1 text-left ${item.isChecked ? 'line-through' : ''}`}
                >
                  {item.name}
                </span>
                <span style={{ color: TXT3 }} className="text-xs">{item.quantity} {item.unit}</span>
              </button>
            ))}
          </div>
        )
      })}

      {/* ── Add custom item ───────────────────────────────────────────── */}
      {showAdd ? (
        <div style={{ background: CARD, borderColor: BORDER }} className="rounded-2xl p-4 border space-y-3">
          <input
            value={newItem} onChange={e => setNewItem(e.target.value)}
            placeholder="Item name"
            style={{ background: RAISED, color: 'white' }}
            className="w-full rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--volt)]"
          />
          <div className="flex gap-2">
            <input
              value={newQty} onChange={e => setNewQty(e.target.value)}
              placeholder="Qty"
              style={{ background: RAISED, color: 'white' }}
              className="flex-1 rounded-lg py-2 px-3 text-sm focus:outline-none"
            />
            <select
              value={newCategory} onChange={e => setNewCategory(e.target.value)}
              style={{ background: RAISED, color: 'white' }}
              className="rounded-lg py-2 px-3 text-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} style={{ background: VOLT, color: APP }} className="flex-1 font-bold py-2 rounded-xl text-sm">
              {t('common.save')}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: RAISED, color: 'var(--text-primary)' }} className="flex-1 py-2 rounded-xl text-sm">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: GLOW, borderColor: BSTR, color: VOLT }}
          className="w-full border border-dashed py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus size={16} /> {t('grocery.addCustom')}
        </button>
      )}
    </div>
  )
}

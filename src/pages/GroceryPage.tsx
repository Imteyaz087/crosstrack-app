import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../stores/useStore'
import { db } from '../db/database'
import { Check, RotateCcw, Plus } from 'lucide-react'

export function GroceryPage() {
  const { t } = useTranslation()
  const { groceryItems, loadGrocery, toggleGroceryItem, resetGrocery } = useStore()
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('Protein')
  const [newQty, setNewQty] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { loadGrocery() }, [])

  const categories = ['Protein', 'Carbs', 'Vegetables', 'Fats']
  const categoryColors: Record<string, string> = {
    Protein: 'text-green-400', Carbs: 'text-orange-400',
    Vegetables: 'text-blue-400', Fats: 'text-pink-400',
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
          <h1 className="text-xl font-bold text-ct-1">{t('grocery.title')}</h1>
          <p className="text-[11px] text-ct-2">{checkedCount}/{groceryItems.length} items checked</p>
        </div>
        <button onClick={resetGrocery} className="text-ct-2 flex items-center gap-1 text-xs p-1 rounded-lg active:bg-ct-elevated/50" aria-label="Reset all grocery items">
          <RotateCcw size={12} /> {t('grocery.resetAll')}
        </button>
      </div>

      {categories.map(cat => {
        const items = groceryItems.filter(i => i.category === cat)
        if (items.length === 0) return null
        return (
          <div key={cat} className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border">
            <p className={`text-[11px] uppercase tracking-widest mb-2 ${categoryColors[cat]}`}>{t(categoryKeys[cat])}</p>
            {items.map(item => (
              <button key={item.id} onClick={() => item.id && toggleGroceryItem(item.id)}
                className="w-full flex items-center gap-3 py-2.5 border-b border-slate-700/30 last:border-0 active:bg-slate-700/30">
                <div role="checkbox" aria-checked={item.isChecked}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    item.isChecked ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'
                  }`}>
                  {item.isChecked && <Check size={12} className="text-slate-900" />}
                </div>
                <span className={`text-sm flex-1 text-left ${item.isChecked ? 'line-through text-ct-2' : 'text-ct-1'}`}>{item.name}</span>
                <span className="text-xs text-ct-2">{item.quantity} {item.unit}</span>
              </button>
            ))}
          </div>
        )
      })}

      {/* Add custom item */}
      {showAdd ? (
        <div className="bg-ct-surface rounded-ct-lg p-4 border border-ct-border space-y-3">
          <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Item name" aria-label="Item name"
            className="w-full bg-ct-elevated rounded-xl py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" autoFocus />
          <div className="flex gap-2">
            <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Qty" aria-label="Quantity"
              className="flex-1 bg-ct-elevated rounded-xl py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400" />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} aria-label="Category"
              className="bg-ct-elevated rounded-xl py-2 px-3 text-ct-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!newItem.trim()}
              className={`flex-1 font-bold py-2 rounded-xl text-sm ${
                newItem.trim() ? 'bg-cyan-500 text-slate-900' : 'bg-ct-elevated/60 text-ct-2 cursor-not-allowed'
              }`}>{t('common.save')}</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-ct-elevated text-ct-2 py-2 rounded-xl text-sm">{t('common.cancel')}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="w-full bg-slate-800/40 border border-dashed border-slate-600 text-cyan-400 py-3 rounded-ct-lg text-sm font-medium flex items-center justify-center gap-2">
          <Plus size={16} /> {t('grocery.addCustom')}
        </button>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { categoryService } from '@/lib/services/category.service'

interface Category {
  id:   string
  name: string
}

interface Props {
  value:    string
  onChange: (value: string) => void
}

export default function CategorySelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [newName, setNewName]       = useState('')
  const [creating, setCreating]     = useState(false)

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data.categories ?? [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const data = await categoryService.createCategory(newName)
      setCategories(prev => [...prev, data.category])
      onChange(data.category.id)
      setNewName('')
      setAdding(false)
      toast.success('Category created!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-slate-400 text-sm">Loading categories...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
      >
        <option value="">Select category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Add custom category */}
      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add custom category
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Category name..."
            autoFocus
            className="flex-1 h-8 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="h-8 px-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
          >
            {creating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Add'
            )}
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName('') }}
            className="h-8 px-3 text-slate-400 hover:text-white text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, ChevronDown } from 'lucide-react'
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '48px',
        padding: '0 16px',
        background: '#EDE9FE',
        border: '2px solid rgba(196,181,253,0.5)',
        borderRadius: '12px',
      }}>
        <Loader2 style={{ width: '16px', height: '16px', color: '#7C3AED' }} className="animate-spin" />
        <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '14px', color: '#7C3AED' }}>
          Loading categories...
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* Select wrapper — relative for custom chevron */}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            height: '48px',
            padding: '0 44px 0 16px',
            background: '#FAF5FF',
            border: '2px solid rgba(196,181,253,0.5)',
            borderRadius: '12px',
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: value ? '#1e1b4b' : '#9ca3af',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 1px 4px rgba(124,58,237,0.06)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#7C3AED'
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.10)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(196,181,253,0.5)'
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(124,58,237,0.06)'
          }}
        >
          <option value="">Select category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Custom chevron icon */}
        <ChevronDown style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '18px',
          height: '18px',
          color: '#7C3AED',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Add custom category */}
      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: '13px',
            color: '#7C3AED',
            background: 'none',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#6D28D9')}
          onMouseLeave={e => (e.currentTarget.style.color = '#7C3AED')}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          Add custom category
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Category name..."
            autoFocus
            style={{
              flex: 1,
              height: '40px',
              padding: '0 12px',
              background: '#FAF5FF',
              border: '2px solid rgba(196,181,253,0.5)',
              borderRadius: '10px',
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '13px',
              color: '#1e1b4b',
              outline: 'none',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#7C3AED'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.10)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(196,181,253,0.5)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            style={{
              height: '40px',
              padding: '0 16px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer',
              opacity: creating || !newName.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {creating ? (
              <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
            ) : (
              'Add'
            )}
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName('') }}
            style={{
              height: '40px',
              padding: '0 12px',
              background: 'rgba(124,58,237,0.08)',
              color: '#7C3AED',
              border: '2px solid rgba(196,181,253,0.4)',
              borderRadius: '10px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

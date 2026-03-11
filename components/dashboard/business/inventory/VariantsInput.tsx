'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label:    string
  values:   string[]
  onChange: (values: string[]) => void
  placeholder?: string
  colorMode?: boolean
}

const PRESET_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const PRESET_COLORS = [
  { name: 'Black',  hex: '#000000' },
  { name: 'White',  hex: '#FFFFFF' },
  { name: 'Red',    hex: '#EF4444' },
  { name: 'Blue',   hex: '#3B82F6' },
  { name: 'Green',  hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink',   hex: '#EC4899' },
  { name: 'Gray',   hex: '#6B7280' },
  { name: 'Brown',  hex: '#92400E' },
]

export default function VariantsInput({
  label,
  values,
  onChange,
  placeholder = 'Type and press Enter',
  colorMode = false,
}: Props) {
  const [input, setInput] = useState('')

  const add = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInput('')
  }

  const remove = (val: string) => {
    onChange(values.filter(v => v !== val))
  }

  const presets = colorMode ? PRESET_COLORS.map(c => c.name) : PRESET_SIZES

  return (
    <div className="space-y-2">
      <p className="text-slate-200 text-sm font-medium">{label}</p>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => add(preset)}
            disabled={values.includes(preset)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
              values.includes(preset)
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-default'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500 hover:text-white'
            )}
          >
            {colorMode && (
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{
                  backgroundColor: PRESET_COLORS.find(
                    c => c.name === preset
                  )?.hex,
                }}
              />
            )}
            {preset}
          </button>
        ))}
      </div>

      {/* Selected values */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map(val => (
            <span
              key={val}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium"
            >
              {val}
              <button
                type="button"
                onClick={() => remove(val)}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(input)
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={() => add(input)}
          disabled={!input.trim()}
          className="h-9 px-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
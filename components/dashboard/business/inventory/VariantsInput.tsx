'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface Props {
  label:        string
  values:       string[]
  onChange:     (values: string[]) => void
  placeholder?: string
  colorMode?:   boolean
}

const PRESET_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const PRESET_COLORS = [
  { name: 'Black',  hex: '#000000' },
  { name: 'White',  hex: '#E5E7EB' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* Label */}
      <p style={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 700,
        fontSize: '13px',
        color: '#7C3AED',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        {label}
      </p>

      {/* Preset chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {presets.map(preset => {
          const isSelected = values.includes(preset)
          return (
            <button
              key={preset}
              type="button"
              onClick={() => isSelected ? remove(preset) : add(preset)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                border: isSelected
                  ? '2px solid rgba(124,58,237,0.5)'
                  : '2px solid rgba(196,181,253,0.5)',
                background: isSelected
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : '#FAF5FF',
                color: isSelected ? '#ffffff' : '#7C3AED',
                cursor: isSelected ? 'pointer' : 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = '#EDE9FE'
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
                } else {
                  e.currentTarget.style.opacity = '0.8'
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = '#FAF5FF'
                  e.currentTarget.style.borderColor = 'rgba(196,181,253,0.5)'
                } else {
                  e.currentTarget.style.opacity = '1'
                }
              }}
            >
              {colorMode && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: PRESET_COLORS.find(c => c.name === preset)?.hex,
                    border: preset === 'White' ? '1px solid #D1D5DB' : 'none',
                    flexShrink: 0,
                  }}
                />
              )}
              {preset}
            </button>
          )
        })}
      </div>

      {/* Selected custom values (not in presets) */}
      {values.filter(v => !presets.includes(v)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {values.filter(v => !presets.includes(v)).map(val => (
            <span
              key={val}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#ffffff',
                borderRadius: '999px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
              }}
            >
              {val}
              <button
                type="button"
                onClick={() => remove(val)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              >
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          style={{
            flex: 1,
            height: '44px',
            padding: '0 14px',
            background: '#FAF5FF',
            border: '2px solid rgba(196,181,253,0.5)',
            borderRadius: '12px',
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '13px',
            color: '#1e1b4b',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#7C3AED'
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.10)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(196,181,253,0.5)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          type="button"
          onClick={() => add(input)}
          disabled={!input.trim()}
          style={{
            width: '44px',
            height: '44px',
            background: input.trim()
              ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
              : 'rgba(196,181,253,0.3)',
            border: 'none',
            borderRadius: '12px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
            boxShadow: input.trim() ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
            flexShrink: 0,
          }}
        >
          <Plus style={{
            width: '18px',
            height: '18px',
            color: input.trim() ? '#ffffff' : '#9ca3af',
          }} />
        </button>
      </div>
    </div>
  )
}

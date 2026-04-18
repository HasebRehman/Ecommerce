'use client'

import { useEffect, useState } from 'react'
import {
  MapPin, Plus, Check, Trash2,
  Home, Building2, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

interface Address {
  id:         string
  full_name:  string
  phone:      string
  address:    string
  city:       string
  label:      string
  is_default: boolean
}

interface Props {
  onSelect: (addr: Address) => void
  selected: Address | null
}

const LABELS = ['Home', 'Office', 'Other']

/* label accent colours — all on-brand */
const LABEL_STYLE: Record<string, { bg: string; color: string }> = {
  Home:   { bg: 'rgba(124,58,237,0.15)',  color: '#7C3AED' },
  Office: { bg: 'rgba(109,40,217,0.12)', color: '#6D28D9' },
  Other:  { bg: 'rgba(124,58,237,0.1)',    color: 'rgba(124,58,237,0.6)' },
}

export default function AddressSelector({ onSelect, selected }: Props) {
  const [addresses, setAddresses]  = useState<Address[]>([])
  const [loading,   setLoading]    = useState(true)
  const [showForm,  setShowForm]   = useState(false)
  const [saving,    setSaving]     = useState(false)
  const [collapsed, setCollapsed]  = useState(false)

  const [form, setForm] = useState({
    full_name:  '',
    phone:      '',
    address:    '',
    city:       '',
    label:      'Home',
    is_default: false,
  })

  /* ── all logic completely unchanged ── */
  useEffect(() => { loadAddresses() }, [])

  const loadAddresses = async () => {
    try {
      const res  = await api.get('/api/store/addresses')
      const list: Address[] = res.data.addresses ?? []
      setAddresses(list)
      if (list.length > 0 && !selected) {
        const def = list.find(a => a.is_default) ?? list[0]
        onSelect(def)
      }
      if (list.length === 0) setShowForm(true)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handleSaveAddress = async () => {
    if (!form.full_name || !form.phone || !form.address || !form.city) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      const res  = await api.post('/api/store/addresses', form)
      const data = res.data

      if (data.duplicate) {
        toast.info('This address is already saved')
        const dup = addresses.find(a => a.id === data.address_id)
        if (dup) onSelect(dup)
        setShowForm(false)
        return
      }

      const saved = data.address as Address
      setAddresses(prev => [saved, ...prev])
      onSelect(saved)
      setShowForm(false)
      setForm({ full_name: '', phone: '', address: '', city: '', label: 'Home', is_default: false })
      toast.success('Address saved!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/store/addresses/${id}`)
      const updated = addresses.filter(a => a.id !== id)
      setAddresses(updated)
      if (selected?.id === id) onSelect(updated[0] ?? null as any)
      toast.success('Address removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{sharedStyles}</style>
      <div className="as-root flex items-center gap-2.5 px-1 py-3">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: '#7C3AED' }} />
        <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>
          Loading addresses…
        </span>
      </div>
    </>
  )

  return (
    <>
      <style>{sharedStyles}</style>

      <div className="as-root space-y-3">

        {/* ── Section header ───────────────────────── */}
        <div
          className="as-header flex items-center justify-between px-1"
          onClick={() => setCollapsed(c => !c)}
        >
          <div className="flex items-center gap-2.5">
            {/* Icon tile */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                border: '1px solid rgba(124,58,237,0.35)',
              }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: '#fff' }} />
            </div>
            <span className="text-gray-900 font-bold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Delivery Address</span>
            {selected && !collapsed && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  color: '#7C3AED',
                }}>
                <Check className="w-2.5 h-2.5" />
                Selected
              </span>
            )}
          </div>

          <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(124,58,237,0.1)', color: '#9CA3AF' }}>
            {collapsed
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* ── Collapsed summary ────────────────────── */}
        {collapsed && selected && (
          <div className="as-summary-card px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(243,232,255,0.5)',
              border: '1px solid rgba(124,58,237,0.15)',
            }}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-gray-900 font-semibold text-sm">{selected.full_name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: LABEL_STYLE[selected.label]?.bg ?? LABEL_STYLE.Other.bg,
                  color: LABEL_STYLE[selected.label]?.color ?? LABEL_STYLE.Other.color,
                }}>
                {selected.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#6B7280' }}>
              {selected.phone} · {selected.address}, {selected.city}
            </p>
          </div>
        )}

        {/* ── Expanded content ─────────────────────── */}
        {!collapsed && (
          <div className="space-y-2.5">

            {/* Saved address cards */}
            {addresses.map((addr, idx) => {
              const isSelected = selected?.id === addr.id
              return (
                <div
                  key={addr.id}
                  onClick={() => onSelect(addr)}
                  className="as-addr-card flex items-start gap-3 p-3.5 rounded-2xl transition-all"
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.1)' : 'rgba(243,232,255,0.4)',
                    border: isSelected
                      ? '1px solid rgba(124,58,237,0.3)'
                      : '1px solid rgba(124,58,237,0.15)',
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  {/* Radio circle */}
                  <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: isSelected ? '#7C3AED' : 'rgba(124,58,237,0.3)',
                      background:  isSelected ? '#7C3AED' : 'transparent',
                      boxShadow:   isSelected ? '0 0 8px rgba(124,58,237,0.4)' : 'none',
                    }}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>

                  {/* Address info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-gray-900 text-sm font-semibold">{addr.full_name}</span>

                      {/* Label pill */}
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{
                          background: LABEL_STYLE[addr.label]?.bg ?? LABEL_STYLE.Other.bg,
                          color: LABEL_STYLE[addr.label]?.color ?? LABEL_STYLE.Other.color,
                          border: `1px solid ${LABEL_STYLE[addr.label]?.color ?? LABEL_STYLE.Other.color}30`,
                        }}>
                        {addr.label}
                      </span>

                      {/* Default badge */}
                      {addr.is_default && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(250,204,21,0.12)',
                            color: '#facc15',
                            border: '1px solid rgba(250,204,21,0.25)',
                          }}>
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {addr.phone}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                      {addr.address}, {addr.city}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={e => handleDelete(addr.id, e)}
                    className="as-delete-btn shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      color: 'rgba(248,113,113,0.5)',
                      border: '1px solid transparent',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.background = 'rgba(239,68,68,0.2)'
                      b.style.color      = '#f87171'
                      b.style.borderColor = 'rgba(239,68,68,0.3)'
                    }}
                    onMouseLeave={e => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.background = 'rgba(239,68,68,0.08)'
                      b.style.color      = 'rgba(248,113,113,0.5)'
                      b.style.borderColor = 'transparent'
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}

            {/* Add new address button */}
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="as-add-btn w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: 'rgba(243,232,255,0.5)',
                  border: '1px dashed rgba(124,58,237,0.3)',
                  color: '#7C3AED',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = 'rgba(124,58,237,0.5)'
                  b.style.color       = '#6D28D9'
                  b.style.background  = 'rgba(124,58,237,0.1)'
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = 'rgba(124,58,237,0.3)'
                  b.style.color       = '#7C3AED'
                  b.style.background  = 'rgba(243,232,255,0.5)'
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            )}

            {/* ── New address form ─────────────────── */}
            {showForm && (
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(243,232,255,0.6)',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}>

                {/* Form header */}
                <div className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                        border: '1px solid rgba(124,58,237,0.3)',
                      }}>
                      <Plus className="w-3 h-3" style={{ color: '#fff' }} />
                    </div>
                    <p className="text-gray-900 text-sm font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>New Address</p>
                  </div>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
                      style={{ color: '#7C3AED', background: 'rgba(124,58,237,0.1)', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6D28D9' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#7C3AED' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-3.5">

                  {/* Label tabs */}
                  <div className="flex gap-2">
                    {LABELS.map(l => {
                      const active = form.label === l
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, label: l }))}
                          className="flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all"
                          style={{
                            background: active ? '#7C3AED' : 'rgba(124,58,237,0.1)',
                            color:      active ? '#fff'    : '#7C3AED',
                            border: active
                              ? '1px solid rgba(124,58,237,0.6)'
                              : '1px solid rgba(124,58,237,0.2)',
                            boxShadow: active ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {l}
                        </button>
                      )
                    })}
                  </div>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="as-label">Full Name *</label>
                      <input
                        value={form.full_name}
                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                        placeholder="Hassan Ali"
                        className="as-input"
                      />
                    </div>
                    <div>
                      <label className="as-label">Phone *</label>
                      <input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="03XX XXXXXXX"
                        className="as-input"
                      />
                    </div>
                  </div>

                  {/* Street address */}
                  <div>
                    <label className="as-label">Street Address *</label>
                    <input
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="House #, Street, Area"
                      className="as-input"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="as-label">City *</label>
                    <input
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Lahore"
                      className="as-input"
                    />
                  </div>

                  {/* Save button */}
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="as-save-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all"
                    style={{
                      background: '#7C3AED',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                      opacity: saving ? 0.6 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#6D28D9'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#7C3AED'
                    }}
                  >
                    {saving
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>
                          <Check className="w-4 h-4" />
                          Save &amp; Use This Address
                        </>
                    }
                  </button>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  )
}

/* ── Shared CSS injected once ─────────────────────────────── */
const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;500;600&display=swap');

  .as-root * { box-sizing: border-box; }
  .as-root { font-family: 'Open Sans', sans-serif; }

  /* header hover */
  .as-header { transition: opacity 0.15s ease; cursor: pointer; }
  .as-header:hover { opacity: 0.85; }

  /* address card hover */
  .as-addr-card:hover { border-color: rgba(124,58,237,0.25) !important; }

  /* animate rows in */
  @keyframes asFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .as-addr-card { animation: asFadeUp 0.32s cubic-bezier(.22,1,.36,1) both; }

  /* form input */
  .as-input {
    width: 100%;
    background: rgba(243,232,255,0.5);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 12px;
    padding: 0.55rem 0.8rem;
    color: #374151;
    font-size: 0.8rem;
    font-family: 'Open Sans', sans-serif;
    outline: none;
    caret-color: #7C3AED;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .as-input::placeholder { color: #D1D5DB; }
  .as-input:focus {
    border-color: #7C3AED;
    background: rgba(243,232,255,0.8);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.14);
  }

  /* form label */
  .as-label {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7C3AED;
    margin-bottom: 0.35rem;
    font-family: 'Montserrat', sans-serif;
  }

  /* save btn press */
  .as-save-btn:active:not(:disabled) { transform: scale(0.98); }
`
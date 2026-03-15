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

export default function AddressSelector({ onSelect, selected }: Props) {
  const [addresses,  setAddresses]  = useState<Address[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)

  const [form, setForm] = useState({
    full_name:  '',
    phone:      '',
    address:    '',
    city:       '',
    label:      'Home',
    is_default: false,
  })

  useEffect(() => { loadAddresses() }, [])

  const loadAddresses = async () => {
    try {
      const res  = await api.get('/api/store/addresses')
      const list: Address[] = res.data.addresses ?? []
      setAddresses(list)
      // Auto-select default or first
      if (list.length > 0 && !selected) {
        const def = list.find(a => a.is_default) ?? list[0]
        onSelect(def)
      }
      // No saved addresses — show form immediately
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

  if (loading) return (
    <div className="flex items-center gap-2 p-3">
      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      <span className="text-slate-400 text-sm">Loading addresses...</span>
    </div>
  )

  return (
    <div className="space-y-3">

      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-white font-semibold text-sm">Delivery Address</span>
          {selected && !collapsed && (
            <span className="text-xs text-green-400">✓ Selected</span>
          )}
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-slate-400" />
          : <ChevronUp className="w-4 h-4 text-slate-400" />
        }
      </div>

      {/* Selected summary when collapsed */}
      {collapsed && selected && (
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-sm">
          <p className="text-white font-medium">{selected.full_name} · {selected.phone}</p>
          <p className="text-slate-400 text-xs mt-0.5">{selected.address}, {selected.city}</p>
        </div>
      )}

      {!collapsed && (
        <div className="space-y-2">

          {/* Saved addresses list */}
          {addresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => onSelect(addr)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                selected?.id === addr.id
                  ? 'bg-blue-500/10 border-blue-500/40'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              )}
            >
              {/* Radio circle */}
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                selected?.id === addr.id ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
              )}>
                {selected?.id === addr.id && <Check className="w-2.5 h-2.5 text-white" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{addr.full_name}</span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    addr.label === 'Home'   ? 'bg-blue-500/15 text-blue-400' :
                    addr.label === 'Office' ? 'bg-purple-500/15 text-purple-400' :
                    'bg-slate-700 text-slate-400'
                  )}>
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="text-xs text-yellow-400">Default</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{addr.phone}</p>
                <p className="text-slate-300 text-xs mt-0.5">{addr.address}, {addr.city}</p>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={e => handleDelete(addr.id, e)}
                className="p-1 text-slate-600 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add new address button */}
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </button>
          )}

          {/* New address form */}
          {showForm && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">New Address</p>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-slate-500 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Label tabs */}
              <div className="flex gap-2">
                {LABELS.map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, label: l }))}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                      form.label === l
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Full Name *</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Hassan Ali"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Phone *</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="03XX XXXXXXX"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Street Address *</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="House #, Street, Area"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">City *</label>
                <input
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Lahore"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={saving}
                className="w-full h-9 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Plus className="w-4 h-4" /> Save & Use This Address</>
                }
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
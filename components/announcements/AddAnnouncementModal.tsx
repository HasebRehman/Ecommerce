'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  X, Loader2, Megaphone, Calendar, Clock,
  Users, MessageSquare, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { announcementService } from '@/lib/services/announcement.service'
import type { Announcement } from '@/types'

// ── Schema ────────────────────────────────────────────────────
const schema = z.object({
  subject:     z.string().min(1, 'Subject is required'),
  date:        z.string().min(1, 'Date is required'),
  time:        z.string().min(1, 'Time is required'),
  targetRoles: z.array(z.string()).min(1, 'Select at least one target audience'),
  message:     z.string().min(1, 'Message is required'),
})
type FormData = z.infer<typeof schema>

// ── Constants ─────────────────────────────────────────────────
const AUDIENCE_OPTIONS = [
  { value: 'super_admin',      label: 'Super Admin'       },
  { value: 'platform_admin',   label: 'Platform Admin'    },
  { value: 'operations_admin', label: 'Operational Admin' },
  { value: 'business_owner',   label: 'Seller'            },
  { value: 'customer',         label: 'Customer'          },
]
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

// ── Custom Calendar ───────────────────────────────────────────
function CalendarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today    = new Date()
  const initDate = value ? new Date(value + 'T00:00:00') : today
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())
  const [showYears, setShowYears] = useState(false)

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  const selected    = value ? new Date(value + 'T00:00:00') : null
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
  }
  const isSelected = (day: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth()    === viewMonth &&
    selected.getDate()     === day
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === day

  const yearStart = Math.floor(viewYear / 12) * 12
  const yearGrid  = Array.from({ length: 12 }, (_, i) => yearStart + i)

  const navBtn = (onClick: () => void, icon: React.ReactNode) => (
    <button type="button" onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.18)',
      color: 'white', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
    >{icon}</button>
  )

  return (
    <div style={{
      background: 'rgba(30,10,70,0.55)',
      border: '1.5px solid rgba(255,255,255,0.2)',
      borderRadius: 16,
      padding: 16,
      backdropFilter: 'blur(12px)',
      userSelect: 'none',
    }}>
      {/* Month / Year header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {navBtn(prevMonth, <ChevronLeft style={{ width: 14, height: 14 }} />)}
        <button type="button" onClick={() => setShowYears(s => !s)} style={{
          background: 'rgba(255,255,255,0.14)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 8, padding: '5px 14px',
          color: 'white', fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700, fontSize: 13, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
        >
          {showYears ? `${yearStart} – ${yearStart + 11}` : `${MONTHS[viewMonth]} ${viewYear}`}
        </button>
        {navBtn(nextMonth, <ChevronRight style={{ width: 14, height: 14 }} />)}
      </div>

      {showYears ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {yearGrid.map(yr => (
            <button key={yr} type="button"
              onClick={() => { setViewYear(yr); setShowYears(false) }}
              style={{
                padding: '7px 0', borderRadius: 8,
                border: yr === viewYear ? '1.5px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.12)',
                background: yr === viewYear ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                color: 'white', fontFamily: 'Open Sans, sans-serif',
                fontSize: 12, fontWeight: yr === viewYear ? 700 : 400, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (yr !== viewYear) e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { if (yr !== viewYear) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            >{yr}</button>
          ))}
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700, fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '2px 0',
              }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />
              const sel = isSelected(day)
              const tod = isToday(day)
              return (
                <button key={idx} type="button" onClick={() => selectDay(day)} style={{
                  width: '100%', aspectRatio: '1', borderRadius: 8,
                  border: sel ? 'none' : tod ? '1.5px solid rgba(255,255,255,0.45)' : '1px solid transparent',
                  background: sel ? 'white' : 'rgba(255,255,255,0.06)',
                  color: sel ? '#7C3AED' : 'white',
                  fontFamily: 'Open Sans, sans-serif', fontSize: 12,
                  fontWeight: sel ? 800 : tod ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                >{day}</button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Custom Time Picker ────────────────────────────────────────
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hour,   setHour]   = useState(12)
  const [minute, setMinute] = useState(0)
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  useEffect(() => {
    if (!value) return
    const [hStr, mStr] = value.split(':')
    let h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
    if (h === 0) h = 12
    else if (h > 12) h -= 12
    setHour(h); setMinute(m); setPeriod(p)
  }, [])

  const emit = useCallback((h: number, m: number, p: 'AM' | 'PM') => {
    let h24 = h
    if (p === 'AM' && h === 12) h24 = 0
    else if (p === 'PM' && h !== 12) h24 = h + 12
    onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }, [onChange])

  const changeHour   = (d: number) => { const n = ((hour - 1 + d + 12) % 12) + 1; setHour(n);   emit(n, minute, period) }
  const changeMinute = (d: number) => { const n = (minute + d + 60) % 60;          setMinute(n); emit(hour, n, period)   }
  const togglePeriod = () => { const n: 'AM' | 'PM' = period === 'AM' ? 'PM' : 'AM'; setPeriod(n); emit(hour, minute, n) }

  const spinBtn = (onClick: () => void, icon: React.ReactNode) => (
    <button type="button" onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.18)',
      color: 'white', display: 'flex', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
    >{icon}</button>
  )

  const col = (label: string, val: number, up: () => void, down: () => void) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {spinBtn(up,   <ChevronLeft style={{ width: 14, height: 14, transform: 'rotate(90deg)'  }} />)}
      <div style={{
        width: 58, height: 52, borderRadius: 12,
        background: 'rgba(255,255,255,0.14)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 22, color: 'white', lineHeight: 1 }}>
          {String(val).padStart(2, '0')}
        </span>
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</span>
      </div>
      {spinBtn(down, <ChevronLeft style={{ width: 14, height: 14, transform: 'rotate(270deg)' }} />)}
    </div>
  )

  return (
    <div style={{
      background: 'rgba(30,10,70,0.55)',
      border: '1.5px solid rgba(255,255,255,0.2)',
      borderRadius: 16, padding: '16px 20px',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 12,
    }}>
      {col('HOUR', hour, () => changeHour(1), () => changeHour(-1))}

      <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 26, color: 'rgba(255,255,255,0.5)', lineHeight: 1, marginBottom: 4 }}>:</span>

      {col('MIN', minute, () => changeMinute(5), () => changeMinute(-5))}

      {/* AM / PM */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 4 }}>
        {(['AM', 'PM'] as const).map(p => (
          <button key={p} type="button" onClick={togglePeriod} style={{
            width: 46, height: 32, borderRadius: 8,
            background: period === p ? 'white' : 'rgba(255,255,255,0.08)',
            border: period === p ? 'none' : '1px solid rgba(255,255,255,0.18)',
            color: period === p ? '#7C3AED' : 'rgba(255,255,255,0.55)',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 800,
            fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (period !== p) e.currentTarget.style.background = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { if (period !== p) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          >{p}</button>
        ))}
      </div>
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────
interface Props {
  isOpen:    boolean
  onClose:   () => void
  onSuccess: (announcement: Announcement) => void
}

export default function AddAnnouncementModal({ isOpen, onClose, onSuccess }: Props) {
  const overlayRef    = useRef<HTMLDivElement>(null)
  const calendarRef   = useRef<HTMLDivElement>(null)
  const timePickerRef = useRef<HTMLDivElement>(null)
  const [showCalendar,   setShowCalendar]   = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const {
    register, handleSubmit, control, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { targetRoles: [], date: '', time: '' },
  })

  const dateValue = watch('date')
  const timeValue = watch('time')

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCalendar)   { setShowCalendar(false);   return }
        if (showTimePicker) { setShowTimePicker(false);  return }
        onClose()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [isOpen, onClose, showCalendar, showTimePicker])

  // Click-outside to close pickers
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (calendarRef.current   && !calendarRef.current.contains(e.target as Node))   setShowCalendar(false)
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node)) setShowTimePicker(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Reset on open
  useEffect(() => {
    if (isOpen) { 
      reset({ targetRoles: [], date: '', time: '', subject: '', message: '' })
      setShowCalendar(false)
      setShowTimePicker(false)
    }
  }, [isOpen, reset])

  // Display helpers
  const displayDate = dateValue
    ? new Date(dateValue + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select date'

  const displayTime = timeValue
    ? (() => {
        const [hStr, mStr] = timeValue.split(':')
        let h = parseInt(hStr, 10)
        const p = h >= 12 ? 'PM' : 'AM'
        if (h === 0) h = 12; else if (h > 12) h -= 12
        return `${h}:${mStr} ${p}`
      })()
    : 'Select time'

  const onSubmit = async (data: FormData) => {
    const scheduledAt = new Date(`${data.date}T${data.time}:00`)
    if (isNaN(scheduledAt.getTime())) { toast.error('Invalid date or time selected'); return }
    
    // Check if the selected date/time is in the past
    const now = new Date()
    if (scheduledAt <= now) {
      toast.error('Set the correct date and time')
      return
    }
    
    try {
      const announcement = await announcementService.create({
        subject: data.subject, message: data.message,
        scheduledAt: scheduledAt.toISOString(),
        targetRoles: data.targetRoles as any,
      })
      toast.success('Announcement created successfully')
      
      // Reset form fields before closing
      reset({ targetRoles: [], date: '', time: '', subject: '', message: '' })
      
      onSuccess(announcement)
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? err?.message ?? 'Failed to create announcement')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .am-header { font-family: 'Montserrat', sans-serif; }
        .am-body   { font-family: 'Open Sans',   sans-serif; }
        button, a  { cursor: pointer !important; }

        @keyframes amFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes amSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        .am-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 9998;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: amFadeIn 0.2s ease;
        }
        .am-panel {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border-radius: 24px;
          box-shadow: 0 24px 60px rgba(124,58,237,0.45), 0 8px 24px rgba(0,0,0,0.3);
          width: 100%; max-width: 560px;
          max-height: calc(100dvh - 32px);
          overflow-y: auto; position: relative; z-index: 9999;
          animation: amSlideUp 0.3s cubic-bezier(0.22,1,0.36,1);
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent;
        }
        .am-panel::-webkit-scrollbar { width: 5px; }
        .am-panel::-webkit-scrollbar-track { background: transparent; }
        .am-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 99px; }

        .am-label {
          font-family: 'Montserrat', sans-serif; font-weight: 700;
          font-size: 12px; color: rgba(255,255,255,0.85);
          margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
        }
        .am-input {
          width: 100%; height: 44px; padding: 0 14px;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif; font-size: 14px; color: #fff;
          outline: none; transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .am-input::placeholder { color: rgba(255,255,255,0.4); }
        .am-input:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.18); }

        .am-picker-trigger {
          width: 100%; height: 44px; padding: 0 14px;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer;
        }
        .am-picker-trigger:hover,
        .am-picker-trigger.open {
          border-color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.18);
        }
        .am-picker-trigger .placeholder { color: rgba(255,255,255,0.4); }
        .am-picker-trigger .selected    { color: #ffffff; font-weight: 600; }

        .am-textarea {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif; font-size: 14px; color: #fff;
          outline: none; resize: vertical; min-height: 110px;
          transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
        }
        .am-textarea::placeholder { color: rgba(255,255,255,0.4); }
        .am-textarea:focus { border-color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.18); }

        .am-error { font-family: 'Open Sans', sans-serif; font-size: 11px; color: #fca5a5; margin-top: 4px; }

        .am-checkbox-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          user-select: none;
        }
        .am-checkbox-row:hover  { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.25); }
        .am-checkbox-row.active { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.4); }

        .am-checkbox {
          width: 16px; height: 16px; border-radius: 5px;
          border: 2px solid rgba(255,255,255,0.5);
          background: transparent; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .am-checkbox.active { background: white; border-color: white; }

        .am-submit {
          width: 100%; height: 48px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: white; border: none; border-radius: 14px;
          font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 14px;
          color: #7C3AED;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          transition: all 0.2s; cursor: pointer;
        }
        .am-submit:hover:not(:disabled) { background: #F3EEFF; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        .am-submit:disabled { opacity: 0.55; cursor: not-allowed !important; }

        @media (max-width: 480px) {
          .am-panel { border-radius: 20px; }
          .am-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div ref={overlayRef} className="am-overlay"
        onClick={e => { if (e.target === overlayRef.current) onClose() }}>
        <div className="am-panel" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Megaphone style={{ width: 18, height: 18, color: '#C4B5FD' }} />
              </div>
              <div>
                <h2 className="am-header" style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                  Add Announcement
                </h2>
                <p className="am-body" style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                  Schedule a platform-wide announcement
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '18px 0 0' }} />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Subject */}
              <div>
                <label className="am-label">
                  <MessageSquare style={{ width: 13, height: 13 }} /> Subject
                </label>
                <input {...register('subject')} className="am-input" placeholder="Enter announcement subject..." />
                {errors.subject && <p className="am-error">{errors.subject.message}</p>}
              </div>

              {/* Date + Time */}
              <div className="am-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                {/* Date picker */}
                <div>
                  <label className="am-label">
                    <Calendar style={{ width: 13, height: 13 }} /> Date
                  </label>
                  <Controller name="date" control={control} render={({ field }) => (
                    <div ref={calendarRef} style={{ position: 'relative' }}>
                      <button type="button"
                        className={`am-picker-trigger${showCalendar ? ' open' : ''}`}
                        onClick={() => { setShowCalendar(s => !s); setShowTimePicker(false) }}
                      >
                        <span className={dateValue ? 'selected' : 'placeholder'}>
                          {displayDate}
                        </span>
                        <Calendar style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                      </button>
                      {showCalendar && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100 }}>
                          <CalendarPicker
                            value={field.value}
                            onChange={v => { field.onChange(v); setValue('date', v); setShowCalendar(false) }}
                          />
                        </div>
                      )}
                    </div>
                  )} />
                  {errors.date && <p className="am-error">{errors.date.message}</p>}
                </div>

                {/* Time picker */}
                <div>
                  <label className="am-label">
                    <Clock style={{ width: 13, height: 13 }} /> Time
                  </label>
                  <Controller name="time" control={control} render={({ field }) => (
                    <div ref={timePickerRef} style={{ position: 'relative' }}>
                      <button type="button"
                        className={`am-picker-trigger${showTimePicker ? ' open' : ''}`}
                        onClick={() => { setShowTimePicker(s => !s); setShowCalendar(false) }}
                      >
                        <span className={timeValue ? 'selected' : 'placeholder'}>
                          {displayTime}
                        </span>
                        <Clock style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                      </button>
                      {showTimePicker && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 100 }}>
                          <TimePicker
                            value={field.value}
                            onChange={v => { field.onChange(v); setValue('time', v) }}
                          />
                        </div>
                      )}
                    </div>
                  )} />
                  {errors.time && <p className="am-error">{errors.time.message}</p>}
                </div>

              </div>

              {/* Target Audience */}
              <div>
                <label className="am-label">
                  <Users style={{ width: 13, height: 13 }} /> Target Audience
                </label>
                <Controller name="targetRoles" control={control} render={({ field }) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {AUDIENCE_OPTIONS.map(opt => {
                      const checked = field.value.includes(opt.value)
                      return (
                        <label key={opt.value} className={`am-checkbox-row${checked ? ' active' : ''}`}>
                          <div className={`am-checkbox${checked ? ' active' : ''}`}>
                            {checked && (
                              <svg style={{ width: 9, height: 9 }} viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <input type="checkbox" style={{ display: 'none' }} checked={checked}
                            onChange={() => field.onChange(
                              checked ? field.value.filter((v: string) => v !== opt.value) : [...field.value, opt.value]
                            )} />
                          <span className="am-body" style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: checked ? 600 : 400 }}>
                            {opt.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )} />
                {errors.targetRoles && <p className="am-error">{errors.targetRoles.message}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="am-label">
                  <MessageSquare style={{ width: 13, height: 13 }} /> Message
                </label>
                <textarea {...register('message')} className="am-textarea" rows={4}
                  placeholder="Write your announcement message here..." />
                {errors.message && <p className="am-error">{errors.message.message}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting} className="am-submit">
                {isSubmitting
                  ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Creating...</>
                  : <><Megaphone style={{ width: 16, height: 16 }} /> Create Announcement</>
                }
              </button>

            </div>
          </form>

        </div>
      </div>
    </>
  )
}

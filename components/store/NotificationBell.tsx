'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Bell, Package, CheckCircle, Truck,
  XCircle, ShoppingBag, X, ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'

/* ── Notification type config — updated to site palette (purple/violet) ── */
const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; dot: string }> = {
  order_placed:          { icon: ShoppingBag, color: '#6D28D9',  bg: 'rgba(109,40,217,0.12)',   dot: '#6D28D9'  },
  confirmed:             { icon: CheckCircle, color: '#6D28D9',  bg: 'rgba(109,40,217,0.12)',   dot: '#6D28D9'  },
  shipped:               { icon: Truck,       color: '#6D28D9',  bg: 'rgba(109,40,217,0.12)',   dot: '#6D28D9'  },
  delivered:             { icon: Package,     color: '#6D28D9',  bg: 'rgba(109,40,217,0.12)',   dot: '#6D28D9'  },
  cancelled_by_seller:   { icon: XCircle,     color: '#991B1B',  bg: 'rgba(153,27,27,0.12)',    dot: '#991B1B'  },
  cancelled_by_customer: { icon: XCircle,     color: '#92400E',  bg: 'rgba(146,64,14,0.12)',    dot: '#92400E'  },
  order:                 { icon: ShoppingBag, color: '#6D28D9',  bg: 'rgba(109,40,217,0.12)',   dot: '#6D28D9'  },
}

const POLL_MS = 4000

export default function NotificationBell() {
  const router                    = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const {
    notifications, unread,
    setNotifications, addNotification, markAllRead,
  } = useNotificationStore()

  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)

  const panelRef    = useRef<HTMLDivElement>(null)
  const pollRef     = useRef<NodeJS.Timeout | null>(null)
  const knownIdsRef = useRef<Set<string>>(new Set())

  /* ── all logic completely unchanged ── */
  const fetchOnce = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res  = await api.get('/api/store/notifications')
      const list = res.data.notifications ?? []
      const unreadCount = res.data.unread ?? 0
      setNotifications(list, unreadCount)
      list.forEach((n: any) => knownIdsRef.current.add(n.id))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  const silentPoll = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res   = await api.get('/api/store/notifications')
      const fresh = res.data.notifications ?? []
      const newOnes = fresh.filter((n: any) => !knownIdsRef.current.has(n.id))
      if (newOnes.length > 0) {
        newOnes.forEach((n: any) => {
          knownIdsRef.current.add(n.id)
          addNotification(n)
        })
      }
    } catch { /* silent */ }
  }, [isAuthenticated, addNotification])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    fetchOnce()
    pollRef.current = setInterval(silentPoll, POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) silentPoll()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [isAuthenticated, silentPoll])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      try {
        await api.put('/api/store/notifications/read')
        markAllRead()
      } catch { /* silent */ }
    }
  }

  // const handleClick = (notif: any) => {
  //   setOpen(false)
  //   if (notif.order_id) router.push(`/orders/${notif.order_id}`)
  // }

  if (!isAuthenticated) return null

  return (
    <>
      <style>{styles}</style>

      <div className="nb-root relative" ref={panelRef}>

        {/* ── Bell button ── */}
        <button
          onClick={handleOpen}
          className={cn(
            'nb-bell relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
            open
              ? 'bg-[#7C3AED]/50 border border-[#7C3AED]/50 text-white'
              : 'bg-white/10 border border-[#C4B5FD]/30 text-[#6D28D9] hover:border-[#7C3AED]/55 hover:text-[#6D28D9]'
          )}
        >
          <Bell className={cn('w-4 h-4 transition-transform duration-300', open && 'nb-bell-active')} />

          {/* Unread badge */}
          {unread > 0 && (
            <span className="nb-badge absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
              bg-red-500 text-white text-[10px] font-black rounded-full
              flex items-center justify-center leading-none border border-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* ── Dropdown panel ── */}
        {open && (
          <div className="nb-panel absolute right-0 top-full mt-2.5 w-[340px] sm:w-80 md:w-96 z-50 overflow-hidden">

            {/* Header */}
            <div className="nb-header flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                {/* Icon tile */}
                <div className="nb-icon-tile">
                  <Bell className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
                </div>
                <p className="text-[#1e1b4b] font-bold text-sm">Notifications</p>
                {unread > 0 && (
                  <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#7C3AED',
                    }}>
                    {unread} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="nb-close-btn w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="nb-divider" />

            {/* Body */}
            <div className="nb-scroll max-h-[420px] overflow-y-auto">

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="nb-spinner" />
                  <span className="text-xs font-medium" style={{ color: 'rgba(124,58,237,0.35)' }}>
                    Loading…
                  </span>
                </div>
              )}

              {/* Empty */}
              {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
                  <div className="nb-empty-icon">
                    <Bell className="w-6 h-6" style={{ color: '#EDE9FE' }} />
                  </div>
                  <p className="text-[#1e1b4b] font-semibold text-sm">No notifications yet</p>
                  <p className="text-center text-xs leading-relaxed"
                    style={{ color: 'rgba(124,58,237,0.45)' }}>
                    You'll see order updates here as they happen
                  </p>
                </div>
              )}

              {/* Notification items — show only latest 10 */}
              {!loading && notifications.slice(0, 10).map((notif, idx) => {
                const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.order
                const Icon = cfg.icon
                const isUnread = !notif.is_read

                return (
                  <div
                    key={notif.id}
                    // onClick={() => handleClick(notif)}
                    className="nb-notif-row"
                    style={{
                      background: isUnread ? 'rgba(124,58,237,0.08)' : 'transparent',
                      animationDelay: `${idx * 40}ms`,
                    }}
                  >
                    {/* Unread left-border accent */}
                    {isUnread && (
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                        style={{ background: cfg.dot }} />
                    )}

                    {/* Icon */}
                    <div className="nb-notif-icon shrink-0 mt-0.5"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-tight truncate"
                          style={{ color: isUnread ? '#4C1D95' : '#6D28D9' }}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="shrink-0 mt-1 w-2 h-2 rounded-full"
                            style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }} />
                        )}
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
                        style={{ color: '#5B21B6' }}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] mt-1.5 font-medium"
                        style={{ color: '#7C3AED' }}>
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            {/* {notifications.length > 0 && (
              <>
                <div className="nb-divider" />
                <div className="px-4 py-3 flex items-center justify-center">
                  <button
                    onClick={() => { setOpen(false); router.push('/orders') }}
                    className="nb-footer-btn flex items-center gap-1.5 text-xs font-bold transition-all"
                  >
                    View all orders
                    <ArrowRight className="w-3.5 h-3.5 nb-arrow" />
                  </button>
                </div>
              </>
            )} */}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Shared styles ───────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap');

  .nb-root * { box-sizing: border-box; }
  .nb-root, .nb-root button { cursor: pointer !important; }
  .nb-root { font-family: 'Open Sans', sans-serif; }

  /* ── bell ring animation on unread ── */
  @keyframes nbRing {
    0%, 100% { transform: rotate(0deg); }
    15%       { transform: rotate(14deg); }
    30%       { transform: rotate(-12deg); }
    45%       { transform: rotate(10deg); }
    60%       { transform: rotate(-8deg); }
    75%       { transform: rotate(4deg); }
  }
  .nb-bell-active { animation: nbRing 0.55s ease; }

  /* ── badge pop ── */
  @keyframes nbBadgePop {
    0%   { transform: scale(0); opacity: 0; }
    70%  { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  .nb-badge { animation: nbBadgePop 0.25s cubic-bezier(.22,1,.36,1) both; }

  /* ── panel drop in ── */
  @keyframes nbDropIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)     scale(1);    }
  }
  .nb-panel {
    animation: nbDropIn 0.2s cubic-bezier(.22,1,.36,1) both;
    background: linear-gradient(145deg, rgba(250,245,255,0.98), rgba(237,233,254,1));
    border: 1px solid rgba(196,181,253,0.35);
    border-radius: 20px;
    box-shadow: 0 24px 56px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.08);
    backdrop-filter: blur(20px);
  }

  /* ── header ── */
  .nb-header {
    background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
  }

  /* ── icon tile ── */
  .nb-icon-tile {
    width: 26px; height: 26px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: linear-gradient(135deg, #EDE9FE, #F3EEFF);
    border: 1px solid rgba(124,58,237,0.35);
  }

  /* ── close btn ── */
  .nb-close-btn {
    background: rgba(124,58,237,0.10);
    border: 1px solid rgba(124,58,237,0.2);
    color: rgba(124,58,237,0.45);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .nb-close-btn:hover {
    background: rgba(124,58,237,0.15);
    color: #7C3AED;
  }

  /* ── gradient divider ── */
  .nb-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent);
  }

  /* ── custom scrollbar ── */
  .nb-scroll { scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.3) transparent; }
  .nb-scroll::-webkit-scrollbar { width: 4px; }
  .nb-scroll::-webkit-scrollbar-track { background: transparent; }
  .nb-scroll::-webkit-scrollbar-thumb {
    background: rgba(124,58,237,0.3); border-radius: 99px;
  }

  /* ── spinner ── */
  .nb-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 2px solid rgba(124,58,237,0.15);
    border-top-color: #7C3AED;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── empty icon ── */
  .nb-empty-icon {
    width: 52px; height: 52px; border-radius: 16px; margin-bottom: 6px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.2);
  }

  /* ── notification row ── */
  @keyframes nbRowIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .nb-notif-row {
    position: relative;
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(124,58,237,0.1);
    transition: background 0.15s ease;
    animation: nbRowIn 0.28s cubic-bezier(.22,1,.36,1) both;
    cursor: default;
  }
  .nb-notif-row:last-child { border-bottom: none; }
  .nb-notif-row:hover { background: rgba(124,58,237,0.08) !important; }

  /* ── notif icon circle ── */
  .nb-notif-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* ── footer btn ── */
  .nb-footer-btn {
    color: #7C3AED;
    transition: color 0.15s ease;
  }
  .nb-footer-btn:hover { color: #6D28D9; }
  .nb-footer-btn:hover .nb-arrow { transform: translateX(3px); }
  .nb-arrow { transition: transform 0.2s ease; }

  /* ── Responsive adjustments ── */
  @media (max-width: 640px) {
    .nb-panel {
      width: 320px !important;
      max-width: calc(100vw - 16px);
    }
    .nb-scroll {
      max-height: 360px !important;
    }
  }

  @media (max-width: 480px) {
    .nb-panel {
      width: 300px !important;
      max-width: calc(100vw - 12px);
      border-radius: 16px;
    }
    .nb-header {
      padding: 12px 14px !important;
    }
    .nb-notif-row {
      padding: 10px 12px !important;
      gap: 10px !important;
    }
    .nb-notif-icon {
      width: 30px !important;
      height: 30px !important;
    }
  }
`
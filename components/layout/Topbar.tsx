'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ShoppingCart, Heart, LogOut,
  User, LayoutDashboard, Shield,
  TrendingUp, ShoppingBag, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { authService } from '@/lib/services/auth.service'
import NotificationBell from '@/components/store/NotificationBell'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export default function Topbar() {
  const router = useRouter()
  const { user, role, isAuthenticated, clearAuth } = useAuthStore()
  const { count: cartCount }     = useCartStore()
  const { count: wishlistCount } = useWishlistStore()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled,     setScrolled]     = useState(false)

  const isAdmin    = ADMIN_ROLES.includes(role ?? '')
  const isRetailer = role === 'business_owner'
  const isCustomer = !isAdmin && !isRetailer

  /* scroll-aware background — same approach as before, just adds depth */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      clearAuth()
      toast.success('Logged out successfully')
      router.push('/')
    } catch {
      toast.error('Failed to logout')
    }
  }

  /* avatar initials helper */
  const initials = user?.full_name
    ? user.full_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  /* role label */
  const roleLabel = isAdmin
    ? (role?.replace(/_/g, ' ') ?? 'Admin')
    : isRetailer
      ? 'Retailer'
      : 'Customer'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .tb-root * { box-sizing: border-box; }
        .tb-root, .tb-root a, .tb-root button { cursor: pointer !important; }
        .tb-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* badge pop */
        @keyframes badgePop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .badge-pop { animation: badgePop 0.25s cubic-bezier(.22,1,.36,1) both; }

        /* dropdown */
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .drop-in { animation: dropIn 0.18s cubic-bezier(.22,1,.36,1) both; }

        /* icon button hover ring */
        .tb-icon-btn {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 10px;
          transition: background 0.18s ease, color 0.18s ease;
          color: rgba(176,228,204,0.55);
        }
        .tb-icon-btn:hover {
          background: rgba(40,90,72,0.35);
          color: #B0E4CC;
        }

        /* shimmer on logo */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .logo-shimmer {
          background: linear-gradient(90deg, #B0E4CC 20%, #408A71 45%, #B0E4CC 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* avatar ring pulse when menu open */
        .avatar-ring-open {
          box-shadow: 0 0 0 2px #408A71, 0 0 12px rgba(64,138,113,0.35);
        }
      `}</style>

      <header className={cn(
        'tb-root fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#091413]/95 backdrop-blur-xl border-b border-[#285A48]/35 shadow-xl shadow-[#091413]/50'
          : 'bg-[#091413]/80 backdrop-blur-md border-b border-[#285A48]/20'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

          {/* ── Logo ────────────────────────────────────── */}
          <Link href="/" className="shrink-0">
            <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl font-bold tracking-tight">
              <span className="text-white">Vendo</span>
              <span className="logo-shimmer">Sphere</span>
            </h1>
          </Link>

          {/* ── Spacer ──────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── Right cluster ───────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Cart */}
            <Link href="/cart">
              <div className="tb-icon-btn relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="badge-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#408A71] text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none border border-[#091413]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/wishlist">
                <div className="tb-icon-btn relative">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="badge-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none border border-[#091413]">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Notification Bell — your existing component, just wrapped */}
            <div className="tb-icon-btn !w-auto !h-auto !bg-transparent !rounded-none p-0">
              <NotificationBell />
            </div>

            {/* ── NOT logged in ────────────────────────── */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login">
                  <button className="px-4 py-2 text-[#B0E4CC]/65 hover:text-[#B0E4CC] text-sm font-semibold transition-colors rounded-xl hover:bg-[#285A48]/25">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-[#408A71] hover:bg-[#4eaa85] text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#285A48]/30 hover:scale-[1.03]">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* ── Logged in — user menu ────────────────── */}
            {isAuthenticated && (
              <div className="relative ml-1">

                {/* Avatar trigger */}
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className={cn(
                    'flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all duration-200',
                    'border hover:bg-[#285A48]/30',
                    userMenuOpen
                      ? 'bg-[#285A48]/30 border-[#408A71]/50'
                      : 'bg-[#285A48]/15 border-[#285A48]/30 hover:border-[#408A71]/40'
                  )}
                >
                  {/* Avatar circle */}
                  <div className={cn(
                    'w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center',
                    'bg-gradient-to-br from-[#408A71] to-[#285A48] text-white text-xs font-black',
                    'transition-all duration-200',
                    userMenuOpen && 'avatar-ring-open'
                  )}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name ?? 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* Name — hidden on small screens */}
                  <span className="hidden sm:block text-[#B0E4CC]/80 text-xs font-semibold max-w-[80px] truncate">
                    {user?.full_name?.split(' ')[0] ?? 'Account'}
                  </span>

                  <ChevronDown className={cn(
                    'w-3 h-3 text-[#408A71] transition-transform duration-200 shrink-0',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>

                {/* Backdrop */}
                {userMenuOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                )}

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="drop-in absolute right-0 top-full mt-2.5 w-56 z-20
                    bg-[#0d1c19] border border-[#285A48]/40 rounded-2xl shadow-2xl shadow-[#091413]/80 overflow-hidden">

                    {/* User info header */}
                    <div className="px-4 py-3.5 border-b border-[#285A48]/30"
                      style={{ background: 'linear-gradient(135deg, #162420 0%, #0d1c19 100%)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center
                          bg-gradient-to-br from-[#408A71] to-[#285A48] text-white text-sm font-black">
                          {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-bold truncate leading-tight">{user?.full_name}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#285A48]/50 border border-[#408A71]/25 text-[#B0E4CC]/60 text-[9px] font-black uppercase tracking-widest capitalize">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5 space-y-0.5">

                      <MenuItem
                        href="/profile"
                        icon={<User className="w-4 h-4" style={{ color: '#408A71' }} />}
                        label="My Profile"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      <MenuItem
                        href="/orders"
                        icon={<ShoppingBag className="w-4 h-4" style={{ color: '#B0E4CC' }} />}
                        label="Order History"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      {isAdmin && (
                        <MenuItem
                          href="/admin/dashboard"
                          icon={<Shield className="w-4 h-4 text-red-400" />}
                          label="Admin Panel"
                          onClick={() => setUserMenuOpen(false)}
                        />
                      )}

                      {isRetailer && (
                        <MenuItem
                          href="/dashboard"
                          icon={<LayoutDashboard className="w-4 h-4" style={{ color: '#408A71' }} />}
                          label="Dashboard"
                          onClick={() => setUserMenuOpen(false)}
                        />
                      )}

                      {isCustomer && isAuthenticated && (
                        <MenuItem
                          href="/request-seller"
                          icon={<TrendingUp className="w-4 h-4" style={{ color: '#B0E4CC' }} />}
                          label="Request to Seller"
                          onClick={() => setUserMenuOpen(false)}
                        />
                      )}

                      {/* Logout */}
                      <div className="border-t border-[#285A48]/25 mt-1 pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout() }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all duration-150"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Logout
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

/* ── Reusable dropdown menu item ─────────────────────────── */
function MenuItem({
  href, icon, label, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <Link href={href} onClick={onClick}>
      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#B0E4CC]/65 hover:text-[#B0E4CC] hover:bg-[#285A48]/30 text-sm font-semibold transition-all duration-150">
        <span className="shrink-0">{icon}</span>
        {label}
      </button>
    </Link>
  )
}
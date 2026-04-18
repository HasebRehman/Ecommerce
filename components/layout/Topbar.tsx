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

  /* Close menu on scroll or any click outside */
  useEffect(() => {
    if (!userMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Close if clicking outside the menu and not on the trigger button
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    const handleScroll = () => {
      setUserMenuOpen(false)
    }

    document.addEventListener('click', handleClickOutside, true)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [userMenuOpen])

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
        .tb-root { font-family: 'Inter', sans-serif; }

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
          color: rgba(107,114,128,0.8);
        }
        .tb-icon-btn:hover {
          background: rgba(124,58,237,0.10);
          color: #7C3AED;
        }

        /* shimmer on logo */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .logo-shimmer {
          background: linear-gradient(90deg, #C4B5FD 20%, #7C3AED 45%, #C4B5FD 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* avatar ring pulse when menu open */
        .avatar-ring-open {
          box-shadow: 0 0 0 2px #7C3AED, 0 0 12px rgba(124,58,237,0.35);
        }
      `}</style>

      <header className={cn(
        'tb-root fixed top-0 left-0 right-0 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-[#7C3AED]/35 shadow-lg shadow-[#7C3AED]/8'
          : 'bg-white/85 backdrop-blur-md border-b border-[#7C3AED]/20'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

          {/* ── Logo ────────────────────────────────────── */}
          <Link href="/" className="shrink-0 flex items-center">
            <img
              src="/logo.png"
              alt="VendoSphere"
              className="h-8 sm:h-10 w-auto object-contain"
              style={{ maxWidth: '160px' }}
            />
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
                  <span className="badge-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#7C3AED] text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none border border-white">
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
                    <span className="badge-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none border border-white">
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
                  <button className="px-4 py-2 text-[#6b7280] hover:text-[#7C3AED] text-sm font-semibold transition-colors rounded-xl hover:bg-[#7C3AED]/25">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#7C3AED]/30 hover:scale-[1.03]">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* ── Logged in — user menu ────────────────── */}
            {isAuthenticated && (
              <div className="relative ml-1 user-menu-container">

                {/* Avatar trigger */}
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className={cn(
                    'flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all duration-200',
                    'border hover:bg-[#EDE9FE]',
                    userMenuOpen
                      ? 'bg-[#EDE9FE] border-[#7C3AED]/40'
                      : 'bg-[#FAF5FF] border-[#C4B5FD]/30 hover:border-[#7C3AED]/30'
                  )}
                >
                  {/* Avatar circle */}
                  <div className={cn(
                    'w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center',
                    'bg-gradient-to-br from-[#7C3AED] to-[#7C3AED] text-white text-xs font-black',
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
                  <span className="hidden sm:block text-[#4b5563] text-xs font-semibold max-w-[80px] truncate">
                    {user?.full_name?.split(' ')[0] ?? 'Account'}
                  </span>

                  <ChevronDown className={cn(
                    'w-3 h-3 text-[#7C3AED] transition-transform duration-200 shrink-0',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>

                {/* Backdrop — closes menu when clicked anywhere outside */}
                {userMenuOpen && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setUserMenuOpen(false)
                    }}
                    style={{ background: 'transparent', pointerEvents: 'auto' }}
                  />
                )}

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="drop-in absolute right-0 top-full mt-2.5 w-56 z-50
                    bg-white border border-[#C4B5FD]/40 rounded-2xl shadow-2xl shadow-[#7C3AED]/12 overflow-hidden">

                    {/* User info header */}
                    <div className="px-4 py-3.5 border-b border-[#C4B5FD]/30"
                      style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FAF5FF 100%)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center
                          bg-gradient-to-br from-[#7C3AED] to-[#7C3AED] text-white text-sm font-black">
                          {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#1e1b4b] text-sm font-bold truncate leading-tight">{user?.full_name}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#EDE9FE] border border-[#C4B5FD]/40 text-[#7C3AED] text-[9px] font-black uppercase tracking-widest capitalize">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5 space-y-0.5">

                      <MenuItem
                        href="/profile"
                        icon={<User className="w-4 h-4" style={{ color: '#7C3AED' }} />}
                        label="My Profile"
                        onClick={() => setUserMenuOpen(false)}
                      />

                      <MenuItem
                        href="/orders"
                        icon={<ShoppingBag className="w-4 h-4" style={{ color: '#7C3AED' }} />}
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
                          icon={<LayoutDashboard className="w-4 h-4" style={{ color: '#7C3AED' }} />}
                          label="Dashboard"
                          onClick={() => setUserMenuOpen(false)}
                        />
                      )}

                      {isCustomer && isAuthenticated && (
                        <MenuItem
                          href="/request-seller"
                          icon={<TrendingUp className="w-4 h-4" style={{ color: '#7C3AED' }} />}
                          label="Request to Seller"
                          onClick={() => setUserMenuOpen(false)}
                        />
                      )}

                      {/* Logout */}
                      <div className="border-t border-[#7C3AED]/25 mt-1 pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout() }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500/80 hover:text-red-500 hover:bg-red-50 text-sm font-semibold transition-all duration-150"
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
      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#6b7280] hover:text-[#7C3AED] hover:bg-[#EDE9FE] text-sm font-semibold transition-all duration-150">
        <span className="shrink-0">{icon}</span>
        {label}
      </button>
    </Link>
  )
}



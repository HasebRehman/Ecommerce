'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ShoppingCart, Heart, LogOut,
  User, LayoutDashboard, Shield,
  TrendingUp, Search, Bell,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { authService } from '@/lib/services/auth.service'
import { ShoppingBag } from 'lucide-react'
import NotificationBell from '@/components/store/NotificationBell'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export default function Topbar() {
  const router = useRouter()
  const { user, role, isAuthenticated, clearAuth } = useAuthStore()
  const { count: cartCount }     = useCartStore()
  const { count: wishlistCount } = useWishlistStore()

  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isAdmin    = ADMIN_ROLES.includes(role ?? '')
  const isRetailer = role === 'business_owner'
  const isCustomer = !isAdmin && !isRetailer

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <h1 className="text-xl font-bold text-white">
            Vendo<span className="text-blue-400">Sphere</span>
          </h1>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Cart */}
          <Link href="/cart">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </Link>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link href="/wishlist">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>
            </Link>
          )}

          {/* ── Notification Bell ── */}
          <NotificationBell />

          {/* NOT logged in */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="px-4 py-2 text-slate-300 hover:text-white text-sm transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors font-medium">
                  Sign Up
                </button>
              </Link>
            </div>
          )}

          {/* Logged in — user menu */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(p => !p)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name ?? 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                  )}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">

                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
                      <p className="text-slate-400 text-xs capitalize mt-0.5">
                        {isAdmin ? role?.replace(/_/g, ' ') : isRetailer ? 'Retailer' : 'Customer'}
                      </p>
                    </div>

                    <div className="p-1.5 space-y-0.5">

                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                        <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors">
                          <User className="w-4 h-4 text-blue-400" />
                          My Profile
                        </button>
                      </Link>

                      <Link href="/orders" onClick={() => setUserMenuOpen(false)}>
                        <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors">
                          <ShoppingBag className="w-4 h-4 text-purple-400" />
                          Order History
                        </button>
                      </Link>

                      {isAdmin && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors">
                            <Shield className="w-4 h-4 text-red-400" />
                            Admin Panel
                          </button>
                        </Link>
                      )}

                      {isRetailer && (
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-blue-400" />
                            Dashboard
                          </button>
                        </Link>
                      )}

                      {isCustomer && isAuthenticated && (
                        <Link href="/request-seller" onClick={() => setUserMenuOpen(false)}>
                          <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-sm transition-colors">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            Request to Seller
                          </button>
                        </Link>
                      )}

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout() }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 text-sm transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  )
}
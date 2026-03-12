'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Tag, Store,
  ShoppingBag, Loader2, Zap,
} from 'lucide-react'
import { storeService } from '@/lib/services/store.service'
import { categoryService } from '@/lib/services/category.service'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import { authService } from '@/lib/services/auth.service'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

// ── Section Header ──────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  href,
  linkLabel = 'View All',
}: {
  icon:       React.ElementType
  iconColor:  string
  title:      string
  subtitle?:  string
  href:        string
  linkLabel?:  string
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            iconColor
          )}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-slate-400 text-sm pl-10">{subtitle}</p>
        )}
      </div>
      <Link href={href}>
        <button className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors group">
          {linkLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </Link>
    </div>
  )
}

// ── Product Row (2 rows = 10 items) ─────────────────────────
function ProductRow({
  products,
  onQuickBuy,
  loading,
}: {
  products:   any[]
  onQuickBuy: (p: any) => void
  loading:    boolean
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-slate-800" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(product => (
        <StoreProductCard
          key={product.id}
          product={product}
          onQuickBuy={onQuickBuy}
        />
      ))}
    </div>
  )
}

// ── Shop Card ────────────────────────────────────────────────
function ShopCard({ shop }: { shop: any }) {
  return (
    <Link href={`/shop/${shop.id}`}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all group cursor-pointer">

        {/* Banner / preview grid */}
        <div className="relative h-28 bg-slate-800 overflow-hidden">
          {shop.banner_url ? (
            <img
              src={shop.banner_url}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : shop.preview_images?.length > 0 ? (
            <div className="grid grid-cols-2 h-full">
              {shop.preview_images.slice(0, 4).map((img: string, i: number) => (
                <div key={i} className="overflow-hidden bg-slate-700">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-10 h-10 text-slate-600" />
            </div>
          )}

          {/* Live badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>

        {/* Shop info */}
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 -mt-7 relative z-10">
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white font-semibold text-sm truncate">
              {shop.name}
            </p>
            <p className="text-slate-500 text-xs">
              {shop.product_count} products
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
        </div>

      </div>
    </Link>
  )
}

// ── Main Landing Page ────────────────────────────────────────
export default function LandingPage() {
  const [featured,    setFeatured]    = useState<any[]>([])
  const [discounted,  setDiscounted]  = useState<any[]>([])
  const [topShops,    setTopShops]    = useState<any[]>([])
  const [categories,  setCategories]  = useState<any[]>([])
  const [quickBuy,    setQuickBuy]    = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('');

  const [loadingFeatured,   setLoadingFeatured]   = useState(true)
  const [loadingDiscounted, setLoadingDiscounted] = useState(true)
  const [loadingShops,      setLoadingShops]      = useState(true)

  useEffect(() => {
    storeService.getFeaturedProducts()
      .then(d => setFeatured(d.products ?? []))
      .finally(() => setLoadingFeatured(false))

    storeService.getDiscountedProducts()
      .then(d => setDiscounted(d.products ?? []))
      .finally(() => setLoadingDiscounted(false))

    storeService.getTopShops()
      .then(d => setTopShops(d.shops ?? []))
      .finally(() => setLoadingShops(false))

    categoryService.getCategories()
      .then(d => setCategories(d.categories ?? []))
  }, [])

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Only fetch user data if logged in
    if (!isAuthenticated) return
    
    const getUserData = async () => {
      try {
        const userData = await authService.getMe()
        if (!userData) return
        setUserRole(userData?.role);
      } catch {
        // silently fail
      }
    }

    getUserData()
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8 md:p-14">

          {/* Content */}
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-xs font-medium mb-4">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Pakistan's Growing Marketplace
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Shop Everything<br />
              <span className="text-blue-200">You Love</span>
            </h1>
            <p className="text-blue-200/80 mt-3 text-base md:text-lg max-w-md">
              Discover products from local retailers — clothing, pets, electronics and more.
            </p>
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <Link href="/products">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                  Shop Now
                </button>
              </Link>
              {
                isAuthenticated ? 
                  <Link href={userRole && userRole === "customer" ? "/request-seller" : "/dashboard"}   >
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                      {userRole && userRole === "customer" || "" ? "Become A Seller" : "Start Selling"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link> : 

                  <Link href="/request-seller">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                      Become A Seller
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
              }
              
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex items-center gap-6 mt-8 flex-wrap">
            {[
              { label: 'Products',  value: `${featured.length + discounted.length}+` },
              { label: 'Live Shops', value: `${topShops.length}+` },
              { label: 'Categories', value: `${categories.length}+` },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-blue-200/70 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Decorative */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 right-32 w-48 h-48 bg-blue-400/10 rounded-full translate-y-1/2 pointer-events-none" />
        </div>
      </section>

      {/* ── Category Pills ────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/products">
              <span className="shrink-0 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full cursor-pointer">
                All
              </span>
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <span className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-full cursor-pointer transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader
          icon={ShoppingBag}
          iconColor="bg-blue-500"
          title="Featured Products"
          subtitle="Hand-picked products from our top retailers"
          href="/products"
        />
        {!loadingFeatured && featured.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No products available yet</p>
          </div>
        ) : (
          <ProductRow
            products={featured.slice(0, 10)}
            onQuickBuy={setQuickBuy}
            loading={loadingFeatured}
          />
        )}

        {featured.length > 0 && (
          <div className="flex justify-center mt-6">
            <Link href="/products">
              <button className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700 hover:border-slate-600">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* ── Top Discount Products ─────────────────────────── */}
      {(loadingDiscounted || discounted.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">

          {/* Section bg highlight */}
          <div className="relative rounded-2xl bg-gradient-to-r from-red-950/40 to-orange-950/30 border border-red-900/20 p-6 md:p-8">

            <SectionHeader
              icon={Tag}
              iconColor="bg-red-500"
              title="Top Discount Products"
              subtitle="Biggest savings from our retailers — limited time offers"
              href="/products?sort=discount"
              linkLabel="See All Deals"
            />

            {!loadingDiscounted && discounted.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No discounted products yet</p>
              </div>
            ) : (
              <ProductRow
                products={discounted.slice(0, 10)}
                onQuickBuy={setQuickBuy}
                loading={loadingDiscounted}
              />
            )}
          </div>
        </section>
      )}

      {/* ── Top Shops ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader
          icon={Store}
          iconColor="bg-purple-500"
          title="Top Shops"
          subtitle="Explore our most popular live stores"
          href="/shops"
          linkLabel="Browse All Shops"
        />

        {loadingShops ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-28 bg-slate-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : topShops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No live shops yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topShops.slice(0, 8).map(shop => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-white mb-3">
                Vendo<span className="text-blue-400">Sphere</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pakistan's growing multi-retailer marketplace. Shop from local sellers or start your own store.
              </p>
              <div className="flex items-center gap-3 mt-4">
                {['FB', 'IG', 'TW', 'YT'].map(s => (
                  <div
                    key={s}
                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold hover:bg-slate-700 hover:text-white cursor-pointer transition-colors"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-white font-semibold mb-4">Shop</h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'All Products', href: '/products' },
                  { label: 'Top Deals',    href: '/products?sort=discount' },
                  { label: 'New Arrivals', href: '/products?sort=new' },
                  { label: 'All Shops',    href: '/shops' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <span className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sell */}
            <div>
              <h3 className="text-white font-semibold mb-4">Sell</h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Become a Seller', href: '/request-seller' },
                  { label: 'Seller Dashboard', href: '/dashboard' },
                  { label: 'Manage Inventory', href: '/dashboard/inventory' },
                  { label: 'My Shops',          href: '/dashboard/shops' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <span className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-white font-semibold mb-4">Account</h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Login',       href: '/login' },
                  { label: 'Sign Up',     href: '/signup' },
                  { label: 'My Account',  href: '/account' },
                  { label: 'My Orders',   href: '/account/orders' },
                  { label: 'Wishlist',    href: '/wishlist' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <span className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 mt-10 pt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} VendoSphere. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
                <span
                  key={item}
                  className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>

      {/* Quick Buy Modal */}
      {quickBuy && (
        <QuickBuyModal
          product={quickBuy}
          onClose={() => setQuickBuy(null)}
          onSuccess={() => setQuickBuy(null)}
        />
      )}

    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Tag, Store,
  ShoppingBag, Zap, Heart,
  Search, User, Menu, X,
  BadgePercent, Package,
  Star, ChevronRight,
  Award, Shield,
  Truck, RotateCcw, Headphones,
} from 'lucide-react'
import { storeService } from '@/lib/services/store.service'
import { categoryService } from '@/lib/services/category.service'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import { authService } from '@/lib/services/auth.service'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

/* ═══════════════════════════════════════════════════════
   COLOR SYSTEM
   #091413  deep   → page background (darkest)
   #285A48  forest → surfaces / cards / borders
   #408A71  accent → CTAs, icons, highlights
   #B0E4CC  mint   → headings, text accents, shimmer
═══════════════════════════════════════════════════════ */

/* ── Animated counter ──────────────────────────────── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let cur = 0
    const step = target / 50
    const t = setInterval(() => {
      cur += step
      if (cur >= target) { cur = target; clearInterval(t) }
      setVal(Math.floor(cur))
    }, 20)
    return () => clearInterval(t)
  }, [target])
  return <>{val}{suffix}</>
}

/* ── Section Header ────────────────────────────────── */
function SectionHeader({
  eyebrow, title, subtitle, href, linkLabel = 'View All',
}: {
  eyebrow: string; title: string; subtitle?: string
  href: string; linkLabel?: string
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[#408A71] mb-2 px-3 py-1 rounded-full border border-[#408A71]/30 bg-[#408A71]/10">
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-1 text-[#B0E4CC]/45">{subtitle}</p>
        )}
      </div>
      <Link href={href} className="shrink-0 mt-1">
        <button className="group flex items-center gap-1.5 text-[#408A71] hover:text-[#B0E4CC] text-sm font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap">
          {linkLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </Link>
    </div>
  )
}

/* ── Product Skeleton ──────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#0e1e1b] border border-[#285A48]/20 animate-pulse">
      <div className="aspect-square bg-[#1a2e2a]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#1a2e2a] rounded-full w-3/4" />
        <div className="h-3 bg-[#1a2e2a] rounded-full w-1/2" />
        <div className="h-8 bg-[#1a2e2a] rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

/* ── Product Grid ──────────────────────────────────── */
function ProductRow({ products, onQuickBuy, loading }: {
  products: any[]; onQuickBuy: (p: any) => void; loading: boolean
}) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  )
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="opacity-0 animate-slideUp"
          style={{ animationDelay: `${i * 55}ms`, animationFillMode: 'forwards' }}
        >
          <StoreProductCard product={product} onQuickBuy={onQuickBuy} />
        </div>
      ))}
    </div>
  )
}

/* ── Shop Card ─────────────────────────────────────── */
function ShopCard({ shop, index }: { shop: any; index: number }) {
  return (
    <Link href={`/shop/${shop.id}`}>
      <div
        className="group relative bg-[#0e1e1b] border border-[#285A48]/30 rounded-2xl overflow-hidden
          hover:border-[#408A71]/50 hover:shadow-2xl hover:shadow-[#091413]/60 hover:-translate-y-1
          transition-all duration-300 cursor-pointer opacity-0 animate-slideUp"
        style={{ animationDelay: `${index * 70}ms`, animationFillMode: 'forwards' }}
      >
        {/* Banner */}
        <div className="relative h-32 bg-[#1a2e2a] overflow-hidden">
          {shop.banner_url ? (
            <img src={shop.banner_url} alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : shop.preview_images?.length > 0 ? (
            <div className={cn('h-full gap-px', shop.preview_images.length >= 4 ? 'grid grid-cols-2' : 'flex')}>
              {shop.preview_images.slice(0, 4).map((img: string, i: number) => (
                <div key={i} className="overflow-hidden flex-1">
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-10 h-10 text-[#285A48]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1e1b]/70 via-transparent to-transparent" />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-[#091413]/70 backdrop-blur-sm border border-[#408A71]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B0E4CC] animate-pulse" />
            <span className="text-[#B0E4CC] text-[10px] font-black tracking-widest uppercase">Live</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1a2e2a] border border-[#408A71]/30 overflow-hidden shrink-0 -mt-8 relative z-10 shadow-xl">
            {shop.logo_url
              ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Store className="w-5 h-5 text-[#408A71]" /></div>
            }
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white font-bold text-sm truncate group-hover:text-[#B0E4CC] transition-colors">{shop.name}</p>
            <p className="text-[#408A71] text-xs font-semibold">{shop.product_count} products</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#285A48]/20 flex items-center justify-center shrink-0 group-hover:bg-[#408A71]/30 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-[#408A71] group-hover:text-[#B0E4CC] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [featured,    setFeatured]    = useState<any[]>([])
  const [discounted,  setDiscounted]  = useState<any[]>([])
  const [topShops,    setTopShops]    = useState<any[]>([])
  const [categories,  setCategories]  = useState<any[]>([])
  const [quickBuy,    setQuickBuy]    = useState<any>(null)
  const [userRole,    setUserRole]    = useState<string>('')
  const [mobileMenu,  setMobileMenu]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  const [loadingFeatured,   setLoadingFeatured]   = useState(true)
  const [loadingDiscounted, setLoadingDiscounted] = useState(true)
  const [loadingShops,      setLoadingShops]      = useState(true)

  const { isAuthenticated } = useAuthStore()

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


  useEffect(() => {
    if (!isAuthenticated) return
    authService.getMe()
      .then(u => { if (u) setUserRole(u.role) })
      .catch(() => {})
  }, [isAuthenticated])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const totalProducts = featured.length + discounted.length

  return (
    <>
      {/* ── Global styles ──────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        a, button, [class*="cursor-pointer"], [role="button"], label { cursor: pointer !important; }

        .font-display { font-family: 'DM Serif Display', serif; }
        .font-body    { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1);   opacity: 0.6; }
          50%       { transform: scale(1.4); opacity: 0;   }
        }

        .animate-slideUp  { animation: slideUp 0.55s cubic-bezier(.22,1,.36,1) both; }
        .animate-fadeIn   { animation: fadeIn 0.4s ease both; }
        .animate-marquee  { animation: marquee 30s linear infinite; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #B0E4CC 20%, #408A71 45%, #B0E4CC 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }

        /* Hero overlay: heavy on left for text, reveals image on right */
        .hero-overlay {
          background: linear-gradient(
            100deg,
            #091413 0%,
            #091413 30%,
            rgba(9,20,19,0.88) 50%,
            rgba(9,20,19,0.35) 72%,
            rgba(9,20,19,0.05) 100%
          );
        }
        @media (max-width: 768px) {
          .hero-overlay {
            background: linear-gradient(
              to bottom,
              rgba(9,20,19,0.55) 0%,
              rgba(9,20,19,0.80) 50%,
              #091413 95%
            );
          }
        }
      `}</style>

      <div className="min-h-screen font-body" style={{ background: '#091413' }}>

        {/* ══════════════════════════════════════════════
            HERO — real image background
        ══════════════════════════════════════════════ */}
        <section className="relative min-h-[94vh] flex items-center overflow-hidden">

          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1800&auto=format&fit=crop&q=80"
            alt="Shopping hero"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Gradient overlay — left-heavy so text is readable, image shows on right */}
          <div className="hero-overlay absolute inset-0" />

          {/* Bottom fade into page background */}
          <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #091413)' }} />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-32 pb-24 md:pt-44 md:pb-32">
            <div className="max-w-lg">

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6
                  bg-[#285A48]/40 border border-[#408A71]/40 backdrop-blur-sm
                  opacity-0 animate-slideUp"
                style={{ animationDelay: '0ms' }}
              >
                <div className="relative w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-[#B0E4CC] animate-ping-slow" />
                  <span className="relative block w-2 h-2 rounded-full bg-[#B0E4CC]" />
                </div>
                <span className="text-[#B0E4CC] text-xs font-black tracking-[0.15em] uppercase">
                  Pakistan's Growing Marketplace
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-display leading-[1.05] mb-5 opacity-0 animate-slideUp"
                style={{ animationDelay: '80ms' }}
              >
                <span className="block text-4xl sm:text-5xl md:text-[3.75rem] text-white drop-shadow-2xl">
                  Shop Everything
                </span>
                <span className="block text-4xl sm:text-5xl md:text-[3.75rem] shimmer-text drop-shadow-2xl">
                  You Love.
                </span>
              </h1>

              <p
                className="text-[#B0E4CC]/65 text-base md:text-lg leading-relaxed mb-8 max-w-md opacity-0 animate-slideUp"
                style={{ animationDelay: '160ms' }}
              >
                Discover products from local retailers — clothing, pets, electronics and more. One marketplace, endless choice.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-wrap items-center gap-3 mb-12 opacity-0 animate-slideUp"
                style={{ animationDelay: '240ms' }}
              >
                <Link href="/products">
                  <button className="group flex items-center gap-2.5 px-7 py-3.5 bg-[#408A71] hover:bg-[#4d9e83] text-white font-black rounded-2xl transition-all duration-200 shadow-2xl shadow-[#285A48]/50 hover:scale-[1.03] cursor-pointer text-sm">
                    <ShoppingBag className="w-4 h-4" />
                    Shop Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>

                {isAuthenticated ? (
                  <Link href={userRole === 'customer' || !userRole ? '/request-seller' : '/dashboard'}>
                    <button className="flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-200 border border-white/25 backdrop-blur-sm cursor-pointer text-sm">
                      {userRole === 'customer' || !userRole ? 'Become A Seller' : 'Start Selling'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                ) : (
                  <Link href="/request-seller">
                    <button className="flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-200 border border-white/25 backdrop-blur-sm cursor-pointer text-sm">
                      Become A Seller
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                )}
              </div>

              {/* Live stats */}
              <div
                className="flex flex-wrap items-center gap-5 opacity-0 animate-slideUp"
                style={{ animationDelay: '320ms' }}
              >
                {[
                  { label: 'Products',   value: totalProducts, suffix: '+', icon: Package },
                  { label: 'Live Shops', value: topShops.length, suffix: '+', icon: Store },
                  { label: 'Categories', value: categories.length, suffix: '+', icon: Tag },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#285A48]/50 border border-[#408A71]/30 flex items-center justify-center backdrop-blur-sm">
                      <s.icon className="w-4 h-4 text-[#B0E4CC]" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-white leading-none">
                        <AnimatedNumber target={s.value} suffix={s.suffix} />
                      </p>
                      <p className="text-[#B0E4CC]/45 text-xs">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TRUST MARQUEE BAR
        ══════════════════════════════════════════════ */}
        <div
          className="border-y border-[#285A48]/30 py-3.5 overflow-hidden"
          style={{ background: '#0a1512' }}
        >
          <div className="flex items-center animate-marquee" style={{ width: 'max-content' }}>
            {[
              { icon: Truck,      label: 'Nationwide Delivery' },
              { icon: Shield,     label: 'Secure Checkout' },
              { icon: RotateCcw,  label: 'Easy Returns' },
              { icon: Headphones, label: '24/7 Support' },
              { icon: Star,       label: 'Verified Sellers' },
              { icon: Award,      label: 'Quality Guarantee' },
              { icon: Zap,        label: 'Fast Processing' },
              // Duplicate for seamless loop
              { icon: Truck,      label: 'Nationwide Delivery' },
              { icon: Shield,     label: 'Secure Checkout' },
              { icon: RotateCcw,  label: 'Easy Returns' },
              { icon: Headphones, label: '24/7 Support' },
              { icon: Star,       label: 'Verified Sellers' },
              { icon: Award,      label: 'Quality Guarantee' },
              { icon: Zap,        label: 'Fast Processing' },
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-8 text-[#B0E4CC]/45 text-sm font-semibold whitespace-nowrap">
                <item.icon className="w-3.5 h-3.5 text-[#408A71] shrink-0" />
                {item.label}
                <span className="ml-8 text-[#285A48]/60">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CATEGORY PILLS
        ══════════════════════════════════════════════ */}
        {/* {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              <Link href="/products">
                <span className="shrink-0 px-5 py-2.5 bg-[#408A71] hover:bg-[#4d9e83] text-white text-sm font-black rounded-full cursor-pointer transition-all shadow-lg shadow-[#285A48]/30 whitespace-nowrap">
                  All
                </span>
              </Link>
              {categories.map((cat, i) => (
                <Link key={cat.id} href={`/products?category=${cat.id}`}>
                  <span
                    className="shrink-0 px-5 py-2.5 bg-[#0e1e1b] hover:bg-[#285A48]/50 border border-[#285A48]/40 hover:border-[#408A71]/60
                      text-[#B0E4CC]/55 hover:text-[#B0E4CC] text-sm font-semibold rounded-full
                      cursor-pointer transition-all duration-200 whitespace-nowrap opacity-0 animate-fadeIn"
                    style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
                  >
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )} */}

        {/* ══════════════════════════════════════════════
            FEATURED PRODUCTS
        ══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionHeader
            eyebrow="Featured"
            title="Featured Products"
            subtitle="Hand-picked products from our top retailers"
            href="/products"
          />

          {!loadingFeatured && featured.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-[#285A48]/30">
              <ShoppingBag className="w-12 h-12 text-[#285A48] mx-auto mb-3" />
              <p className="text-[#B0E4CC]/30 font-semibold">No products available yet</p>
            </div>
          ) : (
            <ProductRow products={featured.slice(0, 10)} onQuickBuy={setQuickBuy} loading={loadingFeatured} />
          )}

          {featured.length > 0 && (
            <div className="flex justify-center mt-8">
              <Link href="/products">
                <button className="group flex items-center gap-2.5 px-8 py-3.5 bg-[#0e1e1b] hover:bg-[#285A48]/40 text-[#B0E4CC] font-bold rounded-2xl transition-all duration-200 border border-[#285A48]/40 hover:border-[#408A71]/50 cursor-pointer text-sm">
                  View All Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════
            SELLER PROMO BANNER
        ══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div
            className="relative rounded-3xl overflow-hidden px-8 py-10 md:px-14 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{
              background: 'linear-gradient(125deg, #285A48 0%, #1e4336 55%, #122d23 100%)',
              border: '1px solid rgba(64,138,113,0.25)',
            }}
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-[#408A71]/10 pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full border border-[#408A71]/15 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, rgba(64,138,113,0.08), transparent 70%)' }} />

            <div className="relative text-center md:text-left">
              <span className="text-[#B0E4CC]/50 text-[10px] font-black uppercase tracking-widest mb-2 block">For Sellers</span>
              <h2 className="font-display text-2xl md:text-3xl text-white font-bold mb-2">
                Turn Your Products Into Profit
              </h2>
              <p className="text-[#B0E4CC]/55 text-sm max-w-md leading-relaxed">
                Join hundreds of local retailers on VendoSphere. List your first product for free and reach thousands of buyers across Pakistan.
              </p>
            </div>
            <div className="relative shrink-0 flex flex-col sm:flex-row gap-3">
              {/* <Link href="/request-seller">
                <button className="flex items-center gap-2 px-7 py-3.5 bg-[#B0E4CC] hover:bg-white text-[#091413] font-black rounded-2xl transition-all duration-200 hover:scale-[1.03] shadow-xl cursor-pointer text-sm whitespace-nowrap">
                  <Store className="w-4 h-4" />
                  Open Free Store
                </button>
              </Link> */}
              <Link href={userRole === 'customer' || !userRole ? '/request-seller' : '/dashboard'}>
                <button className="flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-200 border border-white/25 backdrop-blur-sm cursor-pointer text-sm">
                  {userRole === 'customer' || !userRole ? 'Become A Seller' : 'Seller Dashboard'}
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            DISCOUNT PRODUCTS
        ══════════════════════════════════════════════ */}
        {(loadingDiscounted || discounted.length > 0) && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div
                className="relative rounded-3xl px-4 sm:px-8 py-10 border border-[#285A48]/20"
                style={{
                  background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(40,90,72,0.16) 0%, transparent 70%), #0a1512',
                }}
              >
                {/* Flash badge */}
                {/* <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/25 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {/* <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Flash Deals</span> */}
                {/* </div>  */}

                <SectionHeader
                  eyebrow="Top Discounts"
                  title="Best Deals Right Now"
                  subtitle="Biggest savings — refreshed daily from our retailers"
                  href="/products?sort=discount"
                  // linkLabel="See All Deals"
                />

                {!loadingDiscounted && discounted.length === 0 ? (
                  <div className="text-center py-20">
                    <Tag className="w-12 h-12 text-[#285A48] mx-auto mb-3" />
                    <p className="text-[#B0E4CC]/30 font-semibold">No discounted products yet</p>
                  </div>
                ) : (
                  <ProductRow products={discounted.slice(0, 10)} onQuickBuy={setQuickBuy} loading={loadingDiscounted} />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
            TOP SHOPS
        ══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionHeader
            eyebrow="Top Shops"
            title="Explore Live Stores"
            subtitle="Browse our most popular local retailers"
            href="/shops"
            linkLabel="Browse All Shops"
          />

          {loadingShops ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#0e1e1b] border border-[#285A48]/20 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-32 bg-[#1a2e2a]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#1a2e2a] rounded-full w-2/3" />
                    <div className="h-3 bg-[#1a2e2a] rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : topShops.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-[#285A48]/30">
              <Store className="w-12 h-12 text-[#285A48] mx-auto mb-3" />
              <p className="text-[#B0E4CC]/30 font-semibold">No live shops yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {topShops.slice(0, 8).map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>
          )}

          {topShops.length > 0 && (
            <div className="flex justify-center mt-8">
              <Link href="/shops">
                <button className="group flex items-center gap-2.5 px-8 py-3.5 bg-[#0e1e1b] hover:bg-[#285A48]/40 text-[#B0E4CC] font-bold rounded-2xl transition-all duration-200 border border-[#285A48]/40 hover:border-[#408A71]/50 cursor-pointer text-sm">
                  Browse All Shops
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════
            WHY VENDOSPHERE — text-only trust section
        ══════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-[#285A48]/20">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[#408A71] mb-3 px-3 py-1 rounded-full border border-[#408A71]/30 bg-[#408A71]/10">
              Why VendoSphere
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-white font-bold">
              The Smarter Way to Shop &amp; Sell
            </h2>
            <p className="text-[#B0E4CC]/40 text-sm mt-2 max-w-md mx-auto">
              Everything you need — whether you're buying for yourself or building a business.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                title: 'Secure & Trusted',
                desc: 'Every transaction is protected. We verify all sellers before they go live so you shop with confidence.',
              },
              {
                icon: Truck,
                title: 'Nationwide Delivery',
                desc: 'We partner with top couriers to deliver your orders fast — anywhere in Pakistan.',
              },
              {
                icon: RotateCcw,
                title: 'Hassle-Free Returns',
                desc: 'Not satisfied? Our easy return policy ensures you never feel stuck with a purchase you don\'t love.',
              },
              {
                icon: Star,
                title: 'Verified Seller Ratings',
                desc: 'Browse honest reviews from real buyers. Our rating system keeps quality high and scams out.',
              },
              {
                icon: Zap,
                title: 'Instant Seller Setup',
                desc: 'Launch your store in minutes — no technical knowledge needed. Start earning the same day.',
              },
              {
                icon: Headphones,
                title: '24/7 Customer Support',
                desc: 'Got an issue? Our team is always available to help buyers and sellers resolve problems quickly.',
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl bg-[#0e1e1b] border border-[#285A48]/25 hover:border-[#408A71]/40 hover:bg-[#111f1c] transition-all duration-300 opacity-0 animate-slideUp"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#285A48]/30 border border-[#408A71]/20 flex items-center justify-center mb-4 group-hover:bg-[#285A48]/50 transition-colors">
                  <item.icon className="w-5 h-5 text-[#408A71] group-hover:text-[#B0E4CC] transition-colors" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                <p className="text-[#B0E4CC]/38 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer className="border-t border-[#285A48]/25 mt-4" style={{ background: '#07100e' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

              {/* Brand */}
              <div className="col-span-2">
                <h2 className="font-display text-2xl font-bold mb-3">
                  <span className="text-white">Vendo</span>
                  <span className="shimmer-text">Sphere</span>
                </h2>
                <p className="text-[#B0E4CC]/30 text-sm leading-relaxed mb-5 max-w-xs">
                  Pakistan's growing multi-retailer marketplace. Shop from local sellers or launch your own store today.
                </p>
                <div className="flex items-center gap-2">
                  {['FB', 'IG', 'TW', 'YT'].map(s => (
                    <button
                      key={s}
                      className="w-9 h-9 rounded-xl bg-[#0e1e1b] border border-[#285A48]/40 flex items-center justify-center text-[#408A71] text-xs font-black hover:border-[#408A71]/60 hover:text-[#B0E4CC] transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {[
                {
                  title: 'Shop',
                  links: [
                    { label: 'All Products', href: '/products' },
                    { label: 'Top Deals',    href: '/products?sort=discount' },
                    { label: 'New Arrivals', href: '/products?sort=new' },
                    { label: 'All Shops',    href: '/shops' },
                  ],
                },
                {
                  title: 'Sell',
                  links: [
                    { label: 'Become a Seller',  href: '/request-seller' },
                    { label: 'Seller Dashboard', href: '/dashboard' },
                    { label: 'Manage Inventory', href: '/dashboard/inventory' },
                    { label: 'My Shops',         href: '/dashboard/shops' },
                  ],
                },
                {
                  title: 'Account',
                  links: [
                    { label: 'Login',      href: '/login' },
                    { label: 'Sign Up',    href: '/signup' },
                    { label: 'My Account', href: '/account' },
                    { label: 'My Orders',  href: '/account/orders' },
                    { label: 'Wishlist',   href: '/wishlist' },
                  ],
                },
              ].map(col => (
                <div key={col.title}>
                  <h3 className="text-white font-black text-[10px] uppercase tracking-widest mb-4">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.links.map(item => (
                      <li key={item.label}>
                        <Link href={item.href}>
                          <span className="text-[#B0E4CC]/30 hover:text-[#B0E4CC] text-sm transition-colors cursor-pointer">
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-[#285A48]/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[#B0E4CC]/18 text-xs">
                © {new Date().getFullYear()} VendoSphere. All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
                  <span key={item} className="text-[#B0E4CC]/22 hover:text-[#B0E4CC]/55 text-xs cursor-pointer transition-colors">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* Quick Buy Modal — original functionality unchanged */}
        {quickBuy && (
          <QuickBuyModal
            product={quickBuy}
            onClose={() => setQuickBuy(null)}
            onSuccess={() => setQuickBuy(null)}
          />
        )}
      </div>
    </>
  )
}
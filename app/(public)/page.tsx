'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Tag, Store,
  ShoppingBag, Zap,
  Package, Star, ChevronRight,
  Award, Shield, Truck, RotateCcw, Headphones,
} from 'lucide-react'
import { storeService } from '@/lib/services/store.service'
import { categoryService } from '@/lib/services/category.service'
import StoreProductCard from '@/components/store/ProductCard'
import QuickBuyModal from '@/components/store/QuickBuyModal'
import { authService } from '@/lib/services/auth.service'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

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

function SectionHeader({
  eyebrow, title, subtitle, href, linkLabel,
}: {
  eyebrow: string; title: string; subtitle?: string
  href: string; linkLabel?: string
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-2 px-3 py-1 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10">
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight font-bold text-[#1e1b4b] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-1 text-[#6b7280]">{subtitle}</p>
        )}
      </div>
      {linkLabel && (
        <Link href={href} className="shrink-0 mt-1">
          <button className="group flex items-center gap-1.5 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap">
            {linkLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </Link>
      )}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#C4B5FD]/30 animate-pulse shadow-xl shadow-[#7C3AED]/15">
      <div className="aspect-square bg-[#EDE9FE]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#EDE9FE] rounded-full w-3/4" />
        <div className="h-3 bg-[#EDE9FE] rounded-full w-1/2" />
        <div className="h-8 bg-[#EDE9FE] rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}

function ProductRow({ products, onQuickBuy, loading }: {
  products: any[]; onQuickBuy: (p: any) => void; loading: boolean
}) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  )
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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

function ShopCard({ shop, index }: { shop: any; index: number }) {
  return (
    <Link href={`/shop/${shop.id}`}>
      <div
        className="group relative bg-white border border-[#C4B5FD]/30 rounded-2xl overflow-hidden hover:border-[#7C3AED]/40 hover:shadow-2xl hover:shadow-[#7C3AED]/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer opacity-0 animate-slideUp shadow-xl shadow-[#7C3AED]/12"
        style={{ animationDelay: `${index * 70}ms`, animationFillMode: 'forwards' }}
      >
        <div className="relative h-32 bg-[#EDE9FE] overflow-hidden">
          {shop.banner_url ? (
            <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
              <Store className="w-10 h-10 text-[#C4B5FD]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-[#7C3AED]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-[#7C3AED] text-[10px] font-black tracking-widest uppercase">Live</span>
          </div>
        </div>
        <div className="p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] border border-[#C4B5FD]/40 overflow-hidden shrink-0 -mt-8 relative z-10 shadow-lg">
            {shop.logo_url
              ? <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Store className="w-5 h-5 text-[#7C3AED]" /></div>
            }
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[#1e1b4b] font-bold text-sm truncate group-hover:text-[#7C3AED] transition-colors">{shop.name}</p>
            <p className="text-[#7C3AED] text-xs font-semibold">{shop.product_count} products</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0 group-hover:bg-[#7C3AED]/15 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-[#7C3AED]" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function LandingPage() {
  const [featured,    setFeatured]    = useState<any[]>([])
  const [discounted,  setDiscounted]  = useState<any[]>([])
  const [topShops,    setTopShops]    = useState<any[]>([])
  const [categories,  setCategories]  = useState<any[]>([])
  const [quickBuy,    setQuickBuy]    = useState<any>(null)
  const [userRole,    setUserRole]    = useState<string>('')
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

  const totalProducts = featured.length + discounted.length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        a, button, [class*="cursor-pointer"], [role="button"], label { cursor: pointer !important; }
        .font-display { font-family: 'Montserrat', sans-serif; }
        .font-body    { font-family: 'Open Sans', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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
          50%       { transform: scale(1.4); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(1deg); }
          66%       { transform: translateY(-6px) rotate(-1deg); }
        }

        .animate-slideUp   { animation: slideUp 0.55s cubic-bezier(.22,1,.36,1) both; }
        .animate-fadeIn    { animation: fadeIn 0.4s ease both; }
        .animate-marquee   { animation: marquee 30s linear infinite; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-float     { animation: float 6s ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #7C3AED 20%, #C4B5FD 45%, #7C3AED 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }

        .hero-overlay {
          background: linear-gradient(
            to right,
            rgba(124,58,237,0.75) 0%,
            rgba(109,40,217,0.55) 35%,
            rgba(124,58,237,0.15) 60%,
            transparent 100%
          );
        }
        @media (max-width: 768px) {
          .hero-overlay {
            background: linear-gradient(
              to bottom,
              rgba(124,58,237,0.60) 0%,
              rgba(109,40,217,0.70) 50%,
              rgba(233,213,255,0.90) 100%
            );
          }
        }

        .hero-img-float {
          animation: float 7s ease-in-out infinite;
          filter: drop-shadow(0 30px 60px rgba(124,58,237,0.35));
        }

        .trust-card {
          background: white;
          border: 1px solid rgba(196,181,253,0.35);
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 12px 32px rgba(124,58,237,0.15);
        }
        .trust-card:hover {
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 16px 48px rgba(124,58,237,0.25);
          transform: translateY(-3px);
        }
      `}</style>

      <div className="min-h-screen font-body" style={{ background: '#FAF5FF' }}>
        {/* HERO SECTION */}
        <section
          className="relative min-h-[92vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: "url('/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#e9d5ff",
          }}
        >
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #FAF5FF)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-20 md:pt-40 md:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div>
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 bg-white/20 border border-white/35 backdrop-blur-sm opacity-0 animate-slideUp"
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="relative w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-[#C4B5FD] animate-ping-slow" />
                    <span className="relative block w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-white text-xs font-black tracking-[0.15em] uppercase">
                    Pakistan&apos;s Growing Marketplace
                  </span>
                </div>

                <h1
                  className="font-playfair leading-[1.05] mb-5 opacity-0 animate-slideUp"
                  style={{ animationDelay: '80ms' }}
                >
                  <span className="block text-4xl sm:text-5xl md:text-[3.75rem] text-white drop-shadow-lg">
                    Shop Everything
                  </span>
                  <span className="block text-4xl sm:text-5xl md:text-[3.75rem] text-[#C4B5FD] drop-shadow-lg italic">
                    You Love.
                  </span>
                </h1>

                <p
                  className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-md opacity-0 animate-slideUp"
                  style={{ animationDelay: '160ms' }}
                >
                  Discover products from local retailers — clothing, pets, electronics and more. One marketplace, endless choice.
                </p>

                <div
                  className="flex flex-wrap items-center gap-3 mb-10 opacity-0 animate-slideUp"
                  style={{ animationDelay: '240ms' }}
                >
                  <Link href="/products">
                    <button className="group flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-[#FAF5FF] text-[#7C3AED] font-black rounded-2xl transition-all duration-200 shadow-2xl shadow-[#4C1D95]/30 hover:scale-[1.03] cursor-pointer text-sm">
                      <ShoppingBag className="w-4 h-4" />
                      Shop Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                  <Link href={isAuthenticated ? (userRole === 'customer' || !userRole ? '/request-seller' : '/dashboard') : '/request-seller'}>
                    <button className="flex items-center gap-2.5 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl transition-all duration-200 border border-white/30 backdrop-blur-sm cursor-pointer text-sm">
                      {isAuthenticated && userRole !== 'customer' && userRole ? 'Start Selling' : 'Become A Seller'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

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
                      <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                        <s.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-white leading-none">
                          <AnimatedNumber target={s.value} suffix={s.suffix} />
                        </p>
                        <p className="text-white/55 text-xs">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side — image shows through the background naturally on desktop */}
              <div className="hidden lg:block" />

            </div>
          </div>
        </section>
        {/* TRUST MARQUEE BAR */}
        <div className="border-y border-[#C4B5FD]/30 py-3.5 overflow-hidden bg-white">
          <div className="flex items-center animate-marquee" style={{ width: 'max-content' }}>
            {[
              { icon: Truck,      label: 'Nationwide Delivery' },
              { icon: Shield,     label: 'Secure Checkout' },
              { icon: RotateCcw,  label: 'Easy Returns' },
              { icon: Headphones, label: '24/7 Support' },
              { icon: Star,       label: 'Verified Sellers' },
              { icon: Award,      label: 'Quality Guarantee' },
              { icon: Zap,        label: 'Fast Processing' },
              { icon: Truck,      label: 'Nationwide Delivery' },
              { icon: Shield,     label: 'Secure Checkout' },
              { icon: RotateCcw,  label: 'Easy Returns' },
              { icon: Headphones, label: '24/7 Support' },
              { icon: Star,       label: 'Verified Sellers' },
              { icon: Award,      label: 'Quality Guarantee' },
              { icon: Zap,        label: 'Fast Processing' },
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-8 text-[#6b7280] text-sm font-semibold whitespace-nowrap">
                <item.icon className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                {item.label}
                <span className="ml-8 text-[#C4B5FD]">*</span>
              </span>
            ))}
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionHeader
            eyebrow="Featured"
            title="Featured Products"
            subtitle="Hand-picked products from our top retailers"
            href="/products"
          />
          {!loadingFeatured && featured.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-[#C4B5FD]/40 bg-white shadow-lg shadow-[#7C3AED]/12">
              <ShoppingBag className="w-12 h-12 text-[#C4B5FD] mx-auto mb-3" />
              <p className="text-[#6b7280] font-semibold">No products available yet</p>
            </div>
          ) : (
            <ProductRow products={featured.slice(0, 8)} onQuickBuy={setQuickBuy} loading={loadingFeatured} />
          )}
          {featured.length > 0 && (
            <div className="flex justify-center mt-8">
              <Link href="/products">
                <button className="group flex items-center gap-2.5 px-8 py-3.5 bg-white hover:bg-[#EDE9FE] text-[#7C3AED] font-bold rounded-2xl transition-all duration-200 border border-[#C4B5FD]/40 hover:border-[#7C3AED]/40 cursor-pointer text-sm shadow-lg shadow-[#7C3AED]/12 hover:shadow-xl hover:shadow-[#7C3AED]/15">
                  View All Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* SELLER PROMO BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div
            className="relative rounded-3xl overflow-hidden px-8 py-10 md:px-14 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#7C3AED]/25"
            style={{
              background: 'linear-gradient(125deg, #7C3AED 0%, #6D28D9 55%, #4C1D95 100%)',
              border: '1px solid rgba(196,181,253,0.25)',
            }}
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full border border-white/15 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, rgba(196,181,253,0.15), transparent 70%)' }} />
            <div className="relative text-center md:text-left">
              <span className="text-[#C4B5FD]/70 text-[10px] font-black uppercase tracking-widest mb-2 block">For Sellers</span>
              <h2 className="font-display text-2xl md:text-3xl text-white font-bold mb-2">
                Turn Your Products Into Profit
              </h2>
              <p className="text-white/65 text-sm max-w-md leading-relaxed">
                Join hundreds of local retailers on VendoSphere. List your first product for free and reach thousands of buyers across Pakistan.
              </p>
            </div>
            <div className="relative shrink-0">
              <Link href={isAuthenticated && userRole !== 'customer' && userRole ? '/dashboard' : '/request-seller'}>
                <button className="flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-[#FAF5FF] text-[#7C3AED] font-black rounded-2xl transition-all duration-200 hover:scale-[1.03] shadow-xl cursor-pointer text-sm">
                  <Store className="w-4 h-4" />
                  {isAuthenticated && userRole !== 'customer' && userRole ? 'Seller Dashboard' : 'Become A Seller'}
                </button>
              </Link>
            </div>
          </div>
        </section>
        {/* DISCOUNT PRODUCTS */}
        {(loadingDiscounted || discounted.length > 0) && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div
                id="best-deals"
                className="relative rounded-3xl px-4 sm:px-8 py-10 border border-[#C4B5FD]/25 shadow-xl shadow-[#7C3AED]/15"
                style={{
                  background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.18) 0%, transparent 70%), white',
                }}
              >
                <SectionHeader
                  eyebrow="Top Discounts"
                  title="Best Deals Right Now"
                  subtitle="Biggest savings refreshed daily from our retailers"
                  href="/products?sort=discount"
                />
                {!loadingDiscounted && discounted.length === 0 ? (
                  <div className="text-center py-20 rounded-2xl bg-white/50 shadow-lg shadow-[#7C3AED]/10">
                    <Tag className="w-12 h-12 text-[#C4B5FD] mx-auto mb-3" />
                    <p className="text-[#6b7280] font-semibold">No discounted products yet</p>
                  </div>
                ) : (
                  <ProductRow products={discounted.slice(0, 4)} onQuickBuy={setQuickBuy} loading={loadingDiscounted} />
                )}
              </div>
            </div>
          </section>
        )}

        {/* TOP SHOPS */}
        <section id="live-stores" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionHeader
            eyebrow="Top Shops"
            title="Explore Live Stores"
            subtitle="Browse our most popular local retailers"
            href="/shops"
          />
          {loadingShops ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#C4B5FD]/25 rounded-2xl overflow-hidden animate-pulse shadow-xl shadow-[#7C3AED]/12">
                  <div className="h-32 bg-[#EDE9FE]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#EDE9FE] rounded-full w-2/3" />
                    <div className="h-3 bg-[#EDE9FE] rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : topShops.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-[#C4B5FD]/40 bg-white shadow-lg shadow-[#7C3AED]/12">
              <Store className="w-12 h-12 text-[#C4B5FD] mx-auto mb-3" />
              <p className="text-[#6b7280] font-semibold">No live shops yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {topShops.slice(0, 8).map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>
          )}
        </section>
        {/* WHY VENDOSPHERE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-[#C4B5FD]/20">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-3 px-3 py-1 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10">
              Why VendoSphere
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-[#1e1b4b] font-bold">
              The Smarter Way to Shop &amp; Sell
            </h2>
            <p className="text-[#6b7280] text-sm mt-2 max-w-md mx-auto">
              Everything you need, whether you are buying for yourself or building a business.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield,     title: 'Secure & Trusted',        desc: 'Every transaction is protected. We verify all sellers before they go live so you shop with confidence.' },
              { icon: Truck,      title: 'Nationwide Delivery',      desc: 'We partner with top couriers to deliver your orders fast, anywhere in Pakistan.' },
              { icon: RotateCcw,  title: 'Hassle-Free Returns',      desc: 'Not satisfied? Our easy return policy ensures you never feel stuck with a purchase you do not love.' },
              { icon: Star,       title: 'Verified Seller Ratings',  desc: 'Browse honest reviews from real buyers. Our rating system keeps quality high and scams out.' },
              { icon: Zap,        title: 'Instant Seller Setup',     desc: 'Launch your store in minutes, no technical knowledge needed. Start earning the same day.' },
              { icon: Headphones, title: '24/7 Customer Support',    desc: 'Got an issue? Our team is always available to help buyers and sellers resolve problems quickly.' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="trust-card group p-6 opacity-0 animate-slideUp"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/15 flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/15 transition-colors">
                  <item.icon className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <h3 className="text-[#1e1b4b] font-bold text-base mb-2">{item.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#C4B5FD]/25 mt-4" style={{ background: '#f3eeff' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
              <div className="col-span-2">
                {/* Footer Logo */}
                <Link href="/" className="inline-flex mb-4">
                  <img
                    src="/logo.png"
                    alt="VendoSphere"
                    className="h-10 sm:h-12 w-auto object-contain"
                    style={{ maxWidth: '180px' }}
                  />
                </Link>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-5 max-w-xs">
                  Pakistan&apos;s growing multi-retailer marketplace. Shop from local sellers or launch your own store today.
                </p>
                {/* Social Icons */}
                <div className="flex items-center gap-3">
                  {[
                    { src: '/facebook.png',  alt: 'Facebook',  href: '#', bg: '#1877F2' },
                    { src: '/instagram.png', alt: 'Instagram', href: '#', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
                    { src: '/x-twitter.png', alt: 'X / Twitter', href: '#', bg: '#000000' },
                    { src: '/youtube.png',   alt: 'YouTube',   href: '#', bg: '#FF0000' },
                  ].map(icon => (
                    <a
                      key={icon.alt}
                      href={icon.href}
                      aria-label={icon.alt}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer overflow-hidden"
                      style={{ background: icon.bg }}
                    >
                      <img src={icon.src} alt={icon.alt} className="w-5 h-5 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                    </a>
                  ))}
                </div>
              </div>
              {[
                {
                  title: 'Shop',
                  links: [
                    { label: 'All Products', href: '/products' },
                    { label: 'Top Deals',    href: '#best-deals', scroll: true },
                    { label: 'All Shops',    href: '#live-stores', scroll: true },
                  ],
                },
                ...(isAuthenticated ? [{
                  title: 'Sell',
                  links: [
                    ...(userRole !== 'business_owner' ? [{ label: 'Become a Seller', href: '/request-seller' }] : []),
                    { label: 'Sell Products', href: '/how-to-sell' },
                    ...(userRole === 'business_owner' ? [{ label: 'Seller Dashboard', href: '/dashboard' }] : []),
                  ],
                }] : []),
                {
                  title: 'Account',
                  links: isAuthenticated ? [
                    { label: 'My Profile', href: '/profile' },
                    { label: 'My Orders',  href: '/orders' },
                    { label: 'Wishlist',   href: '/wishlist' },
                    { label: 'Cart',       href: '/cart' },
                  ] : [
                    { label: 'Login',      href: '/login' },
                    { label: 'Sign Up',    href: '/signup' },
                  ],
                },
                {
                  title: 'Legal',
                  links: [
                    { label: 'Report',         href: '/report' },
                    { label: 'Report History', href: '/report/history' },
                    { label: 'Contact Us',     href: '/contact' },
                  ],
                },
              ].map(col => (
                <div key={col.title}>
                  <h3 className="text-[#1e1b4b] font-black text-[10px] uppercase tracking-widest mb-4">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.links.map(item => (
                      <li key={item.label}>
                        {(item as any).scroll ? (
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault()
                              const id = item.href.replace('#', '')
                              const element = document.getElementById(id)
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }}
                            className="text-[#6b7280] hover:text-[#7C3AED] text-sm transition-colors cursor-pointer"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link href={item.href}>
                            <span className="text-[#6b7280] hover:text-[#7C3AED] text-sm transition-colors cursor-pointer">
                              {item.label}
                            </span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-[#C4B5FD]/25 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[#9ca3af] text-xs">
                &copy; {new Date().getFullYear()} VendoSphere. All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
                  <span key={item} className="text-[#9ca3af] hover:text-[#7C3AED] text-xs cursor-pointer transition-colors">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

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
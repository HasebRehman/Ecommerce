'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ArrowRight, ShoppingBag, Store, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { createResolver } from '@/lib/validations/resolver'

/* ── role redirects unchanged ── */
const ROLE_REDIRECTS: Record<string, string> = {
  super_admin:      '/super-admin/dashboard',
  platform_admin:   '/platform-admin/dashboard',
  operations_admin: '/operations-admin/dashboard',
  business_owner:   '/dashboard',
  courier:          '/rider/dashboard',
  customer:         '/account',
}

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)
  const { setUser, setRole, setSubRoles } = useAuthStore()

  /* ── toast effects — unchanged ── */
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      toast.info('Account created! Please verify your email then sign in.')
    }
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! You can now sign in.')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: createResolver(loginSchema),
  })

  /* ── submit handler — unchanged ── */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await authService.login(data)
      const userData = await authService.getMe()
      setUser(userData.profile)
      setRole(userData.role)
      setSubRoles(userData.subRoles)
      toast.success(`Welcome back, ${userData.profile.full_name}!`)
      const redirectTo = '/'
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }
        .lp-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .lp-root a, .lp-root button { cursor: pointer !important; }

        /* ── page background mesh ── */
        .lp-bg {
          background:
            radial-gradient(ellipse 70% 55% at 15% 10%,  rgba(40,90,72,0.22)  0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 90%,  rgba(64,138,113,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 80% 60% at 50% 50%,  rgba(9,20,19,0.95)   0%, transparent 100%),
            #091413;
        }

        /* ── floating orb behind card ── */
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0)    scale(1);    }
          33%       { transform: translate(12px, -16px) scale(1.04); }
          66%       { transform: translate(-8px, 10px)  scale(0.97); }
        }
        .lp-orb { animation: orbFloat 12s ease-in-out infinite; }

        /* ── shimmer logo ── */
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

        /* ── card slide-up ── */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .lp-card { animation: cardIn 0.55s cubic-bezier(.22,1,.36,1) both; }

        /* ── input focus glow ── */
        .lp-input {
          background: rgba(22,36,32,0.7) !important;
          border: 1px solid rgba(40,90,72,0.45) !important;
          color: #B0E4CC !important;
          border-radius: 12px !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
        .lp-input::placeholder { color: rgba(176,228,204,0.28) !important; }
        .lp-input:focus {
          border-color: rgba(64,138,113,0.75) !important;
          box-shadow: 0 0 0 3px rgba(64,138,113,0.15) !important;
          outline: none !important;
        }
        .lp-input:-webkit-autofill,
        .lp-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #162420 inset !important;
          -webkit-text-fill-color: #B0E4CC !important;
        }

        /* ── submit button shimmer sweep ── */
        @keyframes btnShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .lp-btn {
          background: linear-gradient(90deg, #285A48 0%, #408A71 50%, #285A48 100%);
          background-size: 200% auto;
          transition: background-position 0.4s ease, transform 0.15s ease, opacity 0.2s ease;
        }
        .lp-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(40,90,72,0.45);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }

        /* ── floating icons animation ── */
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(5deg); }
        }
        .icon-float-1 { animation: iconFloat 6s ease-in-out infinite; }
        .icon-float-2 { animation: iconFloat 8s ease-in-out infinite 1s; }
        .icon-float-3 { animation: iconFloat 7s ease-in-out infinite 2s; }

        /* scrollbar */
        .lp-root { scrollbar-width: thin; scrollbar-color: #285A48 #091413; }
      `}</style>

      <div className="lp-root lp-bg min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">

        {/* ── decorative background blobs ── */}
        <div className="lp-orb absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(64,138,113,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(40,90,72,0.10) 0%, transparent 70%)' }} />

        {/* ── decorative grid dots ── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #B0E4CC 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* ── floating decorative icons (desktop only) ── */}
        <div className="hidden lg:block absolute top-[15%] left-[8%] icon-float-1">
          <div className="w-14 h-14 rounded-2xl bg-[#162420] border border-[#285A48]/30 flex items-center justify-center shadow-xl">
            <ShoppingBag className="w-6 h-6 text-[#408A71]" />
          </div>
        </div>
        <div className="hidden lg:block absolute top-[55%] left-[6%] icon-float-2">
          <div className="w-11 h-11 rounded-xl bg-[#162420] border border-[#285A48]/30 flex items-center justify-center shadow-lg">
            <Store className="w-5 h-5 text-[#408A71]" />
          </div>
        </div>
        <div className="hidden lg:block absolute top-[25%] right-[7%] icon-float-3">
          <div className="w-12 h-12 rounded-2xl bg-[#162420] border border-[#285A48]/30 flex items-center justify-center shadow-xl">
            <Package className="w-5 h-5 text-[#408A71]" />
          </div>
        </div>

        {/* ════════════════════════════════════════════
            CARD
        ════════════════════════════════════════════ */}
        <div className="lp-card relative w-full max-w-md">

          {/* Card glow ring */}
          <div className="absolute -inset-px rounded-3xl pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(64,138,113,0.3) 0%, transparent 50%, rgba(40,90,72,0.2) 100%)' }} />

          <div
            className="relative rounded-3xl overflow-hidden border border-[#285A48]/35 shadow-2xl shadow-[#091413]/80"
            style={{ background: 'linear-gradient(160deg, #0f1e1b 0%, #0d1a17 60%, #0a1512 100%)' }}
          >

            {/* Top accent bar */}
            <div className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg, #285A48, #408A71, #B0E4CC, #408A71, #285A48)' }} />

            <div className="px-8 pt-8 pb-10 sm:px-10">

              {/* ── Logo / brand ── */}
              <div className="flex flex-col items-center mb-8">
                {/* <Link href="/" className="mb-5">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    <span className="text-white">Vendo</span>
                    <span className="logo-shimmer">Sphere</span>
                  </h1>
                </Link> */}

                {/* Icon badge */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #285A48 0%, #408A71 100%)' }}>
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </div>

                <h2 className="text-xl font-black text-white tracking-tight">Welcome Back</h2>
                <p className="text-[#B0E4CC]/45 text-sm mt-1 text-center">
                  Sign in to your VendoSphere account
                </p>
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[#B0E4CC]/70 text-xs font-bold uppercase tracking-widest"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="lp-input h-11 text-sm px-4"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-400/90 text-xs font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-[#B0E4CC]/70 text-xs font-bold uppercase tracking-widest"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#408A71] hover:text-[#B0E4CC] font-semibold transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      className="lp-input h-11 text-sm px-4 pr-11"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#408A71]/70 hover:text-[#B0E4CC] transition-colors"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400/90 text-xs font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="lp-btn w-full h-12 rounded-xl text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-[#285A48]/30" />
                  <span className="text-[#B0E4CC]/25 text-xs font-semibold uppercase tracking-widest shrink-0">or</span>
                  <div className="flex-1 h-px bg-[#285A48]/30" />
                </div>

                {/* Sign up link */}
                <p className="text-[#B0E4CC]/40 text-sm text-center leading-relaxed">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-[#408A71] hover:text-[#B0E4CC] font-bold transition-colors"
                  >
                    Create one free →
                  </Link>
                </p>

              </form>
            </div>
          </div>

          {/* Card bottom reflection */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(64,138,113,0.12)' }} />
        </div>
      </div>
    </>
  )
}
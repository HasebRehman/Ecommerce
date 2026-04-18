'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react'

import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { createResolver } from '@/lib/validations/resolver'

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
      router.push('/')
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
        .lp * { box-sizing: border-box; }
        .lp { font-family: 'Inter', sans-serif; width: 100%; }

        .lp-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.28rem;
        }

        .lp-input {
          width: 100%;
          background: #FAFAFA;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 0.55rem 0.8rem 0.55rem 2.4rem;
          color: #1e1b4b;
          font-size: 0.855rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          caret-color: #7C3AED;
        }
        .lp-input::placeholder { color: #9CA3AF; }
        .lp-input:focus {
          border-color: #7C3AED;
          background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.10);
        }
        .lp-input-err {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
        }
        .lp-input-pr { padding-right: 2.5rem; }

        .lp-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #A78BFA;
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .lp-eye {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          transition: color 0.15s;
          cursor: pointer !important;
        }
        .lp-eye:hover { color: #7C3AED; }

        .lp-btn {
          width: 100%;
          padding: 0.78rem;
          background: #7C3AED;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(124,58,237,0.28);
          font-family: 'Inter', sans-serif;
        }
        .lp-btn:hover:not(:disabled) {
          background: #6D28D9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.36);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.55; cursor: not-allowed !important; }

        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp .a1 { animation: lpFadeUp 0.32s 0.00s both; }
        .lp .a2 { animation: lpFadeUp 0.32s 0.05s both; }
        .lp .a3 { animation: lpFadeUp 0.32s 0.09s both; }
        .lp .a4 { animation: lpFadeUp 0.32s 0.13s both; }
        .lp .a5 { animation: lpFadeUp 0.32s 0.17s both; }
        .lp .a6 { animation: lpFadeUp 0.32s 0.21s both; }
      `}</style>

      <div className="lp">

        {/* Heading */}
        <div className="a1" style={{ marginBottom: '0.2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2 }}>
            Welcome Back
          </h2>
        </div>
        <div className="a2" style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Sign in to your VendoSphere account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

            {/* Email */}
            <div className="a3">
              <label htmlFor="email" className="lp-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail className="lp-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="haseeb@gmail.com"
                  className={`lp-input${errors.email ? ' lp-input-err' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', flexShrink: 0, display: 'inline-block' }} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="a4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label htmlFor="password" className="lp-label" style={{ marginBottom: 0 }}>Password</label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6D28D9')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7C3AED')}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock className="lp-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  className={`lp-input lp-input-pr${errors.password ? ' lp-input-err' : ''}`}
                  {...register('password')}
                />
                <button type="button" className="lp-eye" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password">
                  {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', flexShrink: 0, display: 'inline-block' }} />
                  {errors.password.message}
                </p>
              )}
            </div>

          </div>

          {/* Submit */}
          <div className="a5" style={{ marginTop: '0.9rem' }}>
            <button type="submit" disabled={isLoading} className="lp-btn">
              {isLoading ? (
                <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight style={{ width: 15, height: 15 }} /></>
              )}
            </button>
          </div>
        </form>

        {/* Signup link */}
        <p className="a6" style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6b7280', marginTop: '0.75rem' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            style={{ fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#7C3AED')}
          >
            Create one free
          </Link>
        </p>

        {/* Copyright */}
        {/* <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9CA3AF', marginTop: '1.75rem' }}>
          &copy; {new Date().getFullYear()} VendoSphere. All rights reserved.
        </p> */}

      </div>
    </>
  )
}

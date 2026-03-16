'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, UserPlus, User, Mail, Lock, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { signupSchema, type SignupFormData } from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { createResolver } from '@/lib/validations/resolver'

/* ── Card / Header / Content / Footer are inlined so we can
      fully control the look without shadcn Card overrides ── */

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: createResolver(signupSchema),
  })

  /* ── logic completely unchanged ── */
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      await authService.signup(data)
      toast.success('Account created! Please login.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .sp-root * { box-sizing: border-box; }
        .sp-root, .sp-root button, .sp-root a { cursor: pointer !important; }
        .sp-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── Input focus ring ── */
        .sp-input {
          width: 100%;
          background: rgba(22,36,32,0.7);
          border: 1px solid rgba(40,90,72,0.45);
          border-radius: 12px;
          padding: 0.65rem 0.875rem 0.65rem 2.6rem;
          color: #B0E4CC;
          font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          caret-color: #408A71;
        }
        .sp-input::placeholder { color: rgba(176,228,204,0.28); }
        .sp-input:focus {
          border-color: #408A71;
          background: rgba(22,36,32,0.95);
          box-shadow: 0 0 0 3px rgba(64,138,113,0.18);
        }
        .sp-input-error {
          border-color: rgba(239,68,68,0.55) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important;
        }
        .sp-input-pr { padding-right: 2.75rem; }

        /* ── Submit button ── */
        .sp-btn {
          width: 100%;
          padding: 0.8rem 1.5rem;
          background: #408A71;
          color: #fff;
          font-weight: 800;
          font-size: 0.875rem;
          letter-spacing: 0.04em;
          border-radius: 14px;
          border: none;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 20px rgba(64,138,113,0.35);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .sp-btn:hover:not(:disabled) {
          background: #4eaa85;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(64,138,113,0.45);
        }
        .sp-btn:active:not(:disabled) { transform: translateY(0); }
        .sp-btn:disabled { opacity: 0.6; cursor: not-allowed !important; }

        /* ── Label ── */
        .sp-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(176,228,204,0.55);
          margin-bottom: 0.45rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Divider ── */
        .sp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(40,90,72,0.5), transparent);
        }

        /* ── Animate in ── */
        @keyframes fieldIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .field-1 { animation: fieldIn 0.35s 0.05s both; }
        .field-2 { animation: fieldIn 0.35s 0.10s both; }
        .field-3 { animation: fieldIn 0.35s 0.15s both; }
        .field-4 { animation: fieldIn 0.35s 0.20s both; }
        .field-5 { animation: fieldIn 0.35s 0.25s both; }
      `}</style>

      <div className="sp-root">
        {/* ── Header ──────────────────────────────────── */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #285A48 0%, #1a3d2e 100%)',
                border: '1px solid rgba(64,138,113,0.4)',
                boxShadow: '0 4px 14px rgba(9,20,19,0.5)',
              }}>
              <UserPlus className="w-4 h-4" style={{ color: '#B0E4CC' }} />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-xl leading-tight">
                Create Account
              </h2>
              <p style={{ color: 'rgba(176,228,204,0.45)', fontSize: '0.78rem' }}>
                Join VendoSphere — it's free to get started
              </p>
            </div>
          </div>
        </div>

        <div className="sp-divider mx-6" />

        {/* ── Form ────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pt-5 pb-2 space-y-4">

            {/* Full Name */}
            <div className="field-1">
              <label htmlFor="full_name" className="sp-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(64,138,113,0.6)' }} />
                <input
                  id="full_name"
                  placeholder="Hassan Ahmed"
                  className={`sp-input ${errors.full_name ? 'sp-input-error' : ''}`}
                  {...register('full_name')}
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="field-2">
              <label htmlFor="email" className="sp-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(64,138,113,0.6)' }} />
                <input
                  id="email"
                  type="email"
                  placeholder="hassan@example.com"
                  className={`sp-input ${errors.email ? 'sp-input-error' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="field-3">
              <label htmlFor="password" className="sp-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(64,138,113,0.6)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`sp-input sp-input-pr ${errors.password ? 'sp-input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(176,228,204,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B0E4CC')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(176,228,204,0.4)')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="field-4">
              <label htmlFor="confirm_password" className="sp-label">Confirm Password</label>
              <div className="relative">
                <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgba(64,138,113,0.6)' }} />
                <input
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`sp-input sp-input-pr ${errors.confirm_password ? 'sp-input-error' : ''}`}
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(176,228,204,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B0E4CC')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(176,228,204,0.4)')}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

          </div>

          {/* ── Footer ──────────────────────────────────── */}
          <div className="px-6 pt-4 pb-7 flex flex-col gap-4 field-5">

            <button type="submit" disabled={isLoading} className="sp-btn">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm" style={{ color: 'rgba(176,228,204,0.40)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold transition-colors"
                style={{ color: '#408A71' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#B0E4CC')}
                onMouseLeave={e => (e.currentTarget.style.color = '#408A71')}
              >
                Sign in
              </Link>
            </p>

          </div>
        </form>
      </div>
    </>
  )
}
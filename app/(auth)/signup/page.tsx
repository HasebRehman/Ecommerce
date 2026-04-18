'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, User, Mail, Lock, CheckCircle2 } from 'lucide-react'

import { signupSchema, type SignupFormData } from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { createResolver } from '@/lib/validations/resolver'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
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
        .sp * { box-sizing: border-box; }
        .sp { font-family: 'Inter', sans-serif; width: 100%; }

        .sp-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.28rem;
        }

        .sp-input {
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
        .sp-input::placeholder { color: #9CA3AF; }
        .sp-input:focus {
          border-color: #7C3AED;
          background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.10);
        }
        .sp-input-err {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
        }
        .sp-input-pr { padding-right: 2.5rem; }

        .sp-icon {
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

        .sp-eye {
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
        .sp-eye:hover { color: #7C3AED; }

        .sp-btn {
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
        .sp-btn:hover:not(:disabled) {
          background: #6D28D9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.36);
        }
        .sp-btn:active:not(:disabled) { transform: translateY(0); }
        .sp-btn:disabled { opacity: 0.55; cursor: not-allowed !important; }

        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sp .a1 { animation: spFadeUp 0.32s 0.00s both; }
        .sp .a2 { animation: spFadeUp 0.32s 0.05s both; }
        .sp .a3 { animation: spFadeUp 0.32s 0.09s both; }
        .sp .a4 { animation: spFadeUp 0.32s 0.13s both; }
        .sp .a5 { animation: spFadeUp 0.32s 0.17s both; }
        .sp .a6 { animation: spFadeUp 0.32s 0.21s both; }
        .sp .a7 { animation: spFadeUp 0.32s 0.25s both; }
      `}</style>

      <div className="sp">

        {/* Heading */}
        <div className="a1" style={{ marginBottom: '0.2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2 }}>
            Create Account
          </h2>
        </div>
        <div className="a2" style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Join VendoSphere — it&apos;s free to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

            {/* Full Name */}
            <div className="a3">
              <label htmlFor="full_name" className="sp-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User className="sp-icon" />
                <input
                  id="full_name"
                  placeholder="Haseeb Rehman"
                  className={`sp-input${errors.full_name ? ' sp-input-err' : ''}`}
                  {...register('full_name')}
                />
              </div>
              {errors.full_name && (
                <p style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', flexShrink: 0, display: 'inline-block' }} />
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="a3">
              <label htmlFor="email" className="sp-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail className="sp-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="haseeb@gmail.com"
                  className={`sp-input${errors.email ? ' sp-input-err' : ''}`}
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
              <label htmlFor="password" className="sp-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock className="sp-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`sp-input sp-input-pr${errors.password ? ' sp-input-err' : ''}`}
                  {...register('password')}
                />
                <button type="button" className="sp-eye" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password">
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

            {/* Confirm Password */}
            <div className="a5">
              <label htmlFor="confirm_password" className="sp-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <CheckCircle2 className="sp-icon" />
                <input
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`sp-input sp-input-pr${errors.confirm_password ? ' sp-input-err' : ''}`}
                  {...register('confirm_password')}
                />
                <button type="button" className="sp-eye" onClick={() => setShowConfirm(p => !p)} aria-label="Toggle confirm">
                  {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', flexShrink: 0, display: 'inline-block' }} />
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

          </div>

          {/* Submit */}
          <div className="a6" style={{ marginTop: '0.9rem' }}>
            <button type="submit" disabled={isLoading} className="sp-btn">
              {isLoading
                ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Creating account...</>
                : 'Create Account'
              }
            </button>
          </div>
        </form>

        {/* Login link */}
        <p className="a7" style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6b7280', marginTop: '0.75rem' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ fontWeight: 600, color: '#7C3AED', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#7C3AED')}
          >
            Login
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

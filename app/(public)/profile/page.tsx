'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Save, Loader2, Mail, Phone,
  FileText, AtSign, Shield, Store,
  ShoppingBag, User, X, Edit3, CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { profileService } from '@/lib/services/profile.service'
import { cn } from '@/lib/utils'

/* ── Role config — updated to match site purple theme ── */
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; icon: any }> = {
  super_admin:      { label: 'Super Admin',      color: 'text-red-500',          bg: 'bg-red-500/10 border-red-500/30',              dot: '#ef4444', icon: Shield },
  platform_admin:   { label: 'Platform Admin',   color: 'text-orange-500',       bg: 'bg-orange-500/10 border-orange-500/30',         dot: '#f97316', icon: Shield },
  operations_admin: { label: 'Operations Admin', color: 'text-yellow-500',       bg: 'bg-yellow-500/10 border-yellow-500/30',         dot: '#eab308', icon: Shield },
  business_owner:   { label: 'Retailer',         color: 'text-[#7C3AED]',        bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/30',           dot: '#7C3AED', icon: Store },
  customer:         { label: 'Customer',         color: 'text-[#C4B5FD]',        bg: 'bg-[#C4B5FD]/20 border-[#C4B5FD]/40',           dot: '#C4B5FD', icon: ShoppingBag },
  courier:          { label: 'Courier',          color: 'text-[#8B5CF6]',        bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30',           dot: '#8B5CF6', icon: User },
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const form         = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset!)
  form.append('folder', `vendosphere/${folder}`)
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!data.secure_url) throw new Error('Upload failed')
  return data.secure_url
}

export default function ProfilePage() {
  const router               = useRouter()
  const { isAuthenticated, setUser } = useAuthStore()

  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [email,     setEmail]     = useState('')
  const [role,      setRole]      = useState('')
  const [createdAt, setCreatedAt] = useState('')

  const [formData, setFormData] = useState({
    full_name:  '',
    username:   '',
    phone:      '',
    bio:        '',
    avatar_url: '',
    banner_url: '',
  })

  const [originalUsername, setOriginalUsername] = useState('') // ✅ Track original username
  const [usernameError, setUsernameError] = useState('') // ✅ Username validation error

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  /* ── Load profile data ── */
  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    profileService.getProfile()
      .then(data => {
        setEmail(data.email ?? '')
        setRole(data.role ?? '')
        setCreatedAt(data.profile?.created_at ?? '')
        setFormData({
          full_name:  data.profile?.full_name  ?? '',
          username:   data.profile?.username   ?? '',
          phone:      data.profile?.phone      ?? '',
          bio:        data.profile?.bio        ?? '',
          avatar_url: data.profile?.avatar_url ?? '',
          banner_url: data.profile?.banner_url ?? '',
        })
        setOriginalUsername(data.profile?.username ?? '') // ✅ Store original username
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [isAuthenticated, router])

  /* ── ✅ USERNAME VALIDATION ── */
  const validateUsername = (username: string): string => {
    if (!username || username.trim() === '') {
      return 'Username is required'
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters'
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens'
    }
    return ''
  }

  /* ── ✅ Handle username change with validation ── */
  const handleUsernameChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/\s/g, '')
    setFormData(p => ({ ...p, username: cleanValue }))
    
    // Clear error when typing
    if (usernameError) {
      setUsernameError('')
    }
  }

  /* ── Avatar upload ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setUploadingAvatar(true)
    try {
      const url = await uploadToCloudinary(file, 'avatars')
      setFormData(p => ({ ...p, avatar_url: url }))
      toast.success('Photo uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploadingAvatar(false) }
  }

  /* ── Banner upload ── */
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return }
    setUploadingBanner(true)
    try {
      const url = await uploadToCloudinary(file, 'banners')
      setFormData(p => ({ ...p, banner_url: url }))
      toast.success('Banner uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploadingBanner(false) }
  }

  /* ── ✅ SAVE WITH VALIDATION ── */
  const handleSave = async () => {
    // ✅ Validate username before saving
    const validationError = validateUsername(formData.username)
    if (validationError) {
      setUsernameError(validationError)
      toast.info(validationError)
      return
    }

    setSaving(true)
    setUsernameError('')

    try {
      const data = await profileService.updateProfile(formData)
      setUser(data.profile)
      setOriginalUsername(data.profile.username) // ✅ Update original username
      setEditing(false)
      toast.success('Profile updated! ✅')
    } catch (err: any) {
      console.error('Profile update error:', err)
      
      // ✅ Handle specific error responses
      const errorMessage = err.response?.data?.error || err.message
      
      if (err.response?.status === 409 || errorMessage.includes('already taken')) {
        setUsernameError('This username is already taken')
        toast.error('This username is already taken. Please choose another one.')
      } else if (errorMessage.includes('required')) {
        setUsernameError('Username is required')
        toast.info('Please enter a username')
      } else if (errorMessage.includes('3-20 characters')) {
        setUsernameError(errorMessage)
        toast.error(errorMessage)
      } else {
        toast.error('Failed to update profile. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  /* ── Cancel editing ── */
  const handleCancel = () => {
    setEditing(false)
    setUsernameError('') // ✅ Clear errors
    profileService.getProfile().then(data => {
      setFormData({
        full_name:  data.profile?.full_name  ?? '',
        username:   data.profile?.username   ?? '',
        phone:      data.profile?.phone      ?? '',
        bio:        data.profile?.bio        ?? '',
        avatar_url: data.profile?.avatar_url ?? '',
        banner_url: data.profile?.banner_url ?? '',
      })
    })
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          <span className="text-sm font-medium text-[#6b7280] font-body">
            Loading profile…
          </span>
        </div>
      </div>
    )
  }

  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer
  const RoleIcon   = roleConfig.icon
  const initials   = formData.full_name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                  || email?.charAt(0)?.toUpperCase()
                  || 'U'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700&display=swap');
        
        .font-display { font-family: 'Montserrat', sans-serif; }
        .font-body    { font-family: 'Open Sans', sans-serif; }

        .pp-root * { box-sizing: border-box; }
        .pp-root { font-family: 'Open Sans', sans-serif; }
        .pp-root button, .pp-root a, .pp-root [role="button"], .pp-root label, .pp-root [class*="cursor-pointer"] { cursor: pointer !important; }

        /* ── Field shared styles ── */
        .pp-field {
          width: 100%;
          background: white;
          border: 1px solid rgba(196,181,253,0.4);
          border-radius: 16px;
          padding: 0.875rem 1rem;
          color: #1e1b4b;
          font-size: 0.875rem;
          font-family: 'Open Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          caret-color: #7C3AED;
        }
        .pp-field::placeholder { color: #9ca3af; }
        .pp-field:focus {
          border-color: #7C3AED;
          background: white;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .pp-field:disabled {
          background: #f9fafb;
          border-color: rgba(196,181,253,0.25);
          color: #6b7280;
          cursor: not-allowed !important;
        }
        .pp-field.error {
          border-color: rgba(239,68,68,0.6);
        }
        .pp-field.error:focus {
          border-color: rgba(239,68,68,0.8);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        /* ── Section card ── */
        .pp-card {
          background: white;
          border: 1px solid rgba(196,181,253,0.3);
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(124,58,237,0.08);
        }

        /* ── Divider ── */
        .pp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(196,181,253,0.4), transparent);
        }

        /* ── Animate sections in ── */
        @keyframes ppFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp-s1 { animation: ppFadeUp 0.5s 0.0s both; }
        .pp-s2 { animation: ppFadeUp 0.5s 0.1s both; }
        .pp-s3 { animation: ppFadeUp 0.5s 0.2s both; }
        .pp-s4 { animation: ppFadeUp 0.5s 0.3s both; }

        /* ── Label ── */
        .pp-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        /* ── Primary action button ── */
        .pp-btn-primary {
          display: flex; align-items: center; gap: 8px;
          padding: 0.75rem 1.5rem;
          background: #7C3AED; color: white;
          font-size: 0.875rem; font-weight: 700;
          border-radius: 16px; border: none;
          font-family: 'Open Sans', sans-serif;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(124,58,237,0.25);
        }
        .pp-btn-primary:hover:not(:disabled) {
          background: #6D28D9;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(124,58,237,0.35);
        }
        .pp-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .pp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed !important; }

        /* ── Ghost button ── */
        .pp-btn-ghost {
          display: flex; align-items: center; gap: 8px;
          padding: 0.75rem 1.5rem;
          background: rgba(196,181,253,0.1);
          border: 1px solid rgba(196,181,253,0.3);
          color: #7C3AED;
          font-size: 0.875rem; font-weight: 700;
          border-radius: 16px;
          font-family: 'Open Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .pp-btn-ghost:hover { 
          background: rgba(196,181,253,0.2); 
          border-color: rgba(124,58,237,0.4);
        }

        /* ── Info stat tile ── */
        .pp-stat {
          background: rgba(196,181,253,0.05);
          border: 1px solid rgba(196,181,253,0.2);
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }
        .pp-stat:hover { 
          border-color: rgba(124,58,237,0.3);
          box-shadow: 0 4px 12px rgba(124,58,237,0.1);
        }

        /* Banner upload btn */
        .pp-banner-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 0.75rem 1.25rem;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(196,181,253,0.3);
          color: #7C3AED;
          font-size: 0.875rem; font-weight: 700;
          border-radius: 16px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .pp-banner-btn:hover { 
          background: white;
          border-color: #7C3AED;
          transform: translateY(-1px);
        }

        /* ✅ Error message */
        .pp-error {
          display: flex; align-items: center; gap: 6px;
          color: #ef4444;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .pp-root {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .pp-card {
            border-radius: 20px;
          }
          .pp-field {
            padding: 0.75rem;
            border-radius: 12px;
          }
          .pp-btn-primary, .pp-btn-ghost {
            padding: 0.625rem 1.25rem;
            border-radius: 12px;
          }
        }
      `}</style>

      <div className="pp-root w-full min-h-screen" style={{ background: '#FAF5FF' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

          {/* ══ Page header ══════════════════════════════ */}
          <div className="pp-s1 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e1b4b] leading-tight">
                My Profile
              </h1>
              <p className="text-base sm:text-lg mt-2 text-[#6b7280]">
                Manage your personal information and account settings
              </p>
            </div>

            {!editing ? (
              <button onClick={() => setEditing(true)} className="pp-btn-primary">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={handleCancel} className="pp-btn-ghost">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="pp-btn-primary">
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* ══ Profile card (banner + avatar + name) ═══ */}
          <div className="pp-s2 pp-card overflow-hidden">

            {/* ── Banner ── */}
            <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
              }}>
              {formData.banner_url && (
                <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
              )}

              {/* Decorative elements */}
              {!formData.banner_url && (
                <>
                  <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/15 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
                </>
              )}

              {/* Editing overlay */}
              {editing && (
                <div className="absolute inset-0 flex items-center justify-center gap-4"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                  <button
                    onClick={() => bannerRef.current?.click()}
                    disabled={uploadingBanner}
                    className="pp-banner-btn"
                  >
                    {uploadingBanner
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Camera className="w-4 h-4" />}
                    {formData.banner_url ? 'Change Banner' : 'Add Banner'}
                  </button>
                  {formData.banner_url && (
                    <button
                      onClick={() => setFormData(p => ({ ...p, banner_url: '' }))}
                      className="pp-banner-btn"
                      style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              )}
              <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />

              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.1), transparent)' }} />
            </div>

            {/* ── Avatar + name row ── */}
            <div className="px-6 sm:px-8 lg:px-10 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 mb-6 gap-4">

                {/* Avatar */}
                <div className="relative shrink-0 self-center sm:self-auto">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-3xl overflow-hidden shadow-2xl"
                    style={{ border: '4px solid white' }}>
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
                        <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-black">{initials}</span>
                      </div>
                    )}
                  </div>

                  {editing && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                      <button
                        onClick={() => avatarRef.current?.click()}
                        disabled={uploadingAvatar}
                        title="Upload photo"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all bg-[#7C3AED] hover:bg-[#6D28D9] hover:scale-105"
                      >
                        {uploadingAvatar
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Camera className="w-4 h-4" />}
                      </button>
                      {formData.avatar_url && (
                        <button
                          onClick={() => setFormData(p => ({ ...p, avatar_url: '' }))}
                          title="Remove photo"
                          className="w-10 h-10 bg-red-500 hover:bg-red-600 hover:scale-105 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>

                {/* Role badge */}
                <span className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border self-center sm:self-auto mb-2',
                  roleConfig.bg, roleConfig.color
                )}>
                  <RoleIcon className="w-4 h-4" />
                  {roleConfig.label}
                </span>
              </div>

              {/* Name / username / bio */}
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e1b4b] leading-tight">
                  {formData.full_name || (
                    <span className="text-[#9ca3af] italic text-xl">
                      No name set
                    </span>
                  )}
                </h2>
                {formData.username && (
                  <p className="text-lg font-semibold text-[#7C3AED]">
                    @{formData.username}
                  </p>
                )}
                {formData.bio && (
                  <p className="text-base leading-relaxed pt-2 text-[#6b7280] max-w-2xl">
                    {formData.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ══ Main Content Grid ══════════════════════ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* ══ Personal information form ════════════════ */}
            <div className="pp-s3 pp-card p-6 sm:p-8 space-y-6 xl:col-span-2">

              {/* Section title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1e1b4b]">Personal Information</h3>
              </div>

              <div className="pp-divider" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div>
                  <label className="pp-label">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    disabled={!editing}
                    placeholder="Your full name"
                    className="pp-field"
                  />
                </div>

                {/* ✅ Username with validation */}
                <div>
                  <label className="pp-label">
                    <AtSign className="w-3.5 h-3.5" /> Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => handleUsernameChange(e.target.value)}
                    disabled={!editing}
                    placeholder="yourname"
                    className={cn('pp-field', usernameError && 'error')}
                  />
                  {usernameError && (
                    <p className="pp-error">
                      <AlertCircle className="w-4 h-4" />
                      {usernameError}
                    </p>
                  )}
                </div>

                {/* Email — always read-only */}
                <div>
                  <label className="pp-label">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="pp-field pr-12"
                    />
                    <CheckCircle
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-[#7C3AED]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="pp-label">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    disabled={!editing}
                    placeholder="+92 300 0000000"
                    className="pp-field"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="pp-label">
                  <FileText className="w-3.5 h-3.5" /> Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  disabled={!editing}
                  placeholder="Tell people a little about yourself…"
                  rows={4}
                  maxLength={200}
                  className="pp-field resize-none"
                />
                {editing && (
                  <p className="text-right text-xs mt-2 text-[#9ca3af]">
                    {formData.bio.length}/200
                  </p>
                )}
              </div>
            </div>

            {/* ══ Account details sidebar ══════════════════════════ */}
            <div className="pp-s4 pp-card p-6 sm:p-8 space-y-6 xl:col-span-1">

              {/* Section title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#1e1b4b]">Account Details</h3>
              </div>

              <div className="pp-divider" />

              <div className="space-y-6">

                {/* Account type */}
                <div className="pp-stat">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#9ca3af]">
                    Account Type
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: roleConfig.dot }} />
                    <p className={cn('font-bold text-base', roleConfig.color)}>{roleConfig.label}</p>
                  </div>
                </div>

                {/* Member since */}
                <div className="pp-stat">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#9ca3af]">
                    Member Since
                  </p>
                  <p className="text-[#1e1b4b] font-bold text-base">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>

                {/* Email verified status */}
                <div className="pp-stat">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3 text-[#9ca3af]">
                    Verification Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                      style={{
                        background: 'rgba(124,58,237,0.1)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        color: '#7C3AED',
                      }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Email Verified
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
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

/* ── Role config — colours updated to match site palette ── */
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; icon: any }> = {
  super_admin:      { label: 'Super Admin',      color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/30',              dot: '#f87171', icon: Shield },
  platform_admin:   { label: 'Platform Admin',   color: 'text-orange-400',       bg: 'bg-orange-500/10 border-orange-500/30',         dot: '#fb923c', icon: Shield },
  operations_admin: { label: 'Operations Admin', color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/30',         dot: '#facc15', icon: Shield },
  business_owner:   { label: 'Retailer',         color: 'text-[#408A71]',        bg: 'bg-[#285A48]/25 border-[#408A71]/30',           dot: '#408A71', icon: Store },
  customer:         { label: 'Customer',         color: 'text-[#B0E4CC]',        bg: 'bg-[#285A48]/20 border-[#408A71]/25',           dot: '#B0E4CC', icon: ShoppingBag },
  courier:          { label: 'Courier',          color: 'text-purple-400',       bg: 'bg-purple-500/10 border-purple-500/30',         dot: '#c084fc', icon: User },
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
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#408A71' }} />
          <span className="text-sm font-medium" style={{ color: 'rgba(176,228,204,0.45)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pp-root * { box-sizing: border-box; }
        .pp-root, .pp-root button, .pp-root a { cursor: pointer !important; }
        .pp-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── Field shared styles ── */
        .pp-field {
          width: 100%;
          background: rgba(22,36,32,0.6);
          border: 1px solid rgba(40,90,72,0.35);
          border-radius: 12px;
          padding: 0.6rem 0.875rem;
          color: #B0E4CC;
          font-size: 0.875rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          caret-color: #408A71;
        }
        .pp-field::placeholder { color: rgba(176,228,204,0.22); }
        .pp-field:focus {
          border-color: #408A71;
          background: rgba(22,36,32,0.95);
          box-shadow: 0 0 0 3px rgba(64,138,113,0.15);
        }
        .pp-field:disabled {
          background: rgba(13,28,25,0.5);
          border-color: rgba(40,90,72,0.18);
          color: rgba(176,228,204,0.35);
          cursor: not-allowed !important;
        }
        .pp-field.error {
          border-color: rgba(239,68,68,0.5);
        }
        .pp-field.error:focus {
          border-color: rgba(239,68,68,0.7);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
        }

        /* ── Section card ── */
        .pp-card {
          background: linear-gradient(145deg, rgba(13,28,25,0.95) 0%, rgba(10,21,18,0.98) 100%);
          border: 1px solid rgba(40,90,72,0.28);
          border-radius: 20px;
        }

        /* ── Divider ── */
        .pp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(40,90,72,0.4), transparent);
        }

        /* ── Animate sections in ── */
        @keyframes ppFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp-s1 { animation: ppFadeUp 0.4s 0.00s both; }
        .pp-s2 { animation: ppFadeUp 0.4s 0.07s both; }
        .pp-s3 { animation: ppFadeUp 0.4s 0.14s both; }
        .pp-s4 { animation: ppFadeUp 0.4s 0.21s both; }

        /* ── Label ── */
        .pp-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: rgba(176,228,204,0.45);
          margin-bottom: 0.4rem;
        }

        /* ── Primary action button ── */
        .pp-btn-primary {
          display: flex; align-items: center; gap: 6px;
          padding: 0.55rem 1.1rem;
          background: #408A71; color: #fff;
          font-size: 0.8rem; font-weight: 800;
          border-radius: 12px; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
          box-shadow: 0 4px 14px rgba(64,138,113,0.3);
        }
        .pp-btn-primary:hover:not(:disabled) {
          background: #4eaa85;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(64,138,113,0.38);
        }
        .pp-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .pp-btn-primary:disabled { opacity: 0.55; cursor: not-allowed !important; }

        /* ── Ghost button ── */
        .pp-btn-ghost {
          display: flex; align-items: center; gap: 6px;
          padding: 0.55rem 1.1rem;
          background: rgba(40,90,72,0.2);
          border: 1px solid rgba(40,90,72,0.35);
          color: rgba(176,228,204,0.6);
          font-size: 0.8rem; font-weight: 700;
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .pp-btn-ghost:hover { background: rgba(40,90,72,0.35); color: #B0E4CC; }

        /* ── Info stat tile ── */
        .pp-stat {
          background: rgba(22,36,32,0.7);
          border: 1px solid rgba(40,90,72,0.25);
          border-radius: 14px;
          padding: 1rem;
          transition: border-color 0.2s ease;
        }
        .pp-stat:hover { border-color: rgba(64,138,113,0.4); }

        /* Banner upload btn */
        .pp-banner-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 0.5rem 1rem;
          background: rgba(9,20,19,0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(176,228,204,0.2);
          color: #B0E4CC;
          font-size: 0.78rem; font-weight: 700;
          border-radius: 12px;
          transition: background 0.18s ease;
        }
        .pp-banner-btn:hover { background: rgba(40,90,72,0.6); }

        /* ✅ Error message */
        .pp-error {
          display: flex; align-items: center; gap: 6px;
          color: #f87171;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.375rem;
        }
      `}</style>

      <div className="pp-root max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">

        {/* ══ Page header ══════════════════════════════ */}
        <div className="pp-s1 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              My Profile
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(176,228,204,0.42)' }}>
              Manage your personal information
            </p>
          </div>

          {!editing ? (
            <button onClick={() => setEditing(true)} className="pp-btn-primary">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleCancel} className="pp-btn-ghost">
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="pp-btn-primary">
                {saving
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* ══ Profile card (banner + avatar + name) ═══ */}
        <div className="pp-s2 pp-card overflow-hidden">

          {/* ── Banner ── */}
          <div className="relative h-36 sm:h-44 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #285A48 0%, #162420 60%, #091413 100%)',
            }}>
            {formData.banner_url && (
              <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
            )}

            {/* Decorative rings */}
            {!formData.banner_url && (
              <>
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border border-[#408A71]/15 pointer-events-none" />
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-[#408A71]/10 pointer-events-none" />
              </>
            )}

            {/* Editing overlay */}
            {editing && (
              <div className="absolute inset-0 flex items-center justify-center gap-3"
                style={{ background: 'rgba(9,20,19,0.55)', backdropFilter: 'blur(2px)' }}>
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
                    style={{ borderColor: 'rgba(239,68,68,0.35)', color: '#f87171' }}
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            )}
            <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(13,28,25,0.9), transparent)' }} />
          </div>

          {/* ── Avatar + name row ── */}
          <div className="px-5 sm:px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-5 gap-3">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-2xl"
                  style={{ border: '3px solid #091413' }}>
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #285A48 0%, #1a3d2e 100%)' }}>
                      <span className="text-[#B0E4CC] text-2xl sm:text-3xl font-black">{initials}</span>
                    </div>
                  )}
                </div>

                {editing && (
                  <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    <button
                      onClick={() => avatarRef.current?.click()}
                      disabled={uploadingAvatar}
                      title="Upload photo"
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-lg transition-all"
                      style={{ background: '#408A71' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#4eaa85')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#408A71')}
                    >
                      {uploadingAvatar
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Camera className="w-3 h-3" />}
                    </button>
                    {formData.avatar_url && (
                      <button
                        onClick={() => setFormData(p => ({ ...p, avatar_url: '' }))}
                        title="Remove photo"
                        className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              {/* Role badge */}
              <span className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mb-1 shrink-0',
                roleConfig.bg, roleConfig.color
              )}>
                <RoleIcon className="w-3 h-3" />
                {roleConfig.label}
              </span>
            </div>

            {/* Name / username / bio */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}>
                {formData.full_name || (
                  <span style={{ color: 'rgba(176,228,204,0.28)', fontStyle: 'italic', fontSize: '1rem' }}>
                    No name set
                  </span>
                )}
              </h2>
              {formData.username && (
                <p className="text-sm font-medium" style={{ color: '#408A71' }}>
                  @{formData.username}
                </p>
              )}
              {formData.bio && (
                <p className="text-sm leading-relaxed pt-1" style={{ color: 'rgba(176,228,204,0.55)' }}>
                  {formData.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ══ Personal information form ════════════════ */}
        <div className="pp-s3 pp-card p-5 sm:p-6 space-y-5">

          {/* Section title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #285A48, #1a3d2e)',
                border: '1px solid rgba(64,138,113,0.35)',
              }}>
              <User className="w-4 h-4" style={{ color: '#B0E4CC' }} />
            </div>
            <h3 className="text-white font-bold text-base">Personal Information</h3>
          </div>

          <div className="pp-divider" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Full Name */}
            <div>
              <label className="pp-label">
                <User className="w-3 h-3" /> Full Name
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
                <AtSign className="w-3 h-3" /> Username <span style={{ color: '#f87171' }}>*</span>
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
                  <AlertCircle className="w-3.5 h-3.5" />
                  {usernameError}
                </p>
              )}
            </div>

            {/* Email — always read-only */}
            <div>
              <label className="pp-label">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="pp-field"
                  style={{ paddingRight: '2.5rem' }}
                />
                <CheckCircle
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#408A71' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="pp-label">
                <Phone className="w-3 h-3" /> Phone
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
              <FileText className="w-3 h-3" /> Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
              disabled={!editing}
              placeholder="Tell people a little about yourself…"
              rows={3}
              maxLength={200}
              className="pp-field resize-none"
            />
            {editing && (
              <p className="text-right text-xs mt-1" style={{ color: 'rgba(176,228,204,0.28)' }}>
                {formData.bio.length}/200
              </p>
            )}
          </div>
        </div>

        {/* ══ Account details ══════════════════════════ */}
        <div className="pp-s4 pp-card p-5 sm:p-6 space-y-5">

          {/* Section title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #285A48, #1a3d2e)',
                border: '1px solid rgba(64,138,113,0.35)',
              }}>
              <Shield className="w-4 h-4" style={{ color: '#B0E4CC' }} />
            </div>
            <h3 className="text-white font-bold text-base">Account Details</h3>
          </div>

          <div className="pp-divider" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Account type */}
            <div className="pp-stat">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(176,228,204,0.35)' }}>
                Account Type
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: roleConfig.dot }} />
                <p className={cn('font-bold text-sm', roleConfig.color)}>{roleConfig.label}</p>
              </div>
            </div>

            {/* Member since */}
            <div className="pp-stat">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(176,228,204,0.35)' }}>
                Member Since
              </p>
              <p className="text-white font-bold text-sm">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>

            {/* Email verified */}
            <div className="pp-stat sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(176,228,204,0.35)' }}>
                Email Address
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-semibold text-sm break-all">{email}</p>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0"
                  style={{
                    background: 'rgba(64,138,113,0.15)',
                    border: '1px solid rgba(64,138,113,0.3)',
                    color: '#408A71',
                  }}>
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}
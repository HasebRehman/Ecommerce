'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Save, Loader2, Mail, Phone,
  FileText, AtSign, Shield, Store,
  ShoppingBag, User, X, Edit3, CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { profileService } from '@/lib/services/profile.service'
import { cn } from '@/lib/utils'

const ROLE_CONFIG: Record<string, { label: string, color: string, bg: string, icon: any }> = {
  super_admin:      { label: 'Super Admin',      color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       icon: Shield },
  platform_admin:   { label: 'Platform Admin',   color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: Shield },
  operations_admin: { label: 'Operations Admin', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Shield },
  business_owner:   { label: 'Retailer',         color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',     icon: Store },
  customer:         { label: 'Customer',         color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',   icon: ShoppingBag },
  courier:          { label: 'Courier',          color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: User },
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

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

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
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

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

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await profileService.updateProfile(formData)
      // ✅ Sync avatar to topbar immediately
      setUser(data.profile)
      setEditing(false)
      toast.success('Profile updated! ✅')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    // reload original data
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer
  const RoleIcon   = roleConfig.icon
  const initials   = formData.full_name?.charAt(0)?.toUpperCase() ?? email?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* ── Banner ── */}
        <div className="relative h-36 bg-gradient-to-br from-blue-700 via-blue-600 to-slate-800">
          {formData.banner_url && (
            <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}

          {/* Banner overlay buttons — only in edit mode */}
          {editing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
              <button
                onClick={() => bannerRef.current?.click()}
                disabled={uploadingBanner}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-medium rounded-xl transition-colors border border-white/30"
              >
                {uploadingBanner
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Camera className="w-4 h-4" />
                }
                {formData.banner_url ? 'Change Banner' : 'Add Banner'}
              </button>
              {formData.banner_url && (
                <button
                  onClick={() => setFormData(p => ({ ...p, banner_url: '' }))}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/70 hover:bg-red-500/90 backdrop-blur text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          )}
          <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
        </div>

        {/* ── Avatar + Name ── */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-5">

            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-xl">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                )}
              </div>

              {/* Avatar action buttons — only in edit mode */}
              {editing && (
                <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-1">
                  <button
                    onClick={() => avatarRef.current?.click()}
                    disabled={uploadingAvatar}
                    title="Upload photo"
                    className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors"
                  >
                    {uploadingAvatar
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Camera className="w-3 h-3" />
                    }
                  </button>
                  {formData.avatar_url && (
                    <button
                      onClick={() => setFormData(p => ({ ...p, avatar_url: '' }))}
                      title="Remove photo"
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>

            {/* Role Badge */}
            <span className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border mb-1',
              roleConfig.bg, roleConfig.color
            )}>
              <RoleIcon className="w-3 h-3" />
              {roleConfig.label}
            </span>
          </div>

          {/* Name + username + bio preview */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              {formData.full_name || <span className="text-slate-500 italic">No name set</span>}
            </h2>
            {formData.username && (
              <p className="text-slate-400 text-sm">@{formData.username}</p>
            )}
            {formData.bio && (
              <p className="text-slate-300 text-sm leading-relaxed mt-2">{formData.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Form ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-semibold">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
              disabled={!editing}
              placeholder="Your full name"
              className={cn(
                'w-full h-10 px-3 rounded-xl text-sm outline-none transition-all',
                editing
                  ? 'bg-slate-800 border border-slate-600 focus:border-blue-500 text-white'
                  : 'bg-slate-800/40 border border-slate-800 text-slate-400 cursor-not-allowed'
              )}
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
              <AtSign className="w-3.5 h-3.5" /> Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData(p => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
              disabled={!editing}
              placeholder="yourname"
              className={cn(
                'w-full h-10 px-3 rounded-xl text-sm outline-none transition-all',
                editing
                  ? 'bg-slate-800 border border-slate-600 focus:border-blue-500 text-white'
                  : 'bg-slate-800/40 border border-slate-800 text-slate-400 cursor-not-allowed'
              )}
            />
          </div>

          {/* Email — always read-only */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-10 px-3 pr-9 rounded-xl text-sm outline-none bg-slate-800/40 border border-slate-800 text-slate-400 cursor-not-allowed"
              />
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              disabled={!editing}
              placeholder="+92 300 0000000"
              className={cn(
                'w-full h-10 px-3 rounded-xl text-sm outline-none transition-all',
                editing
                  ? 'bg-slate-800 border border-slate-600 focus:border-blue-500 text-white'
                  : 'bg-slate-800/40 border border-slate-800 text-slate-400 cursor-not-allowed'
              )}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
            <FileText className="w-3.5 h-3.5" /> Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
            disabled={!editing}
            placeholder="Tell people a little about yourself..."
            rows={3}
            maxLength={200}
            className={cn(
              'w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all',
              editing
                ? 'bg-slate-800 border border-slate-600 focus:border-blue-500 text-white'
                : 'bg-slate-800/40 border border-slate-800 text-slate-400 cursor-not-allowed'
            )}
          />
          {editing && (
            <p className="text-slate-600 text-xs text-right">{formData.bio.length}/200</p>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-semibold">Account Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-slate-500 text-xs mb-1">Account Type</p>
            <p className={cn('font-semibold text-sm', roleConfig.color)}>{roleConfig.label}</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-slate-500 text-xs mb-1">Member Since</p>
            <p className="text-white font-semibold text-sm">
              {createdAt
                ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : '—'
              }
            </p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl col-span-2">
            <p className="text-slate-500 text-xs mb-1">Email Address</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-medium text-sm">{email}</p>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Save, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { profileService } from '@/lib/services/profile.service'
import { useAuthStore } from '@/store/authStore'

interface ProfileFormData {
  full_name: string
  username: string
  phone: string
  bio: string
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { user, setUser } = useAuthStore()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>()

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile()
        reset({
          full_name: data.profile?.full_name ?? '',
          username:  data.profile?.username  ?? '',
          phone:     data.profile?.phone     ?? '',
          bio:       data.profile?.bio       ?? '',
        })
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setIsFetching(false)
      }
    }
    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const result = await profileService.updateProfile(data)
      setUser(result.profile)
      toast.success('Profile updated successfully!')
      reset(data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Update your personal information</p>
      </div>

      {/* Avatar Section */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-white font-medium">{user?.full_name}</p>
              <p className="text-slate-400 text-sm">Profile picture coming in v1.1</p>
              <button className="text-blue-400 text-sm hover:text-blue-300 mt-1">
                Change avatar (soon)
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            This information will be displayed on your public profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-slate-200">Full Name</Label>
              <Input
                placeholder="Hassan Ahmed"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('full_name', { required: 'Full name is required' })}
              />
              {errors.full_name && (
                <p className="text-red-400 text-xs">{errors.full_name.message}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label className="text-slate-200">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                <Input
                  placeholder="hassan_ahmed"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-8"
                  {...register('username')}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-slate-200">Phone Number</Label>
              <Input
                placeholder="+92 300 1234567"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                {...register('phone')}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label className="text-slate-200">Bio</Label>
              <Textarea
                placeholder="Tell us a little about yourself..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                rows={3}
                {...register('bio')}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  )
}

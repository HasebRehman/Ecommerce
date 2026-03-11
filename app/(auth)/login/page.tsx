'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { createResolver } from '@/lib/validations/resolver'

const ROLE_REDIRECTS: Record<string, string> = {
  super_admin:      '/super-admin/dashboard',
  platform_admin:   '/platform-admin/dashboard',
  operations_admin: '/operations-admin/dashboard',
  business_owner:   '/dashboard',
  courier:          '/rider/dashboard',
  customer:         '/account',
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setRole, setSubRoles } = useAuthStore()

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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Step 1: Call login API endpoint
      await authService.login(data)

      // Step 2: Get user profile + role from API
      const userData = await authService.getMe()

      // Step 3: Save to global Zustand store
      setUser(userData.profile)
      setRole(userData.role)
      setSubRoles(userData.subRoles)

      toast.success(`Welcome back, ${userData.profile.full_name}!`)

      // Step 4: Redirect based on role
      const redirectTo = ROLE_REDIRECTS[userData.role] ?? '/account'
      router.push(redirectTo)
      router.refresh()

    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          <LogIn className="w-6 h-6 text-blue-400" />
          Welcome Back
        </CardTitle>
        <CardDescription className="text-slate-400">
          Sign in to your VendoSphere account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="hassan@example.com"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>

        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : 'Sign In'}
          </Button>

          <p className="text-slate-400 text-sm text-center">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one free
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'

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

import { signupSchema, type SignupFormData } from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { createResolver } from '@/lib/validations/resolver'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: createResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const result = await authService.signup(data)
      toast.success(result.message || 'Account created!')
      router.push('/login?signup=success')
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
          <UserPlus className="w-6 h-6 text-blue-400" />
          Create Account
        </CardTitle>
        <CardDescription className="text-slate-400">
          Join VendoSphere — it's free to get started
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-slate-200">
              Full Name
            </Label>
            <Input
              id="full_name"
              placeholder="Hassan Ahmed"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-red-400 text-xs">{errors.full_name.message}</p>
            )}
          </div>

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
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
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

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-slate-200">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 pr-10"
                {...register('confirm_password')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirm
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-400 text-xs">{errors.confirm_password.message}</p>
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
                Creating account...
              </>
            ) : 'Create Account'}
          </Button>

          <p className="text-slate-400 text-sm text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
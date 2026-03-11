import { z } from 'zod'

const baseSignupSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z
    .string()
    .min(1, 'Please confirm your password'),
})

export const signupSchema = baseSignupSchema.refine(
  (data) => data.password === data.confirm_password,
  {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  }
)

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
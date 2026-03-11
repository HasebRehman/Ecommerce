'use server'

import { createClient } from '@/lib/supabase/server'
import type { SignupFormData, LoginFormData } from '@/lib/validations/auth.schema'

// ── SIGNUP ──────────────────────────────────────────────
export async function signupAction(data: SignupFormData) {
  try {
    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    })

    console.log('Signup result:', authData)
    console.log('Signup error:', error)

    if (error) {
      return { error: error.message }
    }

    return { success: true, message: 'Check your email to verify your account!' }

  } catch (err) {
    console.error('Signup catch error:', err)
    return { error: String(err) }
  }
}

// ── LOGIN ───────────────────────────────────────────────
export async function loginAction(data: LoginFormData) {
  try {
    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    console.log('Login result:', authData)
    console.log('Login error:', error)

    if (error) {
      return { error: error.message }
    }

    return { success: true }

  } catch (err) {
    console.error('Login catch error:', err)
    return { error: String(err) }
  }
}

// ── LOGOUT ──────────────────────────────────────────────
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

// ── GET CURRENT USER WITH ROLE ───────────────────────────
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return {
      profile,
      role: roleRecord?.role ?? 'customer',
      subRoles: roleRecord?.sub_roles ?? [],
    }

  } catch (err) {
    console.error('getCurrentUser error:', err)
    return null
  }
}
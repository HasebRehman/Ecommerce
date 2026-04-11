import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()

    // Create user via admin client to avoid trigger issues
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so user can login immediately
      user_metadata: { full_name },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const userId = data.user.id

    // Manually create profile row
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)

    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id:         userId,
        full_name:  full_name.trim(),
        username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile insert fails — user is already created
    }

    // Manually create user_roles row
    const { error: roleError } = await adminSupabase
      .from('user_roles')
      .upsert({
        user_id:     userId,
        role:        'customer',
        sub_roles:   [],
        is_active:   true,
        assigned_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (roleError) {
      console.error('Role creation error:', roleError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please login.',
    })

  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

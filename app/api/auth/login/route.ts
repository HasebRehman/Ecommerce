import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth.schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data
    const supabase = await createClient()
    const adminSupabase = createAdminSupabaseClient()

    // Check if account is active before attempting login
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === email)

    if (authUser) {
      const { data: roleRecord } = await adminSupabase
        .from('user_roles')
        .select('is_active')
        .eq('user_id', authUser.id)
        .single()

      if (roleRecord && roleRecord.is_active === false) {
        return NextResponse.json(
          { error: 'Your account has been deactivated by the admin. Please contact support.' },
          { status: 403 }
        )
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
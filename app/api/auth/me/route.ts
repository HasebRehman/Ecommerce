import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Force logout if account has been deactivated
    if (roleRecord && roleRecord.is_active === false) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Your account has been deactivated by the admin. Please contact support.' },
        { status: 403 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      profile,
      role: roleRecord?.role ?? 'customer',
      subRoles: roleRecord?.sub_roles ?? [],
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
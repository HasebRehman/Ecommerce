import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role, sub_roles')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      profile,
      email:    user.email,
      role:     roleRecord?.role,
      subRoles: roleRecord?.sub_roles ?? [],
    })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, username, phone, bio, avatar_url, banner_url } = await request.json()

    // ✅ VALIDATE USERNAME IS PROVIDED
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // ✅ VALIDATE USERNAME FORMAT (3-20 chars, alphanumeric + _ -)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(username.trim())) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens' },
        { status: 400 }
      )
    }

    // ✅ CHECK IF USERNAME IS ALREADY TAKEN BY ANOTHER USER
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username.trim())
      .neq('id', user.id) // Exclude current user
      .maybeSingle() // Use maybeSingle() instead of single()

    // Handle database errors (not "no rows found")
    if (checkError) {
      console.error('Username check error:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate username' },
        { status: 500 }
      )
    }

    // ✅ IF ANOTHER USER HAS THIS USERNAME, REJECT
    if (existingUser) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 409 }
      )
    }

    // ✅ UPDATE PROFILE
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name:  full_name?.trim()  || null,
        username:   username.trim(),
        phone:      phone?.trim()      || null,
        bio:        bio?.trim()        || null,
        avatar_url: avatar_url         || null,
        banner_url: banner_url         || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      
      // ✅ HANDLE UNIQUE CONSTRAINT VIOLATION (backup check)
      if (error.code === '23505' && error.message.includes('username')) {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      profile,
      message: 'Profile updated successfully!',
    })

  } catch (err: any) {
    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
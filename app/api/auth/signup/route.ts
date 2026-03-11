import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations/auth.schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Signup body received:', body)

    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      console.log('Validation failed:', validation.error.errors)
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, full_name } = validation.data
    console.log('Attempting signup for:', email)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    })

    console.log('Supabase signup data:', JSON.stringify(data, null, 2))
    console.log('Supabase signup error:', error)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Check if user was actually created
    if (!data.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account created! You can now sign in.',
        userId: data.user.id
      },
      { status: 201 }
    )

  } catch (err) {
    console.error('Signup catch error:', err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
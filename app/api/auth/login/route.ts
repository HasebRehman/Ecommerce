import { createClient } from '@/lib/supabase/server'
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
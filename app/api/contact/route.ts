import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { name, email, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Insert contact message into database
    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error inserting contact message:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
    })

  } catch (err) {
    console.error('POST /api/contact error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

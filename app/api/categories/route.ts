import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — fetch all categories
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ categories })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST — create custom category
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const { data: category, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Category already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ category })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
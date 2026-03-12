import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: shop, error } = await supabase
      .from('shops')
      .select(`
        *,
        shop_products(
          product_id,
          products(
            id, name, price, discount_price,
            images, stock, is_active
          )
        )
      `)
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (error || !shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ shop })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: existing } = await supabase
      .from('shops')
      .select('id, owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: shop, error } = await supabase
      .from('shops')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      shop,
      message: 'Shop updated successfully!',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing } = await supabase
      .from('shops')
      .select('id, owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Shop deleted successfully!' })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
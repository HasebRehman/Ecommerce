import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    console.log('PUT product body:', body)

    // Clean up the body — remove undefined/null keys that shouldn't overwrite
    const updateData: any = {}
    if (body.name        !== undefined) updateData.name         = body.name
    if (body.description !== undefined) updateData.description  = body.description
    if (body.price       !== undefined) updateData.price        = Number(body.price)
    if (body.discount_price !== undefined) updateData.discount_price = body.discount_price ? Number(body.discount_price) : null
    if (body.stock       !== undefined) updateData.stock        = Number(body.stock)
    if (body.sku         !== undefined) updateData.sku          = body.sku
    if (body.category_id !== undefined) updateData.category_id  = body.category_id
    if (body.images      !== undefined) updateData.images       = body.images
    if (body.is_active   !== undefined) updateData.is_active    = body.is_active
    updateData.updated_at = new Date().toISOString()

    console.log('Update data:', updateData)

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      console.log('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ product, message: 'Product updated!' })
  } catch (err: any) {
    console.error('PUT product error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('products').delete().eq('id', id).eq('owner_id', user.id)
    return NextResponse.json({ message: 'Product deleted!' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`*, categories(id, name)`)
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT — update product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .select(`*, categories(id, name)`)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      product,
      message: 'Product updated successfully!',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE — delete product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Product deleted successfully!' })

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
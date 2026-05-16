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

    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .is('deleted_at', null)  // Only get non-deleted shops
      .single()

    if (error || !shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    return NextResponse.json({ shop })
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
    
    // Prevent updating deleted shops
    const { data: existingShop } = await supabase
      .from('shops')
      .select('deleted_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()
    
    if (existingShop?.deleted_at) {
      return NextResponse.json({ error: 'Cannot update a deleted shop' }, { status: 400 })
    }
    
    const { data: shop, error } = await supabase
      .from('shops').update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id).eq('owner_id', user.id)
      .is('deleted_at', null)  // Only update non-deleted shops
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ shop, message: 'Shop updated!' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // First, verify the shop belongs to the user
    const { data: shop, error: fetchError } = await supabase
      .from('shops')
      .select('id, owner_id, deleted_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    if (fetchError || !shop) {
      return NextResponse.json({ error: 'Shop not found or unauthorized' }, { status: 404 })
    }

    // Check if already deleted
    if (shop.deleted_at) {
      return NextResponse.json({ error: 'Shop is already deleted' }, { status: 400 })
    }

    // SOFT DELETE: Set deleted_at timestamp instead of removing the record
    // This preserves the shop data for order history while hiding it from public view
    const { error: deleteError } = await supabase
      .from('shops')
      .update({ 
        deleted_at: new Date().toISOString(),
        status: 'draft',      // Set to draft so it won't show even if deleted_at is somehow null
        is_active: false      // Ensure it's not active
      })
      .eq('id', id)
      .eq('owner_id', user.id)

    if (deleteError) {
      console.error('Error soft deleting shop:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Shop deleted successfully!' })
  } catch (err) {
    console.error('Shop deletion error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
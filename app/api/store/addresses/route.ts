import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    return NextResponse.json({ addresses: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, phone, address, city, label, is_default } = await request.json()

    if (!full_name || !phone || !address || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check duplicate — same phone + address + city
    const { data: existing } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', user.id)
      .ilike('address', address.trim())
      .ilike('city',    city.trim())
      .ilike('phone',   phone.trim())

    if (existing?.length) {
      return NextResponse.json({
        duplicate:  true,
        address_id: existing[0].id,
        message:    'Address already saved',
      })
    }

    // If setting default — unset others
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id:    user.id,
        full_name:  full_name.trim(),
        phone:      phone.trim(),
        address:    address.trim(),
        city:       city.trim(),
        label:      label ?? 'Home',
        is_default: is_default ?? false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ address: data, message: 'Address saved!' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
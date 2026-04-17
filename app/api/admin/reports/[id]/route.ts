import { createClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: roleRecord } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).single()
  if (!roleRecord || !ADMIN_ROLES.includes(roleRecord.role)) return null
  return user
}

// Get single report details (admin only)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const admin = await checkAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        id, reason, message, media_urls, status, created_at,
        user_id,
        shops(id, name, logo_url, owner_id),
        products(id, name, images)
      `)
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    const shopData = Array.isArray(report.shops) ? report.shops[0] : report.shops
    const sellerId = shopData?.owner_id ?? null

    // Fetch profiles
    const [{ data: reporter }, { data: reporterRole }, { data: seller }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, username, avatar_url, phone').eq('id', report.user_id).single(),
      supabase.from('user_roles').select('role').eq('user_id', report.user_id).single(),
      sellerId
        ? supabase.from('profiles').select('id, full_name, username, avatar_url, phone').eq('id', sellerId).single()
        : Promise.resolve({ data: null }),
    ])

    // Fetch emails via admin client
    let reporterEmail: string | null = null
    let sellerEmail:   string | null = null
    try {
      const adminClient = createAdminSupabaseClient()
      const [rRes, sRes] = await Promise.all([
        adminClient.auth.admin.getUserById(report.user_id),
        sellerId ? adminClient.auth.admin.getUserById(sellerId) : Promise.resolve({ data: { user: null } }),
      ])
      reporterEmail = rRes.data?.user?.email ?? null
      sellerEmail   = sRes.data?.user?.email ?? null
    } catch { /* emails stay null */ }

    return NextResponse.json({
      report: {
        ...report,
        shops: shopData,
        reporter: reporter ? { ...reporter, email: reporterEmail, role: reporterRole?.role || 'customer' } : null,
        seller:   seller   ? { ...seller,   email: sellerEmail   } : null,
      }
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Take action on a report (admin only) — one-time only
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const admin = await checkAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { action } = body

    if (!action || !['neglect', 'warning', 'ban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get report + current status + seller id
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, status, reason, message, product_id, shops(id, owner_id)')
      .eq('id', id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Block if action already taken (status is no longer 'delivered')
    if (report.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Action already taken on this report. No further actions allowed.' },
        { status: 409 }
      )
    }

    const shopData = Array.isArray(report.shops) ? report.shops[0] : report.shops
    const sellerId = shopData?.owner_id ?? null

    const statusMap: Record<string, string> = {
      neglect: 'neglected',
      warning: 'warning_issued',
      ban:     'seller_banned',
    }

    // Update report status
    const { error: updateError } = await supabase
      .from('reports')
      .update({ status: statusMap[action] })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Warning: send a system message, store in seller_warnings, and send notification
    if (action === 'warning' && sellerId) {
      const adminClient = createAdminSupabaseClient()

      // 1. Admin message
      const { error: msgError } = await supabase
        .from('admin_messages')
        .insert({
          sender_id:   admin.id,
          receiver_id: sellerId,
          message:     'You have received a warning regarding a report submitted against your shop. Please review your products and ensure compliance with our platform policies.',
        })
      if (msgError) console.error('Warning message insert failed:', msgError.message)

      // 2. Store warning record for seller warnings page
      const { error: warnError } = await adminClient
        .from('seller_warnings')
        .insert({
          seller_id:  sellerId,
          report_id:  id,
          shop_id:    shopData?.id ?? null,
          product_id: report.product_id ?? null,
          reason:     report.reason,
          message:    report.message,
        })
      if (warnError) console.error('seller_warnings insert failed:', warnError.message)

      // 3. Real-time notification to seller
      const { error: notifError } = await adminClient
        .from('notifications')
        .insert({
          user_id:  sellerId,
          title:    '⚠️ Warning Issued',
          message:  'Admin has issued a warning on your shop. Please review your products and comply with platform policies.',
          type:     'warning',
          order_id: null,
        })
      if (notifError) console.error('Warning notification insert failed:', notifError.message)
    }

    // Ban: mark seller as banned + invalidate sessions
    if (action === 'ban' && sellerId) {
      console.log('🔴 Starting ban process for seller:', sellerId)
      
      const adminClient = createAdminSupabaseClient()
      
      // Step 1: Ban the user
      console.log('🔴 Step 1: Updating user_roles.is_banned = true')
      const { data: banData, error: banError } = await adminClient
        .from('user_roles')
        .update({ is_banned: true })
        .eq('user_id', sellerId)
        .select()
      
      if (banError) {
        console.error('❌ CRITICAL: Failed to ban user:', {
          error: banError,
          message: banError.message,
          details: banError.details,
          hint: banError.hint,
          code: banError.code
        })
        return NextResponse.json({ 
          error: `Failed to ban user: ${banError.message}. This may be an RLS policy issue. Check server logs.` 
        }, { status: 500 })
      }
      
      if (!banData || banData.length === 0) {
        console.error('❌ CRITICAL: Update returned no rows. User may not exist or RLS is blocking.')
        return NextResponse.json({ 
          error: 'Failed to ban user: No rows updated. Check if user exists and RLS policies allow service role updates.' 
        }, { status: 500 })
      }
      
      console.log('✅ User banned successfully:', banData)

      // Step 2: Update shops
      console.log('🔴 Step 2: Setting shops to draft/inactive')
      const { data: shopsData, error: shopsError } = await adminClient
        .from('shops')
        .update({ status: 'draft', is_active: false })
        .eq('owner_id', sellerId)
        .select()
      
      if (shopsError) {
        console.error('❌ Failed to update shops:', {
          error: shopsError,
          message: shopsError.message,
          details: shopsError.details
        })
      } else {
        console.log('✅ Shops updated:', shopsData?.length || 0, 'shops affected')
      }

      // Step 3: Sign out user
      console.log('🔴 Step 3: Signing out user from all devices')
      try {
        const signOutResult = await adminClient.auth.admin.signOut(sellerId, 'global')
        console.log('✅ User signed out successfully:', signOutResult)
      } catch (err: any) {
        console.error('❌ Failed to sign out user:', {
          error: err,
          message: err?.message,
          stack: err?.stack
        })
      }
      
      console.log('✅ Ban process completed for seller:', sellerId)
    }

    return NextResponse.json({
      message: 'Action applied successfully',
      status:  statusMap[action],
    })
  } catch (err: any) {
    console.error('PATCH /admin/reports/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

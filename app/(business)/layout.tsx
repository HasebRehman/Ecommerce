import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessLayoutClient from './layout-client'

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: roleRecord } = await supabase
    .from('user_roles')
    .select('role, sub_roles')
    .eq('user_id', user.id)
    .single()

  if (roleRecord?.role !== 'business_owner') {
    redirect('/account')
  }

  return (
    <BusinessLayoutClient subRoles={roleRecord?.sub_roles ?? []}>
      {children}
    </BusinessLayoutClient>
  )
}
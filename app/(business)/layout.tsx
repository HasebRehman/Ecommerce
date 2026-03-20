import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessSidebar from '@/components/layout/BusinessSidebar'
import DashboardTopbar from '@/components/layout/DashboardTopbar'

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
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <BusinessSidebar subRoles={roleRecord?.sub_roles ?? []} />
        <main className="flex-1 ml-64 min-h-screen flex flex-col">
          <DashboardTopbar variant="business" />
          <div className="p-6 flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
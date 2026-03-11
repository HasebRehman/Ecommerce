import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/layout/AdminSidebar'

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: roleRecord } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!ADMIN_ROLES.includes(roleRecord?.role)) {
    redirect('/account')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
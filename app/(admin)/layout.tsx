import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin role
  const { data: roleRecord } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const adminRoles = [
    'super_admin',
    'platform_admin',
    'operations_admin',
  ]

  if (!adminRoles.includes(roleRecord?.role)) {
    redirect('/account')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <AdminSidebar role={roleRecord?.role} />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
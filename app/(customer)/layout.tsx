import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerSidebar from '@/components/layout/CustomerSidebar'

// Roles NOT allowed in customer area
const ADMIN_ROLES = ['super_admin', 'platform_admin', 'operations_admin']

// Where admins should go instead
const ADMIN_HOME: Record<string, string> = {
  super_admin:       '/super-admin/dashboard',
  platform_admin:    '/platform-admin/dashboard',
  operations_admin:  '/operations-admin/dashboard',
}

export default async function CustomerLayout({
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

  const role = roleRecord?.role ?? 'customer'

  // Admins should not see customer layout
  if (ADMIN_ROLES.includes(role)) {
    redirect(ADMIN_HOME[role] ?? '/super-admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <CustomerSidebar />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
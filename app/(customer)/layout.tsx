import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerSidebar from '@/components/layout/CustomerSidebar'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
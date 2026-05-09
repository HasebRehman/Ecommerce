import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  super_admin:      'bg-red-500/15 text-red-600 border-red-500/25',
  platform_admin:   'bg-orange-500/15 text-orange-600 border-orange-500/25',
  operations_admin: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25',
  business_owner:   'bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/25',
  courier:          'bg-green-500/15 text-green-600 border-green-500/25',
  customer:         'bg-blue-500/15 text-blue-600 border-blue-500/25',
}

interface Props {
  users: any[]
  canViewAll?: boolean
}

export default function RecentUsers({ users, canViewAll = true }: Props) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-display { font-family: 'Montserrat', sans-serif; }
        .font-body    { font-family: 'Open Sans', sans-serif; }
      `}</style>
      
      <div 
        className="font-body bg-white border border-[#C4B5FD]/30 rounded-2xl overflow-hidden shadow-xl shadow-[#7C3AED]/15"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(196,181,253,0.12) 0%, transparent 70%), white',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#C4B5FD]/20">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-1.5 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/10">
              Latest
            </span>
            <h3 className="font-display text-xl tracking-tight font-bold text-[#1e1b4b]">
              Recent Users
            </h3>
          </div>
          {canViewAll && (
            <Link
              href="/admin/users"
              className="group flex items-center gap-1.5 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-bold transition-colors duration-200 cursor-pointer"
            >
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {users.length === 0 ? (
            <p className="text-[#6b7280] text-sm text-center py-8 font-medium">
              No users yet
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user: any) => {
                const role = user.user_roles?.[0]?.role ?? 'customer'
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#EDE9FE]/40 transition-all duration-200 border border-transparent hover:border-[#C4B5FD]/30"
                  >
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      }}
                    >
                      {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1e1b4b] text-base font-bold truncate font-display">
                        {user.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-[#6b7280] text-xs font-medium mt-0.5">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs font-bold capitalize shrink-0 px-3 py-1.5 rounded-lg border',
                      ROLE_COLORS[role]
                    )}>
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get role
  const { data: roleRecord } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const role = roleRecord?.role ?? 'customer'
  const subRoles = roleRecord?.sub_roles ?? []

  const stats = [
    { label: 'Total Orders',    value: '0',  icon: ShoppingBag, color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
    { label: 'Wishlist Items',  value: '0',  icon: Heart,       color: 'text-pink-400',   bg: 'bg-pink-400/10'   },
    { label: 'Saved Addresses', value: '0',  icon: MapPin,      color: 'text-green-400',  bg: 'bg-green-400/10'  },
  ]

  const quickLinks = [
    { label: 'Edit Profile',     href: '/account/profile',         desc: 'Update your personal info'    },
    { label: 'View Orders',      href: '/account/orders',          desc: 'Track your order history'     },
    { label: 'Manage Addresses', href: '/account/addresses',       desc: 'Add or update addresses'      },
    { label: 'Upgrade Account',  href: '/account/upgrade',         desc: 'Become a seller or supplier'  },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 capitalize">
            {role.replace('_', ' ')}
          </Badge>
          {subRoles.map((sub: string) => (
            <Badge
              key={sub}
              className="bg-purple-500/20 text-purple-400 border-purple-500/30 capitalize"
            >
              {sub}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bg)}>
                    <Icon className={cn('w-6 h-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Links */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all group"
            >
              <div>
                <p className="text-white text-sm font-medium">{link.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{link.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Upgrade Banner — only show for customers */}
      {role === 'customer' && (
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Want to sell on VendoSphere?
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Upgrade your account to become a Retailer, Supplier or Merchant
                </p>
              </div>
              <Link href="/account/upgrade">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                  Upgrade Now
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
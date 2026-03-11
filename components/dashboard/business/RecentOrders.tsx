import { ShoppingBag, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RecentOrders() {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-white text-base font-semibold">
          Recent Orders
        </CardTitle>
        <Link
          href="/dashboard/orders"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white text-sm font-medium">No orders yet</p>
          <p className="text-slate-400 text-xs mt-1">
            Orders will appear here once customers start buying
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
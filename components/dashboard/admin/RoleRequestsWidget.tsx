import { Clock, ArrowRight, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  pendingCount: number
}

export default function RoleRequestsWidget({ pendingCount }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-white text-base font-semibold">
          Role Requests
        </CardTitle>
        <Link
          href="/admin/role-requests"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {pendingCount === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">All caught up!</p>
            <p className="text-slate-400 text-xs mt-1">
              No pending requests
            </p>
          </div>
        ) : (
          <Link href="/admin/role-requests">
            <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    {pendingCount} pending
                  </p>
                  <p className="text-slate-400 text-xs">
                    Awaiting your review
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
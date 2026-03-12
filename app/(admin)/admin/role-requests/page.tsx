'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { adminService } from '@/lib/services/admin.service'

const STATUS_STYLES: Record<string, string> = {
  pending:      'bg-yellow-500/20 text-yellow-400',
  approved:     'bg-green-500/20 text-green-400',
  rejected:     'bg-red-500/20 text-red-400',
  under_review: 'bg-blue-500/20 text-blue-400',
}

export default function RoleRequestsPage() {
  const [requests, setRequests]     = useState<any[]>([])
  const [isLoading, setLoading]     = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const loadRequests = async () => {
    try {
      const data = await adminService.getRoleRequests()
      console.log('data', data);
      
      setRequests(data.requests ?? [])
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id)
    try {
      await adminService.reviewRoleRequest(id, action)
      toast.success(action === 'approve' ? 'Request approved!' : 'Request rejected.')
      loadRequests()
    } catch (err: any) {
      toast.error(err.message || 'Failed to process request')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Role Upgrade Requests</h1>
        <p className="text-slate-400 mt-1">Review and manage role requests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-white font-medium">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold shrink-0">
                      {req.profiles?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">
                        {req.profiles?.full_name ?? 'Unknown User'}
                      </p>
                      <p className="text-slate-400 text-sm mt-0.5">
                        Requesting:{' '}
                        <span className="text-blue-400 capitalize">
                          {req.requested_sub_role ?? req.requested_role}
                        </span>
                      </p>
                      {req.reason && (
                        <p className="text-slate-400 text-sm mt-2 bg-slate-800 rounded-lg p-3">
                          "{req.reason}"
                        </p>
                      )}
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <Badge className={STATUS_STYLES[req.status] ?? ''}>
                      {req.status}
                    </Badge>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={processing === req.id}
                          onClick={() => handleReview(req.id, 'approve')}
                          className="bg-green-500 hover:bg-green-600 text-white h-8"
                        >
                          {processing === req.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><CheckCircle className="w-3 h-3 mr-1" />Approve</>
                          }
                        </Button>
                        <Button
                          size="sm"
                          disabled={processing === req.id}
                          onClick={() => handleReview(req.id, 'reject')}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
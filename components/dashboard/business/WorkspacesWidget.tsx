import { Building2, Store, Warehouse, ArrowRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Workspace {
  id:   string
  name: string
  type: 'shop' | 'warehouse'
}

interface Props {
  workspaces: Workspace[]
}

export default function WorkspacesWidget({ workspaces }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-white text-base font-semibold">
          My Workspaces
        </CardTitle>
        <Link
          href="/workspaces"
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {workspaces.length === 0 ? (
          <div className="text-center py-6">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-white text-sm font-medium">No workspaces yet</p>
            <p className="text-slate-400 text-xs mt-1 mb-4">
              Create your first shop or warehouse
            </p>
            <Link href="/workspaces">
              <button className="flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mx-auto transition-colors">
                <Plus className="w-4 h-4" />
                Create Workspace
              </button>
            </Link>
          </div>
        ) : (
          workspaces.slice(0, 5).map((ws) => (
            <Link
              key={ws.id}
              href={`/workspaces/${ws.id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                ws.type === 'shop'
                  ? 'bg-blue-500/20'
                  : 'bg-green-500/20'
              )}>
                {ws.type === 'shop'
                  ? <Store className="w-4 h-4 text-blue-400" />
                  : <Warehouse className="w-4 h-4 text-green-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {ws.name}
                </p>
              </div>
              <Badge className={cn(
                'text-xs capitalize shrink-0',
                ws.type === 'shop'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400'
              )}>
                {ws.type}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
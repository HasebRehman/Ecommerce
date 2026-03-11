// app/(business)/workspaces/[id]/page.tsx
export default function WorkspaceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Workspace Detail</h1>
        <p className="text-slate-400 mt-1">ID: {params.id}</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <p className="text-slate-400">Workspace detail coming soon</p>
      </div>
    </div>
  )
}
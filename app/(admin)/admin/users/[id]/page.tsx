export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Detail</h1>
        <p className="text-slate-400 mt-1">User ID: {params.id}</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <p className="text-slate-400">User detail page coming soon</p>
      </div>
    </div>
  )
}
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Orders</h1>
        <p className="text-slate-400 mt-1">View and track your orders</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <p className="text-slate-400">No orders yet — start shopping!</p>
      </div>
    </div>
  )
}
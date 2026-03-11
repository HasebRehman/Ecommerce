export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Addresses</h1>
        <p className="text-slate-400 mt-1">Manage your delivery addresses</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <p className="text-slate-400">No addresses saved yet</p>
      </div>
    </div>
  )
}
import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">
          Vendo<span className="text-blue-400">Sphere</span>
        </h1>
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
        <p className="text-slate-400 text-sm">Loading your account...</p>
      </div>
    </div>
  )
}
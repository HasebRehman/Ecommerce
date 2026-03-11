import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Vendo<span className="text-blue-400">Sphere</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Multi-vendor commerce platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
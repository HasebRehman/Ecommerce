import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">
          Vendo<span className="text-blue-400">Sphere</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Multi-vendor commerce platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700 px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
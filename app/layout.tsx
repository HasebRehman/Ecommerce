import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/components/providers/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'VendoSphere',
    template: '%s | VendoSphere',
  },  
  description: 'Multi-vendor eCommerce platform with POS integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
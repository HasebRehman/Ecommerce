'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import DashboardTopbar from '@/components/layout/DashboardTopbar'

interface Props {
  children: React.ReactNode
}

export default function AdminLayoutClient({ children }: Props) {
  const [isCollapsed,     setIsCollapsed]     = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile,        setIsMobile]        = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(prev => !prev)
    } else {
      setIsCollapsed(prev => !prev)
    }
  }

  return (
    <div style={{ background: '#FAF5FF', minHeight: '100vh' }}>

      {/* Mobile overlay + sidebar */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <AdminSidebar isCollapsed={false} />
          </div>
        </>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        {!isMobile && (
          <AdminSidebar isCollapsed={isCollapsed} />
        )}

        <main
          className="flex-1 min-h-screen flex flex-col transition-all duration-300"
          style={{
            marginLeft: !isMobile ? (isCollapsed ? '5rem' : '16rem') : '0',
            minWidth: 0,
            maxWidth: '100vw',
            overflow: 'hidden',
          }}
        >
          <DashboardTopbar
            variant="admin"
            onToggleSidebar={handleToggleSidebar}
          />
          <div className="p-4 sm:p-6 flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

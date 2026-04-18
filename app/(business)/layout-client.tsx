'use client'

import { useState, useEffect } from 'react'
import BusinessSidebar from '@/components/layout/BusinessSidebar'
import DashboardTopbar from '@/components/layout/DashboardTopbar'

interface Props {
  children: React.ReactNode
  subRoles: string[]
}

export default function BusinessLayoutClient({ children, subRoles }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div style={{ background: '#FAF5FF', minHeight: '100vh' }}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <BusinessSidebar subRoles={subRoles} isCollapsed={false} />
          </div>
        </>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <BusinessSidebar subRoles={subRoles} isCollapsed={isCollapsed} />
        )}

        <main 
          className="flex-1 min-h-screen flex flex-col transition-all duration-300 w-full lg:w-auto"
          style={{ 
            marginLeft: !isMobile ? (isCollapsed ? '5rem' : '16rem') : '0'
          }}
        >
          <DashboardTopbar 
            variant="business" 
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

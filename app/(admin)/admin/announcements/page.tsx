'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Megaphone, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { announcementService } from '@/lib/services/announcement.service'
import AnnouncementCard from '@/components/announcements/AnnouncementCard'
import AddAnnouncementModal from '@/components/announcements/AddAnnouncementModal'
import type { Announcement } from '@/types'

const ALLOWED_ROLES = ['super_admin', 'platform_admin']

export default function AnnouncementsPage() {
  const router = useRouter()
  const { role } = useAuthStore()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [isModalOpen,   setIsModalOpen]   = useState(false)

  // Extra role guard — operations_admin is allowed by the admin layout but blocked here
  useEffect(() => {
    if (role && !ALLOWED_ROLES.includes(role)) {
      router.replace('/admin/dashboard')
    }
  }, [role, router])

  const loadAnnouncements = async () => {
    setIsLoading(true)
    try {
      const data = await announcementService.list()
      setAnnouncements(data)
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? err?.message ?? 'Failed to load announcements')
    } finally {
      setIsLoading(false)
    }
  }

  // Silent refresh without showing loading state
  const silentRefresh = async () => {
    try {
      const data = await announcementService.list()
      setAnnouncements(data)
    } catch {
      // Silent fail
    }
  }

  useEffect(() => {
    if (role && ALLOWED_ROLES.includes(role)) {
      loadAnnouncements()
      
      // Poll every 10 seconds to check for status updates
      const interval = setInterval(silentRefresh, 10000)
      return () => clearInterval(interval)
    }
  }, [role])

  const handleSuccess = (announcement: Announcement) => {
    setAnnouncements(prev => [announcement, ...prev])
  }

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .an-header { font-family: 'Montserrat', sans-serif; }
        .an-body   { font-family: 'Open Sans',   sans-serif; }
        a, button  { cursor: pointer !important; }

        .an-banner {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .an-btn-add {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border: none;
          border-radius: 12px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: white;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .an-btn-add:hover {
          background: linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }
        .an-btn-add:active { transform: translateY(0); }

        .an-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09);
          text-align: center;
        }
      `}</style>

      <div className="space-y-6">

        {/* ── Banner ── */}
        <div className="an-banner">
          <div>
            <h1 className="an-header" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2 }}>
              Announcements
            </h1>
            <p className="an-body" style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Create and schedule platform-wide announcements for specific user roles
            </p>
          </div>
          <button
            className="an-btn-add"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add Announcement
          </button>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: '#7C3AED' }} className="animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="an-empty">
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(196,181,253,0.2))',
              border: '1.5px solid rgba(196,181,253,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Megaphone style={{ width: '24px', height: '24px', color: '#7C3AED' }} />
            </div>
            <p className="an-header" style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '6px' }}>
              No announcements yet
            </p>
            <p className="an-body" style={{ fontSize: '13px', color: '#6b7280', maxWidth: '320px' }}>
              Click "Add Announcement" to create your first platform announcement.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {announcements.map(a => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}

      </div>

      {/* ── Modal ── */}
      <AddAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

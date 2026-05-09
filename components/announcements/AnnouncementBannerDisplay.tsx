'use client'

import { useState } from 'react'
import { X, Megaphone } from 'lucide-react'
import type { Announcement } from '@/types'

interface Props {
  announcements: Announcement[]
}

export default function AnnouncementBannerDisplay({ announcements }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Show only the latest published announcement (not dismissed)
  const latestAnnouncement = announcements
    .filter(a => !dismissed.has(a.id))
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0]

  if (!latestAnnouncement) return null

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;500;600&display=swap');
        .abd-header { font-family: 'Montserrat', sans-serif; }
        .abd-body   { font-family: 'Open Sans',   sans-serif; }

        @keyframes abdSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .abd-banner {
          background: linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(196,181,253,0.12) 100%);
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: abdSlideDown 0.3s cubic-bezier(0.22,1,0.36,1);
          position: relative;
        }

        .abd-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }

        .abd-dismiss {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(124,58,237,0.08);
          border: 1px solid rgba(196,181,253,0.4);
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .abd-dismiss:hover {
          background: rgba(124,58,237,0.15);
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
        <div className="abd-banner">

          {/* Icon */}
          <div className="abd-icon">
            <Megaphone style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="abd-header" style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', marginBottom: '3px' }}>
              {latestAnnouncement.subject}
            </p>
            <p className="abd-body" style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
              {latestAnnouncement.message}
            </p>
          </div>

          {/* Dismiss */}
          <button
            className="abd-dismiss"
            onClick={() => dismiss(latestAnnouncement.id)}
            aria-label="Dismiss announcement"
          >
            <X style={{ width: '13px', height: '13px' }} />
          </button>

        </div>
      </div>
    </>
  )
}

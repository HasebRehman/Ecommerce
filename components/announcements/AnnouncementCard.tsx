'use client'

import { format } from 'date-fns'
import { Calendar, Clock, Users } from 'lucide-react'
import type { Announcement } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  super_admin:       'Super Admin',
  platform_admin:    'Platform Admin',
  operations_admin:  'Ops Admin',
  business_owner:    'Seller',
  customer:          'Customer',
  courier:           'Courier',
}

interface Props {
  announcement: Announcement
}

export default function AnnouncementCard({ announcement }: Props) {
  const isPublished = announcement.status === 'published'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;500;600&display=swap');
        .ac-header { font-family: 'Montserrat', sans-serif; }
        .ac-body   { font-family: 'Open Sans',   sans-serif; }

        .ac-card {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          padding: 20px 22px;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .ac-card:hover {
          box-shadow: 0 8px 28px rgba(124,58,237,0.14), 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }

        .ac-badge-scheduled {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 11px;
          background: rgba(245,158,11,0.12);
          color: #d97706;
          border: 1px solid rgba(245,158,11,0.3);
          white-space: nowrap;
        }
        .ac-badge-published {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 11px;
          background: rgba(34,197,94,0.12);
          color: #16a34a;
          border: 1px solid rgba(34,197,94,0.3);
          white-space: nowrap;
        }
        .ac-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .ac-role-chip {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 999px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 10px;
          background: rgba(124,58,237,0.10);
          color: #7C3AED;
          border: 1px solid rgba(124,58,237,0.2);
          white-space: nowrap;
        }

        .ac-message {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="ac-card">
        {/* ── Top row: subject + status badge ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <h3 className="ac-header" style={{ fontSize: '15px', fontWeight: 700, color: '#1e1b4b', lineHeight: 1.3, flex: 1, minWidth: 0 }}>
            {announcement.subject}
          </h3>
          <span className={isPublished ? 'ac-badge-published' : 'ac-badge-scheduled'}>
            <span
              className="ac-badge-dot"
              style={{ background: isPublished ? '#16a34a' : '#d97706' }}
            />
            {isPublished ? 'Published' : 'Scheduled'}
          </span>
        </div>

        {/* ── Message preview ── */}
        <p className="ac-body ac-message" style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6, marginBottom: '14px' }}>
          {announcement.message}
        </p>

        {/* ── Meta row: date/time + target roles ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>

          {/* Date & time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span className="ac-body" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
              <Calendar style={{ width: '13px', height: '13px', color: '#A78BFA', flexShrink: 0 }} />
              {format(new Date(announcement.scheduled_at), 'MMM d, yyyy')}
            </span>
            <span className="ac-body" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6b7280' }}>
              <Clock style={{ width: '13px', height: '13px', color: '#A78BFA', flexShrink: 0 }} />
              {format(new Date(announcement.scheduled_at), 'h:mm a')}
            </span>
          </div>

          {/* Target role chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <Users style={{ width: '13px', height: '13px', color: '#A78BFA', flexShrink: 0 }} />
            {announcement.target_roles.map(role => (
              <span key={role} className="ac-role-chip">
                {ROLE_LABELS[role] ?? role}
              </span>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}

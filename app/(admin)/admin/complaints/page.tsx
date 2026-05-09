'use client'

import { useEffect, useState } from 'react'
import { Mail, Loader2, User, Calendar, CheckCircle, Circle } from 'lucide-react'
import { toast } from 'sonner'

interface Complaint {
  id: string
  name: string
  email: string
  message: string
  created_at: string
  read: boolean
  replied: boolean
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/complaints', {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.complaints) {
        setComplaints(data.complaints)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err)
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const toggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: !currentRead }),
        credentials: 'include',
      })

      if (res.ok) {
        setComplaints(prev =>
          prev.map(c => (c.id === id ? { ...c, read: !currentRead } : c))
        )
        toast.success(currentRead ? 'Marked as unread' : 'Marked as read')
      } else {
        toast.error('Failed to update status')
      }
    } catch (err) {
      console.error('Failed to update complaint:', err)
      toast.error('Failed to update status')
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const unreadCount = complaints.filter(c => !c.read).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .comp-header { font-family: 'Montserrat', sans-serif; }
        .comp-body   { font-family: 'Open Sans',   sans-serif; }
        
        .comp-card {
          background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.08);
          transition: all 0.2s ease;
        }
        .comp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }

        .comp-card-unread {
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.08));
          border: 1.5px solid rgba(124,58,237,0.4);
        }

        .comp-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Montserrat', sans-serif;
        }

        .comp-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .comp-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(124,58,237,0.2);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="space-y-6 comp-body">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl comp-header font-bold" style={{ color: '#1e1b4b' }}>
            Complaints
          </h1>
          <p className="mt-2 text-sm sm:text-base" style={{ color: '#6b7280' }}>
            View and manage contact form submissions from users
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="comp-badge" style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Mail style={{ width: '12px', height: '12px' }} />
            Total: {total}
          </div>
          <div className="comp-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Circle style={{ width: '12px', height: '12px' }} />
            Unread: {unreadCount}
          </div>
          <div className="comp-badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle style={{ width: '12px', height: '12px' }} />
            Read: {total - unreadCount}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#7C3AED' }} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="comp-card text-center py-12">
            <Mail style={{ width: '48px', height: '48px', color: '#C4B5FD', margin: '0 auto 16px' }} />
            <p className="comp-header font-bold" style={{ color: '#1e1b4b', marginBottom: '8px' }}>
              No complaints yet
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Contact form submissions will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className={complaint.read ? 'comp-card' : 'comp-card comp-card-unread'}
              >
                {/* Header with Name and Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                    >
                      <User style={{ width: '18px', height: '18px', color: 'white' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold comp-header truncate" style={{ color: '#1e1b4b' }}>
                        {complaint.name}
                      </h3>
                      <p className="text-xs truncate" style={{ color: '#6b7280' }}>
                        {complaint.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="comp-badge flex-shrink-0" style={{ 
                    background: complaint.read ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    color: complaint.read ? '#10B981' : '#EF4444',
                    border: `1px solid ${complaint.read ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {complaint.read ? (
                      <>
                        <CheckCircle style={{ width: '11px', height: '11px' }} />
                        Read
                      </>
                    ) : (
                      <>
                        <Circle style={{ width: '11px', height: '11px' }} />
                        Unread
                      </>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-3">
                  <h4 className="text-xs font-bold comp-header mb-2" style={{ color: '#7C3AED' }}>
                    MESSAGE
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: '#1e1b4b' }}>
                    {complaint.message}
                  </p>
                </div>

                {/* Footer with Date and Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'rgba(196,181,253,0.3)' }}>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#9ca3af' }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {new Date(complaint.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  <button
                    onClick={() => toggleRead(complaint.id, complaint.read)}
                    className="comp-btn"
                    style={{
                      background: complaint.read ? 'white' : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                      color: complaint.read ? '#7C3AED' : 'white',
                      borderColor: complaint.read ? '#7C3AED' : 'transparent',
                    }}
                  >
                    {complaint.read ? (
                      <>
                        <Circle style={{ width: '12px', height: '12px' }} />
                        Mark Unread
                      </>
                    ) : (
                      <>
                        <CheckCircle style={{ width: '12px', height: '12px' }} />
                        Mark Read
                      </>
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}

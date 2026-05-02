'use client'

import { useEffect, useState } from 'react'
import { Search, Loader2, Eye, Trash2, Users, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { adminService } from '@/lib/services/admin.service'
import api from '@/lib/axios'

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  super_admin:      { label: 'Super Admin',      bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)'   },
  platform_admin:   { label: 'Platform Admin',   bg: 'rgba(249,115,22,0.12)',  color: '#f97316', border: 'rgba(249,115,22,0.3)'  },
  operations_admin: { label: 'Operations Admin', bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04', border: 'rgba(234,179,8,0.3)'   },
  business_owner:   { label: 'Business Owner',   bg: 'rgba(124,58,237,0.12)',  color: '#7C3AED', border: 'rgba(124,58,237,0.3)'  },
  courier:          { label: 'Courier',          bg: 'rgba(34,197,94,0.12)',   color: '#16a34a', border: 'rgba(34,197,94,0.3)'   },
  customer:         { label: 'Customer',         bg: 'rgba(59,130,246,0.12)',  color: '#2563eb', border: 'rgba(59,130,246,0.3)'  },
}

const AVATAR_COLORS = [
  '#7C3AED','#6D28D9','#2563eb','#0891b2','#16a34a','#ca8a04','#dc2626','#db2777',
]
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

export default function AdminUsersPage() {

  const [users,      setUsers]      = useState<any[]>([])
  const [isLoading,  setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [pagination, setPagination] = useState<any>(null)
  const [page,       setPage]       = useState(1)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: any | null }>({ open: false, user: null })
  const [deleting,    setDeleting]    = useState(false)

  const loadUsers = async (searchTerm = '', currentPage = 1) => {
    setLoading(true)
    try {
      const data = await adminService.getUsers({ search: searchTerm, page: currentPage })
      setUsers(data.users ?? [])
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  useEffect(() => {
    const timer = setTimeout(() => { loadUsers(search, 1); setPage(1) }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleDeleteClick = (user: any) => {
    setDeleteModal({ open: true, user })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return
    setDeleting(true)
    try {
      await api.delete(`/api/admin/users/${deleteModal.user.id}`)
      toast.success('User deleted successfully')
      setDeleteModal({ open: false, user: null })
      loadUsers(search, page)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .au-header { font-family: 'Montserrat', sans-serif; }
        .au-body   { font-family: 'Open Sans',   sans-serif; }
        a, button  { cursor: pointer !important; }

        .au-card {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
          width: 100%;
        }

        .au-search-wrap {
          position: relative;
          width: 100%;
          max-width: 420px;
        }
        .au-search {
          width: 100%;
          height: 46px;
          padding: 0 16px 0 42px;
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 14px;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 8px rgba(124,58,237,0.06);
        }
        .au-search::placeholder { color: #9ca3af; }
        .au-search:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.10);
        }

        /* Table */
        .au-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .au-th {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #7C3AED;
          padding: 12px 14px;
          text-align: left;
          border-bottom: 1.5px solid rgba(196,181,253,0.4);
          white-space: nowrap;
          overflow: hidden;
          background: rgba(124,58,237,0.04);
        }
        .au-td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(196,181,253,0.25);
          vertical-align: middle;
          overflow: hidden;
        }
        .au-tr:last-child .au-td { border-bottom: none; }
        .au-tr { transition: background 0.15s ease; }
        .au-tr:hover { background: rgba(124,58,237,0.04); }

        /* Fixed column widths — add up to 100% */
        .au-col-user    { width: 28%; }
        .au-col-role    { width: 22%; }
        .au-col-email   { width: 26%; }
        .au-col-date    { width: 13%; }
        .au-col-time    { width: 11%; }
        .au-col-actions { width: 90px; }

        /* Hide columns progressively */
        @media (max-width: 1100px) {
          .au-col-time,
          .au-th.au-col-time,
          .au-td.au-col-time { display: none; }
          .au-col-user    { width: 30%; }
          .au-col-role    { width: 22%; }
          .au-col-email   { width: 28%; }
          .au-col-date    { width: 16%; }
        }
        @media (max-width: 860px) {
          .au-col-date,
          .au-th.au-col-date,
          .au-td.au-col-date { display: none; }
          .au-col-user  { width: 35%; }
          .au-col-role  { width: 28%; }
          .au-col-email { width: 37%; }
        }
        @media (max-width: 640px) {
          .au-col-email,
          .au-th.au-col-email,
          .au-td.au-col-email { display: none; }
          .au-col-user { width: 60%; }
          .au-col-role { width: 40%; }
        }

        /* Role badge */
        .au-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 11px;
          border: 1px solid;
          white-space: nowrap;
        }

        /* Action buttons */
        .au-btn-view {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: rgba(124,58,237,0.10);
          border: 1.5px solid rgba(196,181,253,0.5);
          color: #7C3AED;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .au-btn-view:hover {
          background: rgba(124,58,237,0.18);
          border-color: rgba(124,58,237,0.5);
        }
        .au-btn-del {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: rgba(239,68,68,0.08);
          border: 1.5px solid rgba(239,68,68,0.25);
          color: #ef4444;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .au-btn-del:hover {
          background: rgba(239,68,68,0.16);
          border-color: rgba(239,68,68,0.45);
        }

        /* Pagination */
        .au-page-btn {
          padding: 8px 18px;
          border-radius: 10px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 13px;
          border: 1.5px solid rgba(196,181,253,0.5);
          background: #EDE9FE;
          color: #7C3AED;
          transition: background 0.2s ease;
        }
        .au-page-btn:hover:not(:disabled) { background: #DDD6FE; }
        .au-page-btn:disabled { opacity: 0.45; cursor: not-allowed !important; }

        /* Delete Modal */
        .au-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }
        .au-modal {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border-radius: 24px;
          box-shadow: 0 24px 60px rgba(124,58,237,0.4), 0 8px 24px rgba(0,0,0,0.3);
          max-width: 480px;
          width: 100%;
          padding: 32px 28px;
          position: relative;
          z-index: 9999;
          animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .au-modal { padding: 24px 20px; }
        }
      `}</style>

      <div className="space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="au-header text-2xl sm:text-3xl font-bold text-[#1e1b4b]">All Users</h1>
          <p className="au-body text-[#6b7280] text-sm mt-1">
            {pagination?.total ?? 0} total users
          </p>
        </div>

        {/* ── Search ── */}
        <div className="au-search-wrap">
          <Search style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)',
            width: '16px', height: '16px', color: '#A78BFA', pointerEvents: 'none',
          }} />
          <input
            className="au-search"
            placeholder="Search users by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Table card ── */}
        <div className="au-card">
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 24px' }}>
              <Loader2 style={{ width: '32px', height: '32px', color: '#7C3AED' }} className="animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <Users style={{ width: '40px', height: '40px', color: '#C4B5FD', margin: '0 auto 12px' }} />
              <p className="au-body text-[#6b7280]">No users found</p>
            </div>
          ) : (
            <div>
              <table className="au-table">
                <thead>
                  <tr>
                    <th className="au-th au-col-user">User</th>
                    <th className="au-th au-col-role">Role</th>
                    <th className="au-th au-col-email">Email</th>
                    <th className="au-th au-col-date">Joined Date</th>
                    <th className="au-th au-col-time">Joined Time</th>
                    <th className="au-th au-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const role       = user.user_roles?.[0]?.role ?? 'customer'
                    const roleCfg    = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer
                    const joinedDate = new Date(user.created_at)
                    const initials   = user.full_name?.charAt(0)?.toUpperCase() ?? 'U'
                    const bgColor    = avatarColor(user.full_name ?? 'U')

                    return (
                      <tr key={user.id} className="au-tr">

                        {/* User */}
                        <td className="au-td au-col-user">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px', height: '38px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '2px solid rgba(196,181,253,0.5)',
                            }}>
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name ?? 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{
                                  width: '100%', height: '100%',
                                  background: bgColor,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white',
                                  fontFamily: "'Montserrat', sans-serif",
                                  fontWeight: 700,
                                  fontSize: '14px',
                                }}>
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p className="au-header text-[#1e1b4b] font-bold text-sm truncate">
                                {user.full_name ?? 'Unknown'}
                              </p>
                              <p className="au-body text-[#9ca3af] text-xs mt-0.5">
                                @{user.username ?? 'no username'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="au-td au-col-role">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              className="au-badge"
                              style={{ background: roleCfg.bg, color: roleCfg.color, borderColor: roleCfg.border }}
                            >
                              {roleCfg.label}
                            </span>
                            {user.user_roles?.[0]?.is_banned && (
                              <span
                                className="au-badge"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                              >
                                BANNED
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="au-td au-col-email">
                          <p className="au-body text-[#4c1d95] text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email ?? '—'}</p>
                        </td>

                        {/* Joined Date */}
                        <td className="au-td au-col-date">
                          <p className="au-body text-[#6b7280] text-sm">
                            {joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </td>

                        {/* Joined Time */}
                        <td className="au-td au-col-time">
                          <p className="au-body text-[#6b7280] text-sm">
                            {joinedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="au-td au-col-actions">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link href={`/admin/users/${user.id}`}>
                              <button className="au-btn-view">
                                <Eye style={{ width: '15px', height: '15px' }} />
                              </button>
                            </Link>
                            <button className="au-btn-del" onClick={() => handleDeleteClick(user)}>
                              <Trash2 style={{ width: '15px', height: '15px' }} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p className="au-body text-[#6b7280] text-sm">
              Page <span style={{ color: '#1e1b4b', fontWeight: 600 }}>{page}</span> of{' '}
              <span style={{ color: '#1e1b4b', fontWeight: 600 }}>{pagination.totalPages}</span>
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="au-page-btn"
                disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); loadUsers(search, p) }}
              >
                Previous
              </button>
              <button
                className="au-page-btn"
                disabled={page === pagination.totalPages}
                onClick={() => { const p = page + 1; setPage(p); loadUsers(search, p) }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.open && (
        <div className="au-modal-overlay" onClick={() => !deleting && setDeleteModal({ open: false, user: null })}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>

            {/* Close button */}
            <button
              onClick={() => setDeleteModal({ open: false, user: null })}
              disabled={deleting}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                opacity: deleting ? 0.5 : 1,
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>

            {/* Title */}
            <h2 className="au-header" style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: '12px',
              lineHeight: 1.2,
            }}>
              Delete this user?
            </h2>

            {/* Description */}
            <p className="au-body" style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}>
              <strong style={{ fontWeight: 700 }}>{deleteModal.user?.full_name || 'This user'}</strong> will be permanently removed from the system.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                disabled={deleting}
                className="au-header"
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  transition: 'background 0.2s ease',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="au-header"
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  background: deleting ? 'rgba(255,255,255,0.25)' : 'white',
                  border: 'none',
                  color: deleting ? 'rgba(124,58,237,0.6)' : '#7C3AED',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: deleting ? 'none' : '0 4px 16px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                {deleting && <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />}
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

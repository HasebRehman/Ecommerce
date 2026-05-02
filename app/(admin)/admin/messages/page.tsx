'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Admin {
  id:         string
  full_name:  string | null
  username:   string | null
  avatar_url: string | null
  role:       string
}

interface Message {
  id:          string
  sender_id:   string
  receiver_id: string
  message:     string
  is_read:     boolean
  created_at:  string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  super_admin:      'Super Admin',
  platform_admin:   'Platform Admin',
  operations_admin: 'Operations Admin',
}

const ROLE_COLOR: Record<string, string> = {
  super_admin:      '#ef4444',
  platform_admin:   '#f97316',
  operations_admin: '#ca8a04',
}

const AVATAR_COLORS = [
  '#7C3AED','#6D28D9','#2563eb','#0891b2','#16a34a','#ca8a04','#dc2626','#db2777',
]
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

function Avatar({ admin, size = 'md' }: { admin: Admin; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: '32px', md: '40px', lg: '48px' }
  const fontMap = { sm: '12px', md: '14px', lg: '16px' }
  const bgColor = ROLE_COLOR[admin.role] || avatarColor(admin.full_name ?? 'A')
  
  return (
    <div style={{
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      border: '2px solid rgba(196,181,253,0.4)',
    }}>
      {admin.avatar_url ? (
        <img src={admin.avatar_url} alt={admin.full_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          color: 'white',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: fontMap[size],
        }}>
          {admin.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
      )}
    </div>
  )
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminMessagesPage() {
  const { user }                          = useAuthStore()
  const [admins,       setAdmins]         = useState<Admin[]>([])
  const [selected,     setSelected]       = useState<Admin | null>(null)
  const [messages,     setMessages]       = useState<Message[]>([])
  const [input,        setInput]          = useState('')
  const [search,       setSearch]         = useState('')
  const [sending,      setSending]        = useState(false)
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [loadingMsgs,  setLoadingMsgs]   = useState(false)
  const [unreadMap,    setUnreadMap]      = useState<Record<string, number>>({})
  const [dbError,      setDbError]        = useState<string | null>(null)
  const bottomRef                         = useRef<HTMLDivElement>(null)
  const inputRef                          = useRef<HTMLInputElement>(null)
  const selectedRef                       = useRef<Admin | null>(null)

  // Keep ref in sync with state so realtime callback always has current value
  useEffect(() => { selectedRef.current = selected }, [selected])

  // ── Load admins + unread counts ───────────────────────────────────────────

  const loadAdmins = useCallback(async () => {
    try {
      const [adminsRes, unreadRes] = await Promise.all([
        api.get('/api/admin/admins'),
        api.get('/api/admin/messages'),
      ])
      setAdmins(adminsRes.data.admins ?? [])
      setUnreadMap(unreadRes.data.unreadMap ?? {})
      setDbError(null)
    } catch (err: any) {
      console.error('Error loading admins:', err)
      const errorMsg = err.response?.data?.error || err.message
      if (errorMsg?.includes('admin_messages') || errorMsg?.includes('relation') || errorMsg?.includes('does not exist')) {
        setDbError('Database table missing. Please run the migration.')
      }
    } finally {
      setLoadingAdmins(false)
    }
  }, [])

  useEffect(() => { loadAdmins() }, [loadAdmins])

  useEffect(() => {
    console.log('📬 Admin Messaging System')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('If messages are not sending, the database table may be missing.')
    console.log('📝 Setup instructions: See MESSAGING-SETUP.md')
    console.log('🧪 Test database: Run "node scripts/test-admin-messages-db.js"')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }, [])

  // ── Load conversation ─────────────────────────────────────────────────────

  const loadMessages = useCallback(async (adminId: string) => {
    setLoadingMsgs(true)
    try {
      const res = await api.get(`/api/admin/messages/${adminId}`)
      setMessages(res.data.messages ?? [])
      await api.patch(`/api/admin/messages/${adminId}`)
      setUnreadMap(prev => ({ ...prev, [adminId]: 0 }))
    } catch {
      // silent
    } finally {
      setLoadingMsgs(false)
    }
  }, [])

  const handleSelectAdmin = (admin: Admin) => {
    setSelected(admin)
    loadMessages(admin.id)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Realtime subscription ─────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    const channel = supabase
      .channel('admin-messages-realtime')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'admin_messages',
      }, (payload) => {
        const msg     = payload.new as Message
        const current = selectedRef.current

        if (
          current &&
          ((msg.sender_id === user.id      && msg.receiver_id === current.id) ||
           (msg.sender_id === current.id   && msg.receiver_id === user.id))
        ) {
          setMessages(prev => {
            const exists = prev.some(m => 
              m.id === msg.id || 
              (m.message === msg.message && 
               m.sender_id === msg.sender_id && 
               Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 2000)
            )
            
            if (exists) {
              return prev.map(m => 
                m.id.startsWith('temp-') && 
                m.message === msg.message && 
                m.sender_id === msg.sender_id
                  ? msg 
                  : m
              )
            }
            
            return [...prev, msg]
          })
          
          if (msg.receiver_id === user.id) {
            api.patch(`/api/admin/messages/${current.id}`).catch(() => {})
          }
        } else if (msg.receiver_id === user.id) {
          setUnreadMap(prev => ({
            ...prev,
            [msg.sender_id]: (prev[msg.sender_id] ?? 0) + 1,
          }))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || !selected || sending || !user) return
    const text = input.trim()
    setInput('')
    setSending(true)
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: selected.id,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    
    setMessages(prev => [...prev, optimisticMessage])
    
    try {
      const res = await api.post('/api/admin/messages', {
        receiver_id: selected.id,
        message:     text,
      })
      
      if (res.data?.message) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? res.data.message : msg
          )
        )
        console.log('✅ Message sent successfully:', res.data.message)
      }
    } catch (err: any) {
      console.error('❌ Failed to send message:', err)
      
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      setInput(text)
      
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error'
      
      if (errorMsg.includes('admin_messages') || errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
        alert('⚠️ Database table missing!\n\nThe admin_messages table needs to be created in your Supabase database.\n\nPlease run the SQL migration in:\nEcommerce/supabase-migrations/create-admin-messages-table.sql\n\nSee the README in that folder for instructions.')
      } else {
        alert(`Failed to send message:\n${errorMsg}`)
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Filtered admins ───────────────────────────────────────────────────────

  const filteredAdmins = admins.filter(a =>
    !search ||
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.username?.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = Object.values(unreadMap).reduce((s, n) => s + n, 0)


  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .msg-header { font-family: 'Montserrat', sans-serif; }
        .msg-body   { font-family: 'Open Sans',   sans-serif; }
        a, button  { cursor: pointer !important; }

        /* Hide scrollbar but keep functionality */
        .msg-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .msg-scroll::-webkit-scrollbar {
          display: none;
        }

        .msg-container {
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 20px;
          box-shadow: 0 4px 18px rgba(124,58,237,0.09), 0 1px 4px rgba(0,0,0,0.04);
          overflow: hidden;
          height: calc(100vh - 180px);
          min-height: 500px;
          display: flex;
        }

        .msg-sidebar {
          width: 320px;
          background: white;
          border-right: 1.5px solid rgba(196,181,253,0.35);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .msg-search {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 36px;
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif;
          font-size: 13px;
          color: #1e1b4b;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .msg-search::placeholder { color: #9ca3af; }
        .msg-search:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.10);
        }

        .msg-admin-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          border-left: 3px solid transparent;
        }
        .msg-admin-item:hover {
          background: rgba(124,58,237,0.06);
        }
        .msg-admin-item.active {
          background: rgba(124,58,237,0.10);
          border-left-color: #7C3AED;
        }

        .msg-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: 999px;
          background: #7C3AED;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 11px;
        }

        .msg-chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          min-width: 0;
        }

        .msg-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1.5px solid rgba(196,181,253,0.35);
          background: rgba(124,58,237,0.02);
        }

        .msg-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(to bottom, rgba(237,233,254,0.3) 0%, white 100%);
        }

        .msg-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          word-wrap: break-word;
        }
        .msg-bubble.mine {
          background: #7C3AED;
          color: white;
          border-bottom-right-radius: 4px;
          margin-left: auto;
        }
        .msg-bubble.theirs {
          background: #EDE9FE;
          color: #1e1b4b;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(196,181,253,0.4);
        }

        .msg-input-area {
          padding: 16px 20px;
          border-top: 1.5px solid rgba(196,181,253,0.35);
          background: rgba(124,58,237,0.02);
        }

        .msg-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #EDE9FE;
          border: 1.5px solid rgba(196,181,253,0.55);
          border-radius: 14px;
          padding: 10px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .msg-input-wrapper:focus-within {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.10);
        }

        .msg-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
        }
        .msg-input::placeholder { color: #9ca3af; }

        .msg-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .msg-send-btn.active {
          background: #7C3AED;
          color: white;
          box-shadow: 0 2px 8px rgba(124,58,237,0.3);
        }
        .msg-send-btn.active:hover {
          background: #6D28D9;
          box-shadow: 0 4px 12px rgba(124,58,237,0.4);
        }
        .msg-send-btn.disabled {
          background: rgba(196,181,253,0.3);
          color: #9ca3af;
          cursor: not-allowed !important;
        }

        .msg-error-banner {
          background: rgba(239,68,68,0.08);
          border: 1.5px solid rgba(239,68,68,0.25);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .msg-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          text-align: center;
          padding: 32px;
        }

        .msg-time-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 16px 0;
        }
        .msg-time-divider span {
          background: rgba(124,58,237,0.10);
          color: #7C3AED;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid rgba(124,58,237,0.2);
        }

        @media (max-width: 768px) {
          .msg-container {
            height: calc(100vh - 140px);
            flex-direction: column;
          }
          .msg-sidebar {
            width: 100%;
            max-height: 40%;
            border-right: none;
            border-bottom: 1.5px solid rgba(196,181,253,0.35);
          }
          .msg-chat-area {
            height: 60%;
          }
        }
      `}</style>

      {dbError && (
        <div className="msg-error-banner">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}>
              <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>!</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="msg-header" style={{ color: '#ef4444', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                Database Setup Required
              </h3>
              <p className="msg-body" style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
                The admin_messages table is missing from your database. Messages cannot be sent until this is fixed.
              </p>
              <div style={{
                background: 'rgba(30,27,75,0.05)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '12px',
                color: '#4c1d95',
                fontFamily: 'monospace',
              }}>
                <p style={{ marginBottom: '8px', fontWeight: 600 }}>📝 To fix this:</p>
                <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '8px' }}>
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Run the SQL in: <span style={{ color: '#7C3AED' }}>supabase-migrations/create-admin-messages-table.sql</span></li>
                  <li>Refresh this page</li>
                </ol>
                <p style={{ marginTop: '8px', color: '#6b7280' }}>
                  See <span style={{ color: '#7C3AED' }}>MESSAGING-SETUP.md</span> for detailed instructions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="msg-container">

        {/* Left panel: Admin list */}
        <div className="msg-sidebar">

          <div style={{ padding: '20px', borderBottom: '1.5px solid rgba(196,181,253,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 className="msg-header" style={{ color: '#1e1b4b', fontWeight: 800, fontSize: '18px' }}>Messages</h2>
              {totalUnread > 0 && (
                <span className="msg-badge">{totalUnread}</span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                color: '#A78BFA',
                pointerEvents: 'none',
              }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search admins..."
                className="msg-search"
              />
            </div>
          </div>

          <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {loadingAdmins ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                <Loader2 style={{ width: '24px', height: '24px', color: '#7C3AED' }} className="animate-spin" />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <p className="msg-body" style={{ color: '#9ca3af', fontSize: '14px' }}>No other admins found</p>
              </div>
            ) : (
              filteredAdmins.map(admin => {
                const unread    = unreadMap[admin.id] ?? 0
                const isActive  = selected?.id === admin.id
                return (
                  <button
                    key={admin.id}
                    onClick={() => handleSelectAdmin(admin)}
                    className={`msg-admin-item ${isActive ? 'active' : ''}`}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar admin={admin} size="md" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="msg-header" style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isActive ? '#7C3AED' : '#1e1b4b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {admin.full_name ?? 'Admin'}
                      </p>
                      <p className="msg-body" style={{
                        fontSize: '12px',
                        color: ROLE_COLOR[admin.role] ?? '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {ROLE_LABEL[admin.role] ?? admin.role}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="msg-badge" style={{ flexShrink: 0 }}>
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right panel: Chat area */}
        <div className="msg-chat-area">

          {!selected ? (
            <div className="msg-empty-state">
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(124,58,237,0.10)',
                border: '1.5px solid rgba(196,181,253,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MessageSquare style={{ width: '32px', height: '32px', color: '#7C3AED' }} />
              </div>
              <div>
                <p className="msg-header" style={{ color: '#1e1b4b', fontWeight: 700, fontSize: '16px' }}>
                  Select a conversation
                </p>
                <p className="msg-body" style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Choose an admin from the left to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="msg-chat-header">
                <Avatar admin={selected} size="md" />
                <div>
                  <p className="msg-header" style={{ color: '#1e1b4b', fontWeight: 700, fontSize: '15px' }}>
                    {selected.full_name ?? 'Admin'}
                  </p>
                  <p className="msg-body" style={{ fontSize: '12px', color: ROLE_COLOR[selected.role] ?? '#6b7280' }}>
                    {ROLE_LABEL[selected.role] ?? selected.role}
                  </p>
                </div>
              </div>

              <div className="msg-messages msg-scroll">
                {loadingMsgs ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Loader2 style={{ width: '32px', height: '32px', color: '#7C3AED' }} className="animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <p className="msg-body" style={{ color: '#9ca3af', fontSize: '14px' }}>
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMine    = msg.sender_id === user?.id
                      const prevMsg   = messages[i - 1]
                      const showGap   = !prevMsg || new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000
                      return (
                        <div key={msg.id}>
                          {showGap && (
                            <div className="msg-time-divider">
                              <span>{formatTime(msg.created_at)}</span>
                            </div>
                          )}
                          <div style={{
                            display: 'flex',
                            justifyContent: isMine ? 'flex-end' : 'flex-start',
                            marginBottom: '8px',
                          }}>
                            <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                              <div className="msg-body">{msg.message}</div>
                              <p className="msg-body" style={{
                                fontSize: '10px',
                                marginTop: '6px',
                                textAlign: 'right',
                                color: isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                              }}>
                                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              <div className="msg-input-area">
                <div className="msg-input-wrapper">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selected.full_name ?? 'admin'}...`}
                    className="msg-input"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className={`msg-send-btn ${input.trim() && !sending ? 'active' : 'disabled'}`}
                  >
                    {sending
                      ? <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                      : <Send style={{ width: '16px', height: '16px' }} />
                    }
                  </button>
                </div>
                <p className="msg-body" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>
                  Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

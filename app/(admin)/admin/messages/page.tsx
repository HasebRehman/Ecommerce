'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
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
  super_admin:      'text-red-400',
  platform_admin:   'text-orange-400',
  operations_admin: 'text-yellow-400',
}

const AVATAR_COLOR: Record<string, string> = {
  super_admin:      'bg-red-500',
  platform_admin:   'bg-orange-500',
  operations_admin: 'bg-yellow-500',
}

function Avatar({ admin, size = 'md' }: { admin: Admin; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'
  return (
    <div className={cn('rounded-full shrink-0 overflow-hidden', sz)}>
      {admin.avatar_url ? (
        <img src={admin.avatar_url} alt={admin.full_name ?? ''} className="w-full h-full object-cover" />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center text-white font-bold', AVATAR_COLOR[admin.role] ?? 'bg-blue-500')}>
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
      setDbError(null) // Clear any previous errors
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

  // Log helpful setup info on mount
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
      // Mark as read
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
        const current = selectedRef.current   // always fresh, no stale closure

        if (
          current &&
          ((msg.sender_id === user.id      && msg.receiver_id === current.id) ||
           (msg.sender_id === current.id   && msg.receiver_id === user.id))
        ) {
          // Belongs to the open conversation
          setMessages(prev => {
            // Check if message already exists (from optimistic update)
            const exists = prev.some(m => 
              m.id === msg.id || 
              (m.message === msg.message && 
               m.sender_id === msg.sender_id && 
               Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 2000)
            )
            
            if (exists) {
              // Replace temporary message with real one
              return prev.map(m => 
                m.id.startsWith('temp-') && 
                m.message === msg.message && 
                m.sender_id === msg.sender_id
                  ? msg 
                  : m
              )
            }
            
            // New message from other user - append it
            return [...prev, msg]
          })
          
          // Mark read if we're the receiver
          if (msg.receiver_id === user.id) {
            api.patch(`/api/admin/messages/${current.id}`).catch(() => {})
          }
        } else if (msg.receiver_id === user.id) {
          // Different conversation — bump unread badge
          setUnreadMap(prev => ({
            ...prev,
            [msg.sender_id]: (prev[msg.sender_id] ?? 0) + 1,
          }))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])   // ← no `selected` dep — we use selectedRef instead

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || !selected || sending || !user) return
    const text = input.trim()
    setInput('') // Clear immediately for better UX
    setSending(true)
    
    // Create optimistic message (appears instantly)
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      sender_id: user.id,
      receiver_id: selected.id,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    
    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, optimisticMessage])
    
    try {
      const res = await api.post('/api/admin/messages', {
        receiver_id: selected.id,
        message:     text,
      })
      
      if (res.data?.message) {
        // Replace optimistic message with real one from database
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? res.data.message : msg
          )
        )
        console.log('✅ Message sent successfully:', res.data.message)
      }
    } catch (err: any) {
      console.error('❌ Failed to send message:', err)
      
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      setInput(text) // restore on failure
      
      // Better error messages
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
    <div className="h-[calc(100vh-120px)] flex flex-col">
      
      {/* Database Error Banner */}
      {dbError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold text-sm mb-1">Database Setup Required</h3>
              <p className="text-red-300/80 text-sm mb-2">
                The admin_messages table is missing from your database. Messages cannot be sent until this is fixed.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-300 font-mono">
                <p className="mb-2">📝 To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Run the SQL in: <span className="text-blue-400">supabase-migrations/create-admin-messages-table.sql</span></li>
                  <li>Refresh this page</li>
                </ol>
                <p className="mt-2 text-slate-400">See <span className="text-blue-400">MESSAGING-SETUP.md</span> for detailed instructions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">

      {/* ── Left panel: Admin list ── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-slate-800">

        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Messages</h2>
            {totalUnread > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search admins..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Admin list */}
        <div className="flex-1 overflow-y-auto">
          {loadingAdmins ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-slate-500 text-sm">No other admins found</p>
            </div>
          ) : (
            filteredAdmins.map(admin => {
              const unread    = unreadMap[admin.id] ?? 0
              const isActive  = selected?.id === admin.id
              return (
                <button
                  key={admin.id}
                  onClick={() => handleSelectAdmin(admin)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 transition-all text-left',
                    isActive
                      ? 'bg-slate-800 border-r-2 border-blue-500'
                      : 'hover:bg-slate-800/60'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar admin={admin} size="md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isActive ? 'text-white' : 'text-slate-200')}>
                      {admin.full_name ?? 'Admin'}
                    </p>
                    <p className={cn('text-xs truncate', ROLE_COLOR[admin.role] ?? 'text-slate-400')}>
                      {ROLE_LABEL[admin.role] ?? admin.role}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="shrink-0 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right panel: Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {!selected ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="text-white font-semibold">Select a conversation</p>
              <p className="text-slate-500 text-sm mt-1">Choose an admin from the left to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
              <Avatar admin={selected} size="md" />
              <div>
                <p className="text-white font-semibold text-sm">{selected.full_name ?? 'Admin'}</p>
                <p className={cn('text-xs', ROLE_COLOR[selected.role] ?? 'text-slate-400')}>
                  {ROLE_LABEL[selected.role] ?? selected.role}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600 text-sm">No messages yet. Say hello!</p>
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
                          <div className="flex items-center justify-center my-4">
                            <span className="text-xs text-slate-600 bg-slate-800/60 px-3 py-1 rounded-full">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={cn('flex mb-1', isMine ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                              isMine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                            )}
                          >
                            {msg.message}
                            <p className={cn('text-[10px] mt-1 text-right', isMine ? 'text-blue-200' : 'text-slate-500')}>
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

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-800 shrink-0">
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 focus-within:border-slate-600 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selected.full_name ?? 'admin'}...`}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0',
                    input.trim() && !sending
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  )}
                >
                  {sending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 text-center">Press Enter to send</p>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}

import { create } from 'zustand'

interface Notification {
  id:         string
  title:      string
  message:    string
  type:       string
  order_id:   string | null
  is_read:    boolean
  created_at: string
}

interface NotificationStore {
  notifications: Notification[]
  unread:        number
  setNotifications: (n: Notification[], unread: number) => void
  addNotification:  (n: Notification) => void
  markAllRead:      () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unread:        0,

  setNotifications: (notifications, unread) =>
    set({ notifications, unread }),

  addNotification: (n) =>
    set(state => {
      // ── Prevent duplicates ──
      const exists = state.notifications.some(existing => existing.id === n.id)
      if (exists) return state
      return {
        notifications: [n, ...state.notifications],
        unread:        state.unread + 1,
      }
    }),

  markAllRead: () =>
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unread:        0,
    })),
}))
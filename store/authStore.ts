import { create } from 'zustand'
import type { Profile, UserRole, SubRole } from '@/types'

interface AuthState {
  user:            Profile | null
  role:            UserRole | null
  subRoles:        SubRole[]
  isLoading:       boolean
  isAuthenticated: boolean

  setUser:     (user: Profile | null)     => void
  setRole:     (role: UserRole | null)    => void
  setSubRoles: (subRoles: SubRole[])      => void
  setLoading:  (loading: boolean)         => void
  clearAuth:   ()                         => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  role:            null,
  subRoles:        [],
  isLoading:       true,
  isAuthenticated: false,

  setUser:     (user)      => set({ user, isAuthenticated: !!user }),
  setRole:     (role)      => set({ role }),
  setSubRoles: (subRoles)  => set({ subRoles }),
  setLoading:  (isLoading) => set({ isLoading }),
  clearAuth:   ()          => set({
    user:            null,
    role:            null,
    subRoles:        [],
    isAuthenticated: false,
    isLoading:       false,
  }),
}))
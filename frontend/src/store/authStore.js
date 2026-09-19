import { create } from 'zustand'
import { authAPI } from '../lib/api'
import { connectSocket, disconnectSocket } from '../lib/socket'

const stored = localStorage.getItem('hr_user')

export const useAuthStore = create((set, get) => ({
  user:    stored ? JSON.parse(stored) : null,
  token:   localStorage.getItem('hr_token'),
  loading: false,
  error:   null,

  login: async (credentials) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.login(credentials)
      localStorage.setItem('hr_token', data.token)
      localStorage.setItem('hr_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      connectSocket()
      return { ok: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      set({ error: msg, loading: false })
      return { ok: false, error: msg }
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.register(userData)
      localStorage.setItem('hr_token', data.token)
      localStorage.setItem('hr_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      connectSocket()
      return { ok: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      set({ error: msg, loading: false })
      return { ok: false, error: msg }
    }
  },

  logout: () => {
    localStorage.removeItem('hr_token')
    localStorage.removeItem('hr_user')
    disconnectSocket()
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),

  isAdmin:      () => get().user?.role === 'admin',
  isCoordinator:() => ['admin','coordinator'].includes(get().user?.role),
}))

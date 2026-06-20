import { create } from 'zustand'

const TOKEN_KEY = 'kq-token'
const USER_KEY  = 'kq-user'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user:  JSON.parse(localStorage.getItem(USER_KEY) || 'null'),

  login(token, user) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  setUser(updater) {
    set(state => {
      const user = typeof updater === 'function' ? updater(state.user) : updater
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      return { user }
    })
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY)
  },
}))

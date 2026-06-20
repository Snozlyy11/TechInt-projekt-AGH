import { create } from 'zustand'

const STORAGE_KEY = 'kq-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(effective) {
  if (effective === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const stored = localStorage.getItem(STORAGE_KEY)
const initialMode = stored === 'dark' || stored === 'light' ? stored : 'system'
const initialEffective = initialMode === 'system' ? getSystemTheme() : initialMode

export const useThemeStore = create((set, get) => ({
  mode: initialMode,
  effective: initialEffective,

  setMode(mode) {
    const effective = mode === 'system' ? getSystemTheme() : mode
    applyTheme(effective)
    localStorage.setItem(STORAGE_KEY, mode)
    set({ mode, effective })
  },

  toggle() {
    const { effective } = get()
    const next = effective === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    set({ mode: next, effective: next })
  },

  syncSystem() {
    const { mode } = get()
    if (mode === 'system') {
      const effective = getSystemTheme()
      applyTheme(effective)
      set({ effective })
    }
  },
}))

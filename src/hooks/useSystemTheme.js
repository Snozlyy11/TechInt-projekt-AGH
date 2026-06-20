import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function useSystemTheme() {
  const syncSystem = useThemeStore((s) => s.syncSystem)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', syncSystem)
    return () => mq.removeEventListener('change', syncSystem)
  }, [syncSystem])
}

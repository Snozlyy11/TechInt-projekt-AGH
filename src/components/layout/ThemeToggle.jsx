import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle() {
  const { mode, setMode } = useThemeStore()
  const isDark = mode === 'dark'

  return (
    <button
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      title={isDark ? 'Przełącz na jasny' : 'Przełącz na ciemny'}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 50,
        width: 44,
        height: 44,
        borderRadius: 14,
        border: '1.5px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--fg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(127,119,221,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)' }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

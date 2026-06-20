import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Sparkles, LogOut, LogIn, BookOpen, Users, Library, UserPlus, Zap, Settings, Shield } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SettingsModal from './SettingsModal'
import { useAuthStore } from '../../store/authStore'

const navLinks = [
  { to: '/dashboard', label: 'Moje quizy', Icon: BookOpen,    auth: true  },
  { to: '/creator',   label: 'Kreator',    Icon: Plus,        auth: true  },
  { to: '/ai',        label: 'AI',         Icon: Sparkles,    auth: true  },
  { to: '/#funkcje',  label: 'Funkcje',    Icon: Zap,         auth: false, hash: true, guestOnly: true },
  { to: '/catalog',   label: 'Katalog',    Icon: Library,     auth: false },
]

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const [dropHover, setDropHover] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-card)', borderBottom: '1.5px solid var(--border)', backdropFilter: 'blur(12px)' }}>
      <nav style={{ padding: '0 5%', height: 56, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo_48x48.png" alt="KreatorQuiz" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--fg)' }} className="hidden sm:block">
            Kreator<span style={{ color: '#7F77DD' }}>Quiz</span>
          </span>
        </Link>

        {/* Nav links — center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.filter(l => (!l.auth || token) && (!l.guestOnly || !token)).map(({ to, label, Icon, hash }) =>
            hash ? (
              <a key={to} href={to}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s, color 0.15s', color: 'var(--fg)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEEDFE'; e.currentTarget.style.color = '#7F77DD' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
              >
                <Icon size={14} />
                <span className="hidden sm:block">{label}</span>
              </a>
            ) : (
              <NavLink key={to} to={to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                  background: isActive ? '#EEEDFE' : 'transparent',
                  color: isActive ? '#7F77DD' : 'var(--fg)',
                })}
              >
                <Icon size={14} />
                <span className="hidden sm:block">{label}</span>
              </NavLink>
            )
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <NavLink
            to="/join"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
              background: isActive ? '#EEEDFE' : 'transparent',
              color: isActive ? '#7F77DD' : 'var(--fg)',
            })}
          >
            <Users size={14} />
            <span className="hidden sm:block">Dołącz</span>
          </NavLink>

          {token ? (
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                onClick={() => setDropOpen(v => !v)}
                onMouseEnter={() => setDropHover(true)}
                onMouseLeave={() => setDropHover(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 12, border: '1.5px solid', borderColor: (dropOpen || dropHover) ? 'var(--border)' : 'transparent', background: (dropOpen || dropHover) ? 'var(--bg-muted)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Nunito', sans-serif" }}>
                    {(user?.name || user?.email || '?')[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block" style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', fontFamily: "'Nunito', sans-serif" }}>
                  {user?.name || user?.email}
                </span>
              </button>

              {dropOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 200, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100 }}>
                  <button
                    onClick={() => { setSettingsOpen(true); setDropOpen(false) }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--fg)', fontSize: 14, fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif", transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={15} style={{ opacity: 0.6 }} /> Ustawienia
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <div style={{ height: '1px', background: 'var(--border)', margin: '0 12px' }} />
                      <a
                        href="/admin"
                        onClick={() => setDropOpen(false)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: '#7F77DD', fontSize: 14, fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif", transition: 'background 0.15s', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#EEEDFE'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Shield size={15} /> Panel admina
                      </a>
                    </>
                  )}
                  <div style={{ height: '1px', background: 'var(--border)', margin: '0 12px' }} />
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#e05555', fontSize: 14, fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif", transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} /> Wyloguj
                  </button>
                </div>
              )}

              {settingsOpen && createPortal(<SettingsModal onClose={() => setSettingsOpen(false)} />, document.body)}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link
                to="/login"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--fg)', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.color = '#7F77DD' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg)' }}
              >
                <LogIn size={14} />
                <span className="hidden sm:block">Zaloguj</span>
              </Link>
              <Link
                to="/register"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#7F77DD', color: '#fff', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#3C3489'}
                onMouseLeave={e => e.currentTarget.style.background = '#7F77DD'}
              >
                <UserPlus size={14} />
                <span className="hidden sm:block">Zarejestruj się</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

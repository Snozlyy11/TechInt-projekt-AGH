import { useState } from 'react'
import { X, User, Mail, Lock, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

function Field({ label, value }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg)', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', fontFamily: "'Nunito', sans-serif" }}>{value}</div>
    </div>
  )
}

function Msg({ type, text }) {
  if (!text) return null
  const isErr = type === 'error'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: isErr ? '#FEF2F2' : '#F0FDF4', color: isErr ? '#dc2626' : '#16a34a', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
      {isErr ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
      {text}
    </div>
  )
}

function inputStyle(extra = {}) {
  return { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--fg)', fontSize: 14, fontFamily: "'Nunito Sans', sans-serif", outline: 'none', boxSizing: 'border-box', ...extra }
}

function ActionBtn({ onClick, loading, children }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#7F77DD', color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.15s' }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3C3489' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#7F77DD' }}
    >
      {loading ? 'Zapisywanie...' : children}
    </button>
  )
}

function ChangePasswordForm({ onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit() {
    if (next !== confirm) { setMsg({ type: 'error', text: 'Nowe hasła nie są identyczne.' }); return }
    if (next.length < 8) { setMsg({ type: 'error', text: 'Hasło musi mieć co najmniej 8 znaków.' }); return }
    setLoading(true)
    setMsg(null)
    try {
      await authService.changePassword(current, next)
      setMsg({ type: 'success', text: 'Hasło zostało zmienione.' })
      setTimeout(onDone, 1500)
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Błąd zmiany hasła.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Msg type={msg?.type} text={msg?.text} />
      <input style={inputStyle()} type="password" placeholder="Aktualne hasło" value={current} onChange={e => setCurrent(e.target.value)} />
      <input style={inputStyle()} type="password" placeholder="Nowe hasło (min. 8 znaków)" value={next} onChange={e => setNext(e.target.value)} />
      <input style={inputStyle()} type="password" placeholder="Powtórz nowe hasło" value={confirm} onChange={e => setConfirm(e.target.value)} />
      <ActionBtn onClick={submit} loading={loading}>Zmień hasło</ActionBtn>
    </div>
  )
}

function ChangeEmailForm({ onDone }) {
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit() {
    setLoading(true)
    setMsg(null)
    try {
      await authService.changeEmail(email, password)
      setUser(prev => ({ ...prev, email }))
      setMsg({ type: 'success', text: 'Email został zmieniony.' })
      setTimeout(onDone, 1500)
    } catch (e) {
      setMsg({ type: 'error', text: e?.response?.data?.message || 'Błąd zmiany emaila.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Msg type={msg?.type} text={msg?.text} />
      <input style={inputStyle()} type="email" placeholder="Nowy adres email" value={email} onChange={e => setEmail(e.target.value)} />
      <input style={inputStyle()} type="password" placeholder="Aktualne hasło (potwierdzenie)" value={password} onChange={e => setPassword(e.target.value)} />
      <ActionBtn onClick={submit} loading={loading}>Zmień email</ActionBtn>
    </div>
  )
}

export default function SettingsModal({ onClose }) {
  const { user } = useAuthStore()
  const [view, setView] = useState('main') // 'main' | 'password' | 'email'

  const titles = { main: 'Ustawienia', password: 'Zmień hasło', email: 'Zmień email' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />

      {/* Modal */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'var(--bg-card)', borderRadius: 20, border: '1.5px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {view !== 'main' && (
              <button onClick={() => setView('main')}
                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--bg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)' }}>
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--fg)', margin: 0 }}>{titles[view]}</h2>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: 'var(--bg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {view === 'main' && (
            <>
              {/* Avatar */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#7F77DD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: "'Nunito', sans-serif" }}>
                    {(user?.name || user?.email || '?')[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <Field label="Nazwa użytkownika" value={user?.name || '—'} />
              <Field label="Adres email" value={user?.email || '—'} />

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
                <button onClick={() => setView('email')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--fg)', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 14, transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.background = '#EEEDFE' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Mail size={15} style={{ color: '#7F77DD' }} /> Zmień email</span>
                  <ChevronRight size={14} style={{ opacity: 0.4 }} />
                </button>
                <button onClick={() => setView('password')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--fg)', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600, fontSize: 14, transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.background = '#EEEDFE' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Lock size={15} style={{ color: '#7F77DD' }} /> Zmień hasło</span>
                  <ChevronRight size={14} style={{ opacity: 0.4 }} />
                </button>
              </div>
            </>
          )}

          {view === 'password' && <ChangePasswordForm onDone={() => setView('main')} />}
          {view === 'email' && <ChangeEmailForm onDone={() => setView('main')} />}
        </div>
      </div>
    </div>
  )
}

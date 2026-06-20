import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'

export default function JoinSession() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      setError('Kod sesji musi mieć dokładnie 6 znaków.')
      return
    }
    navigate(`/session/${trimmed}`)
  }

  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <img src="/logo_64x64.png" alt="KreatorQuiz" style={{ width: 56, height: 56, objectFit: 'contain' }} />
          </Link>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}>
            Dołącz do quizu
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.55 }}>Wpisz kod sesji od prowadzącego</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
                placeholder="np. AB3X7K"
                maxLength={6}
                autoFocus
                autoComplete="off"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 34,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  padding: '24px 16px',
                  borderRadius: 16,
                  border: `2px solid ${error ? '#f87171' : 'var(--border)'}`,
                  background: 'var(--bg-muted)',
                  color: 'var(--fg)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = '#7F77DD' }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)' }}
              />
              {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{error}</p>}
            </div>

            <button
              type="submit"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', borderRadius: 12, fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', background: '#7F77DD', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#3C3489'}
              onMouseLeave={e => e.currentTarget.style.background = '#7F77DD'}
            >
              <LogIn size={17} />
              Dołącz
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

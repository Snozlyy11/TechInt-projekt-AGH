import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trophy, Medal, Loader2, RefreshCw, ArrowLeft } from 'lucide-react'
import { sessionService } from '../services/sessionService'

const RANK_STYLES = [
  { bg: '#FFF8CC', border: '#F6D000', color: '#7a6000' },
  { bg: '#F5F5F5', border: '#C0C0C0', color: '#555' },
  { bg: '#FDF0E6', border: '#C87941', color: '#7a3d10' },
]

export default function SessionResults() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    sessionService.results(code)
      .then(r => setResults(r.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [code])

  const pctColor = (p) => p >= 80 ? '#1D9E75' : p >= 50 ? '#d97706' : '#ef4444'

  return (
    <main style={{ flex: 1, background: 'var(--bg)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: 10, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 2 }}>
              Ranking sesji
            </h1>
            <p style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: 'var(--fg)', opacity: 0.5 }}>
              Kod: {code}
            </p>
          </div>
          <button
            onClick={load}
            title="Odśwież"
            style={{ padding: 10, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: '#7F77DD' }} />
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--fg)', opacity: 0.45 }}>
            <Trophy size={40} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15 }}>Brak wyników. Nikt jeszcze nie ukończył quizu.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((p, i) => {
              const style = RANK_STYLES[i]
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                    borderRadius: 14, border: `1.5px solid ${style ? style.border : 'var(--border)'}`,
                    background: style ? style.bg : 'var(--bg-card)',
                  }}
                >
                  <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0, color: style ? style.color : 'var(--fg)', opacity: style ? 1 : 0.5 }}>
                    {i < 3 ? <Medal size={22} /> : `#${i + 1}`}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--fg)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.5 }}>
                      {p.score} / {p.total} poprawnych
                    </p>
                  </div>
                  <span style={{ fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: pctColor(p.percent) }}>
                    {p.percent}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

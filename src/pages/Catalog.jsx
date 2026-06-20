import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Loader2, Search, Clock, Hash, Play, Bookmark, BookmarkCheck, WifiOff, RefreshCw } from 'lucide-react'
import { quizService } from '../services/quizService'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Catalog() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    quizService.catalog()
      .then(r => setQuizzes(r.data))
      .catch(() => setError('Nie udało się załadować katalogu. Sprawdź połączenie z serwerem.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    (q.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', padding: isMobile ? '24px 16px' : '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEEDFE', color: '#7F77DD', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 100, letterSpacing: '0.06em', marginBottom: 16 }}>
            <BookOpen size={13} /> KATALOG QUIZÓW
          </div>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: isMobile ? 26 : 36, fontWeight: 800, color: 'var(--fg)', marginBottom: 10, lineHeight: 1.2 }}>
            Przeglądaj quizy
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fg)', opacity: 0.55, maxWidth: 500, margin: '0 auto' }}>
            Odkrywaj i rozwiązuj quizy stworzone przez innych użytkowników platformy.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto 40px' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg)', opacity: 0.35, pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj quizów…"
            style={{ width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 14, border: '2px solid var(--border)', background: 'var(--bg-card)', color: 'var(--fg)', fontSize: 14, fontFamily: "'Nunito Sans', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = '#7F77DD'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={32} style={{ color: '#7F77DD', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} `}</style>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <WifiOff size={24} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--fg)', marginBottom: 6 }}>Błąd połączenia</h2>
            <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.5, marginBottom: 24 }}>{error}</p>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#7F77DD', color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Spróbuj ponownie
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--fg)', opacity: 0.35 }}>
            <BookOpen size={48} strokeWidth={1} style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {search ? 'Brak wyników dla tej frazy.' : 'Brak opublikowanych quizów.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} from="/catalog" />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function QuizCard({ quiz, onPlay }) {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e) {
    e.stopPropagation()
    if (!token) { navigate('/login'); return }
    setSaving(true)
    try {
      await quizService.copy(quiz.id)
      setSaved(true)
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderRadius: 18, border: `2px solid ${hovered ? '#7F77DD' : 'var(--border)'}`, background: 'var(--bg-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: hovered ? '0 8px 32px rgba(127,119,221,0.12)' : '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Banner */}
      {quiz.bannerUrl ? (
        <div style={{ width: '100%', aspectRatio: '16/7', overflow: 'hidden', flexShrink: 0 }}>
          <img src={quiz.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.03)' : 'scale(1)' }} />
        </div>
      ) : (
        <div style={{ width: '100%', aspectRatio: '16/7', background: 'linear-gradient(135deg, #EEEDFE 0%, #E1F5EE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BookOpen size={32} style={{ color: '#7F77DD', opacity: 0.4 }} />
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--fg)', lineHeight: 1.3, margin: 0 }}>
          {quiz.title}
        </h3>
        {quiz.description && (
          <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.55, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {quiz.description}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--fg)', opacity: 0.4, fontWeight: 600 }}>
            <Hash size={11} /> {quiz.questionCount} pytań
          </span>
          {quiz.timeLimit && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--fg)', opacity: 0.4, fontWeight: 600 }}>
              <Clock size={11} /> {quiz.timeLimit} min
            </span>
          )}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            title={saved ? 'Zapisano w Moje quizy' : 'Zapisz do Moje quizy'}
            style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 14px', borderRadius: 11, border: `1.5px solid ${saved ? '#1D9E75' : 'var(--border)'}`, background: saved ? '#E1F5EE' : 'var(--bg-muted)', color: saved ? '#1D9E75' : 'var(--fg)', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, cursor: saving || saved ? 'default' : 'pointer', transition: 'all 0.2s', opacity: saving ? 0.6 : 1 }}
          >
            {saving
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : saved
                ? <BookmarkCheck size={14} />
                : <Bookmark size={14} />
            }
            {saved ? 'Zapisano' : 'Zapisz'}
          </button>
          <button
            onClick={onPlay}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 11, border: 'none', background: hovered ? '#7F77DD' : 'var(--bg-muted)', color: hovered ? '#fff' : 'var(--fg)', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Play size={14} fill={hovered ? '#fff' : 'none'} /> Graj
          </button>
        </div>
      </div>
    </div>
  )
}

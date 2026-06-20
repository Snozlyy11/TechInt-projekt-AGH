import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, Search, WifiOff, RefreshCw } from 'lucide-react'
import { quizService } from '../services/quizService'
import QuizCard from '../components/quiz/QuizCard'
import Button from '../components/ui/Button'

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    quizService.list()
      .then((res) => setQuizzes(res.data))
      .catch(() => setError('Nie udało się połączyć z serwerem. Sprawdź czy backend działa.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id) {
    if (!confirm('Usunąć ten quiz?')) return
    await quizService.remove(id)
    setQuizzes((prev) => prev.filter((q) => q.id !== id))
  }

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ flex: 1, background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--fg)', marginBottom: 2 }}>
              Moje quizy
            </h1>
            <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.5 }}>
              {quizzes.length} {quizzes.length === 1 ? 'quiz' : quizzes.length < 5 ? 'quizy' : 'quizów'} łącznie
            </p>
          </div>
          <Link to="/creator">
            <Button size="md">
              <Plus size={15} />
              Nowy quiz
            </Button>
          </Link>
        </div>

        {/* Search */}
        {quizzes.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 24, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg)', opacity: 0.4 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj quizu…"
              style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 12, fontSize: 14, border: '1.5px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--fg)', outline: 'none', fontFamily: "'Nunito Sans', sans-serif", boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 28, height: 28, border: '2.5px solid #7F77DD', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <WifiOff size={24} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--fg)', marginBottom: 6 }}>Błąd połączenia</h2>
            <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.5, marginBottom: 24 }}>{error}</p>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#7F77DD', color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Spróbuj ponownie
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BookOpen size={24} style={{ color: '#7F77DD' }} />
            </div>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--fg)', marginBottom: 6 }}>
              Brak quizów
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.5, marginBottom: 24 }}>
              Stwórz swój pierwszy quiz i zacznij testować wiedzę
            </p>
            <Link to="/creator"><Button>Stwórz pierwszy quiz</Button></Link>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: 14, textAlign: 'center', padding: '48px 0', color: 'var(--fg)', opacity: 0.5 }}>
            Brak quizów pasujących do „{search}"
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

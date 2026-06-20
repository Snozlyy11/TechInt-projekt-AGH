import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { XCircle, ChevronRight, RotateCcw, Home, Clock, Loader2, Trophy, ArrowRight, Star, WifiOff } from 'lucide-react'
import { quizService } from '../services/quizService'

const ACCENTS = [
  { border: '#7F77DD', bg: '#EEEDFE', text: '#3C3489', labelBg: '#7F77DD', labelColor: '#fff' },
  { border: '#F0997B', bg: '#FFF1EC', text: '#9B4221', labelBg: '#F0997B', labelColor: '#fff' },
  { border: '#d4aa00', bg: '#FFFBEB', text: '#92400e', labelBg: '#FFDA00', labelColor: '#5a3e00' },
  { border: '#1D9E75', bg: '#E1F5EE', text: '#065040', labelBg: '#1D9E75', labelColor: '#fff' },
]

function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const PrimaryBtn = ({ onClick, disabled, loading, children, style = {} }) => (
  <button onClick={onClick} disabled={disabled || loading}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 24px', borderRadius: 12, border: 'none', cursor: (disabled || loading) ? 'not-allowed' : 'pointer', background: (disabled || loading) ? 'var(--bg-muted)' : '#7F77DD', color: (disabled || loading) ? 'var(--fg)' : '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, opacity: (disabled || loading) ? 0.5 : 1, transition: 'background 0.15s', ...style }}
    onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = '#3C3489' }}
    onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = '#7F77DD' }}
  >
    {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
    {children}
  </button>
)

export default function QuizSolver() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const backTo = state?.from || '/'
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [error, setError] = useState(null)
  const answersRef = useRef(answers)
  useEffect(() => { answersRef.current = answers }, [answers])

  useEffect(() => {
    quizService.get(id)
      .then(res => {
        setQuiz(res.data.quiz)
        setQuestions(res.data.questions)
        if (res.data.quiz.timeLimit) setTimeLeft(res.data.quiz.timeLimit * 60)
      })
      .catch(() => setError('Nie udało się załadować quizu. Sprawdź czy link jest poprawny lub spróbuj ponownie.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (timeLeft === null || submitted) return
    if (timeLeft <= 0) { doSubmit(); return }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, submitted])

  function toggleAnswer(qId, oId, type) {
    setAnswers(prev => {
      const cur = prev[qId] || []
      if (type === 'single') return { ...prev, [qId]: [oId] }
      return { ...prev, [qId]: cur.includes(oId) ? cur.filter(x => x !== oId) : [...cur, oId] }
    })
  }

  async function doSubmit() {
    setSubmitting(true)
    try {
      const res = await quizService.submit(id, answersRef.current)
      setResults(res.data); setSubmitted(true)
    } catch {
      setResults({ score: 0, total: questions.length, percent: 0 }); setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const centered = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }

  if (loading) return (
    <main style={centered}>
      <Loader2 size={36} style={{ color: '#7F77DD', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (error) return (
    <main style={centered}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <WifiOff size={28} style={{ color: '#ef4444' }} />
        </div>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 8 }}>Błąd połączenia</h2>
        <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.5, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#7F77DD', color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <Home size={14} /> Wróć
        </button>
      </div>
    </main>
  )

  if (!quiz) return (
    <main style={centered}>
      <div style={{ textAlign: 'center' }}>
        <XCircle size={40} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 20 }}>Quiz nie znaleziony</h2>
        <PrimaryBtn onClick={() => navigate(backTo)} style={{ width: 'auto' }}><Home size={15} /> Zamknij</PrimaryBtn>
      </div>
    </main>
  )

  if (submitted && results) {
    const pct = results.percent ?? Math.round((results.score / Math.max(results.total, 1)) * 100)
    const pctColor = pct >= 80 ? '#1D9E75' : pct >= 50 ? '#d97706' : '#ef4444'
    const pctBg   = pct >= 80 ? '#E1F5EE' : pct >= 50 ? '#FFFBEB' : '#fef2f2'
    const label   = pct >= 90 ? 'Doskonały wynik!' : pct >= 70 ? 'Dobry wynik!' : pct >= 50 ? 'Zaliczony!' : 'Spróbuj ponownie'

    return (
      <main style={centered}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {quiz.bannerUrl && (
            <div style={{ width: '100%', height: 140, borderRadius: '18px 18px 0 0', overflow: 'hidden' }}>
              <img src={quiz.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: quiz.bannerUrl ? '0 0 20px 20px' : 20, padding: '36px 28px', textAlign: 'center' }}>
            <Trophy size={52} style={{ color: '#FFDA00', margin: '0 auto 16px', filter: 'drop-shadow(0 4px 12px rgba(255,218,0,0.35))' }} />
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 20 }}>{label}</h2>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: pctBg, borderRadius: 18, padding: '18px 32px', marginBottom: 24, border: `1.5px solid ${pctColor}33` }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 56, color: pctColor, lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: 13, color: pctColor, fontWeight: 600, marginTop: 4 }}>{results.score} / {results.total} pkt</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setSubmitted(false); setCurrent(0); setAnswers({}) }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--fg)', fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <RotateCcw size={14} /> Jeszcze raz
              </button>
              <PrimaryBtn onClick={() => navigate(backTo)} style={{ flex: 1 }}><Home size={14} /> Zamknij</PrimaryBtn>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </main>
    )
  }

  const q = questions[current]
  if (!q) return null
  const selected = answers[q.id] || []
  const progress = ((current + 1) / questions.length) * 100
  const isLast = current === questions.length - 1
  const timerWarning = timeLeft !== null && timeLeft <= 30

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Progress bar */}
      <div style={{ width: '100%', height: 5, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#7F77DD', transition: 'width 0.4s ease' }} />
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', opacity: 0.5 }}>{quiz.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {timeLeft !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: timerWarning ? '#ef4444' : 'var(--fg)', background: timerWarning ? '#fef2f2' : 'var(--bg-muted)', padding: '4px 10px', borderRadius: 20, border: `1px solid ${timerWarning ? '#fecaca' : 'var(--border)'}`, transition: 'all 0.3s' }}>
              <Clock size={12} /> {fmtTime(timeLeft)}
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#EEEDFE', color: '#7F77DD', fontFamily: "'JetBrains Mono', monospace" }}>
            {current + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: 620 }}>

          {/* Question image */}
          {q.imageUrl && (
            <div style={{ width: '100%', maxWidth: 960, height: 540, borderRadius: 14, overflow: 'hidden', marginBottom: 24, border: '1.5px solid var(--border)' }}>
              <img src={q.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
          )}

          {q.points > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: '#FFFBEB', color: '#92400e', border: '1px solid #d4aa00' }}>
                <Star size={11} fill="#d4aa00" stroke="#d4aa00" /> {q.points} pkt
              </span>
            </div>
          )}

          {/* Question text */}
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 28, lineHeight: 1.4, color: 'var(--fg)' }}
            dangerouslySetInnerHTML={{ __html: q.text || 'Brak treści pytania' }}
          />

          {q.type === 'multiple' && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg)', opacity: 0.45, marginBottom: 16, fontWeight: 600 }}>
              Zaznacz wszystkie poprawne odpowiedzi
            </p>
          )}

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {q.options.map((opt, idx) => {
              const accent = ACCENTS[idx % ACCENTS.length]
              const isSel = selected.includes(String(opt.id))
              return (
                <button key={opt.id} onClick={() => toggleAnswer(q.id, String(opt.id), q.type)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: `2px solid ${isSel ? accent.border : 'var(--border)'}`, background: isSel ? accent.bg : 'var(--bg-card)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = accent.border; e.currentTarget.style.background = accent.bg + '88' } }}
                  onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' } }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 13, background: isSel ? accent.labelBg : 'var(--bg-muted)', color: isSel ? accent.labelColor : 'var(--fg)', transition: 'all 0.15s' }}>
                    {opt.label || String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 15, color: isSel ? accent.text : 'var(--fg)', transition: 'color 0.15s' }}>{opt.text || '—'}</span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setCurrent(c => c - 1)}
              disabled={current === 0}
              style={{ padding: '13px 24px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--fg)', fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 14, cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1, transition: 'background 0.15s' }}
              onMouseEnter={e => { if (current > 0) e.currentTarget.style.background = 'var(--border)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
            >
              Wstecz
            </button>
            <PrimaryBtn onClick={isLast ? doSubmit : () => setCurrent(c => c + 1)} loading={submitting} style={{ flex: 1 }}>
              {isLast ? 'Zakończ i sprawdź' : 'Dalej'}
              {!isLast && <ArrowRight size={15} />}
            </PrimaryBtn>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  )
}

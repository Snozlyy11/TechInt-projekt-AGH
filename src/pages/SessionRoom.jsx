import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, XCircle, Trophy, ArrowRight, Loader2, Star, Clock } from 'lucide-react'
import { sessionService } from '../services/sessionService'

const STEP = { NAME: 'name', QUIZ: 'quiz', RESULT: 'result', ERROR: 'error' }

const ACCENTS = [
  { border: '#7F77DD', bg: '#EEEDFE', text: '#3C3489', labelBg: '#7F77DD', labelColor: '#fff' },
  { border: '#F0997B', bg: '#FFF1EC', text: '#9B4221', labelBg: '#F0997B', labelColor: '#fff' },
  { border: '#d4aa00', bg: '#FFFBEB', text: '#92400e', labelBg: '#FFDA00', labelColor: '#5a3e00' },
  { border: '#1D9E75', bg: '#E1F5EE', text: '#065040', labelBg: '#1D9E75', labelColor: '#fff' },
]

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const PrimaryBtn = ({ onClick, disabled, children, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? 'var(--bg-muted)' : '#7F77DD', color: disabled ? 'var(--fg)' : '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, opacity: disabled ? 0.5 : 1, transition: 'background 0.15s', ...style }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#3C3489' }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#7F77DD' }}
  >
    {children}
  </button>
)

export default function SessionRoom() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP.NAME)
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)

  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Use ref to always have latest answers in timer callback
  const answersRef = useRef(answers)
  useEffect(() => { answersRef.current = answers }, [answers])
  const nameRef = useRef(name)
  useEffect(() => { nameRef.current = name }, [name])

  useEffect(() => {
    sessionService.get(code)
      .then(r => {
        if (!r.data.info.isActive) { setErrorMsg('Ta sesja jest już zamknięta.'); setStep(STEP.ERROR) }
        else setSessionData(r.data)
      })
      .catch(() => { setErrorMsg('Nie znaleziono sesji o podanym kodzie.'); setStep(STEP.ERROR) })
      .finally(() => setLoading(false))
  }, [code])

  // Countdown timer — starts when quiz step begins
  useEffect(() => {
    if (step !== STEP.QUIZ || !sessionData?.quiz?.timeLimit) return
    const totalSecs = sessionData.quiz.timeLimit * 60
    setTimeLeft(totalSecs)

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Auto-submit with current answers; unanswered = wrong (not sent)
          setSubmitting(true)
          sessionService.submit(code, nameRef.current.trim(), answersRef.current)
            .then(r => { setResult(r.data); setStep(STEP.RESULT) })
            .catch(() => { setErrorMsg('Czas minął — błąd wysyłania.'); setStep(STEP.ERROR) })
            .finally(() => setSubmitting(false))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [step, sessionData])

  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setNameError('Wpisz swoje imię.'); return }
    setStep(STEP.QUIZ)
  }

  const toggleAnswer = (qId, oId, isMulti) => {
    setAnswers(prev => {
      const current = prev[qId] ?? []
      if (isMulti) return { ...prev, [qId]: current.includes(oId) ? current.filter(x => x !== oId) : [...current, oId] }
      return { ...prev, [qId]: [oId] }
    })
  }

  const handleNext = async () => {
    const questions = sessionData.quiz.questions
    if (currentQ < questions.length - 1) { setCurrentQ(q => q + 1); return }
    setSubmitting(true)
    try {
      const r = await sessionService.submit(code, name.trim(), answers)
      setResult(r.data); setStep(STEP.RESULT)
    } catch {
      setErrorMsg('Nie udało się wysłać odpowiedzi.'); setStep(STEP.ERROR)
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

  if (step === STEP.ERROR) return (
    <main style={centered}>
      <div style={{ textAlign: 'center', maxWidth: 340 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <XCircle size={30} style={{ color: '#ef4444' }} />
        </div>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--fg)', marginBottom: 8 }}>Ups!</h2>
        <p style={{ fontSize: 15, color: 'var(--fg)', opacity: 0.6, marginBottom: 28, lineHeight: 1.6 }}>{errorMsg}</p>
        <PrimaryBtn onClick={() => navigate('/join')} style={{ width: 'auto', padding: '12px 32px' }}>Wróć</PrimaryBtn>
      </div>
    </main>
  )

  if (step === STEP.NAME) return (
    <main style={centered}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Quiz banner */}
        {sessionData?.quiz?.bannerUrl && (
          <div style={{ width: '100%', height: 160, borderRadius: '16px 16px 0 0', overflow: 'hidden', marginBottom: 0 }}>
            <img src={sessionData.quiz.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: sessionData?.quiz?.bannerUrl ? '0 0 20px 20px' : 20, padding: '32px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ display: 'inline-block', background: '#EEEDFE', color: '#7F77DD', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>{code}</span>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 8, lineHeight: 1.3 }}>{sessionData?.info?.quizTitle}</h1>
            <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.5 }}>{sessionData?.info?.participantCount ?? 0} uczestnik(ów) już dołączyło</p>
          </div>
          <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg)', opacity: 0.45, marginBottom: 8 }}>Twoje imię</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg)', opacity: 0.35, pointerEvents: 'none' }} />
                <input value={name} onChange={e => { setName(e.target.value); setNameError('') }} placeholder="Wpisz imię…" autoFocus
                  style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: `2px solid ${nameError ? '#f87171' : 'var(--border)'}`, background: 'var(--bg-muted)', color: 'var(--fg)', fontSize: 14, fontFamily: "'Nunito Sans', sans-serif", outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => { if (!nameError) e.target.style.borderColor = '#7F77DD' }}
                  onBlur={e => { if (!nameError) e.target.style.borderColor = 'var(--border)' }}
                />
              </div>
              {nameError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>{nameError}</p>}
            </div>
            <PrimaryBtn>Rozpocznij quiz <ArrowRight size={16} /></PrimaryBtn>
          </form>
        </div>
      </div>
    </main>
  )

  if (step === STEP.QUIZ) {
    const questions = sessionData.quiz.questions
    const q = questions[currentQ]
    const isMulti = q.type === 'multiple'
    const selected = answers[String(q.id)] ?? []
    const progress = ((currentQ + 1) / questions.length) * 100
    const isLast = currentQ === questions.length - 1
    const timerWarning = timeLeft !== null && timeLeft <= 30

    return (
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* Progress */}
        <div style={{ width: '100%', height: 5, background: 'var(--border)', flexShrink: 0 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#7F77DD', transition: 'width 0.4s ease' }} />
        </div>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', opacity: 0.5 }}>{sessionData?.info?.quizTitle}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {timeLeft !== null && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: timerWarning ? '#ef4444' : 'var(--fg)', background: timerWarning ? '#fef2f2' : 'var(--bg-muted)', padding: '4px 10px', borderRadius: 20, border: `1px solid ${timerWarning ? '#fecaca' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                <Clock size={12} /> {fmtTime(timeLeft)}
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#EEEDFE', color: '#7F77DD', fontFamily: "'JetBrains Mono', monospace" }}>
              {currentQ + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
          <div style={{ width: '100%', maxWidth: 620 }}>

            {/* Question image — 960×540 proportions */}
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

            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 28, lineHeight: 1.4, color: 'var(--fg)' }}
              dangerouslySetInnerHTML={{ __html: q.text || 'Brak treści pytania' }}
            />

            {isMulti && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--fg)', opacity: 0.45, marginBottom: 16, fontWeight: 600 }}>
                Zaznacz wszystkie poprawne odpowiedzi
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {q.options.map((opt, idx) => {
                const accent = ACCENTS[idx % ACCENTS.length]
                const isSel = selected.includes(String(opt.id))
                return (
                  <button key={opt.id} onClick={() => toggleAnswer(String(q.id), String(opt.id), isMulti)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: `2px solid ${isSel ? accent.border : 'var(--border)'}`, background: isSel ? accent.bg : 'var(--bg-card)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 13, background: isSel ? accent.labelBg : 'var(--bg-muted)', color: isSel ? accent.labelColor : 'var(--fg)', transition: 'all 0.15s' }}>
                      {opt.label || String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 15, color: isSel ? accent.text : 'var(--fg)', transition: 'color 0.15s' }}>{opt.text}</span>
                  </button>
                )
              })}
            </div>

            <PrimaryBtn onClick={handleNext} disabled={submitting || selected.length === 0}>
              {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {isLast ? 'Zakończ i wyślij' : 'Następne'}
              {!isLast && <ArrowRight size={16} />}
            </PrimaryBtn>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </main>
    )
  }

  if (step === STEP.RESULT && result) {
    const pct = result.percent
    const pctColor = pct >= 80 ? '#1D9E75' : pct >= 50 ? '#d97706' : '#ef4444'
    const pctBg = pct >= 80 ? '#E1F5EE' : pct >= 50 ? '#FFFBEB' : '#fef2f2'
    return (
      <main style={centered}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '36px 28px', textAlign: 'center' }}>
            <Trophy size={52} style={{ color: '#FFDA00', margin: '0 auto 20px', filter: 'drop-shadow(0 4px 12px rgba(255,218,0,0.35))' }} />
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}>Świetna robota!</h2>
            <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.5, marginBottom: 28 }}>Wyniki dla <strong style={{ opacity: 1, color: 'var(--fg)' }}>{result.name}</strong></p>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: pctBg, borderRadius: 20, padding: '20px 36px', marginBottom: 24, border: `1.5px solid ${pctColor}22` }}>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 60, color: pctColor, lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: 13, color: pctColor, fontWeight: 600, marginTop: 4 }}>{result.score} / {result.total} pkt</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PrimaryBtn onClick={() => navigate(`/session/${code}/results`)}><Trophy size={15} /> Zobacz ranking</PrimaryBtn>
              <button onClick={() => navigate('/')} style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--fg)', fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Wróć na stronę główną
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return null
}

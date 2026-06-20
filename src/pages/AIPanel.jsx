import { useState, useRef, useEffect } from 'react'
import { Sparkles, Upload, FileText, X, Plus, AlertCircle, CheckSquare, Square, Save, Loader2, ChevronDown, RefreshCw } from 'lucide-react'
import { aiService } from '../services/aiService'
import { quizService } from '../services/quizService'
import Button from '../components/ui/Button'
import { useIsMobile } from '../hooks/useIsMobile'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const MAX_FILES = 5

export default function AIPanel() {
  const isMobile = useIsMobile()
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [questionType, setQuestionType] = useState('single')
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(null) // index of question being regenerated
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState([])
  const [selected, setSelected] = useState(new Set())

  const [quizzes, setQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(false)
  const [targetQuizId, setTargetQuizId] = useState('')
  const [adding, setAdding] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  const [savingNew, setSavingNew] = useState(false)
  const [saveNewMsg, setSaveNewMsg] = useState('')
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [dropActive, setDropActive] = useState(false)

  const fileRef = useRef()

  useEffect(() => {
    setQuizzesLoading(true)
    quizService.list()
      .then(r => setQuizzes(r.data))
      .catch(() => setQuizzes([]))
      .finally(() => setQuizzesLoading(false))
  }, [])

  function addFiles(newFiles) {
    const arr = Array.from(newFiles).filter(f => f.type === 'application/pdf')
    setFiles(prev => [...prev, ...arr].slice(0, MAX_FILES))
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleGenerate() {
    if (!text.trim() && files.length === 0) {
      setError('Wklej tekst lub prześlij co najmniej jeden plik PDF.')
      return
    }
    setLoading(true)
    setError('')
    setGenerated([])
    setSelected(new Set())
    setAddMsg('')
    setSaveNewMsg('')
    try {
      const res = await aiService.generate(text, count, files, difficulty, questionType)
      setGenerated(res.data.questions || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Błąd generowania. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate(i) {
    setRegenerating(i)
    try {
      const q = generated[i]
      const res = await aiService.regenerate(q.text, difficulty, questionType, text.trim() || null)
      if (res.data) {
        setGenerated(prev => prev.map((item, idx) => idx === i ? res.data : item))
      }
    } catch {}
    finally { setRegenerating(null) }
  }

  function toggleSelect(i) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function toggleAll() {
    setSelected(selected.size === generated.length
      ? new Set()
      : new Set(generated.map((_, i) => i))
    )
  }

  const selectedQuestions = [...selected].map(i => generated[i])

  async function handleAddToQuiz() {
    if (!targetQuizId) { setAddMsg('Wybierz quiz.'); return }
    if (selected.size === 0) { setAddMsg('Zaznacz co najmniej jedno pytanie.'); return }
    setAdding(true)
    setAddMsg('')
    try {
      const qs = selectedQuestions.map((q, i) => ({
        id: crypto.randomUUID(),
        text: q.text,
        type: q.type || 'single',
        order: i,
        options: q.options.map(o => ({ id: o.label, label: o.label, text: o.text, correct: o.correct })),
      }))
      await aiService.addToQuiz(targetQuizId, qs)
      setAddMsg(`Dodano ${qs.length} pytań do quizu!`)
      setSelected(new Set())
    } catch {
      setAddMsg('Błąd dodawania do quizu.')
    } finally {
      setAdding(false)
    }
  }

  async function handleSaveAsNew() {
    if (selected.size === 0) { setSaveNewMsg('Zaznacz co najmniej jedno pytanie.'); return }
    if (!newQuizTitle.trim()) { setSaveNewMsg('Podaj nazwę quizu.'); return }
    setSavingNew(true)
    setSaveNewMsg('')
    try {
      const payload = {
        title: newQuizTitle.trim(),
        description: '',
        timeLimit: null,
        published: false,
        questions: selectedQuestions.map((q, i) => ({
          id: crypto.randomUUID(),
          text: q.text,
          type: q.type || 'single',
          order: i,
          options: q.options.map(o => ({ id: o.label, label: o.label, text: o.text, correct: o.correct })),
        })),
      }
      await quizService.create(payload)
      setSaveNewMsg(`Quiz "${newQuizTitle.trim()}" zapisany!`)
      setNewQuizTitle('')
      setSelected(new Set())
      quizService.list().then(r => setQuizzes(r.data)).catch(() => {})
    } catch {
      setSaveNewMsg('Błąd zapisu quizu.')
    } finally {
      setSavingNew(false)
    }
  }

  const SectionTitle = ({ children }) => (
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg)', opacity: 0.45 }}>
      {children}
    </span>
  )

  return (
    <main style={{ flex: 1, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <div style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--bg-card)', padding: isMobile ? '16px' : '20px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '0 0' : undefined }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7F77DD', flexShrink: 0 }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>Asystent AI</h1>
            <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.5, margin: 0 }}>Generuj pytania quizowe z tekstu i plików PDF</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: isMobile ? '16px' : '28px 32px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '420px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left: inputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* PDF upload */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <SectionTitle>Pliki PDF</SectionTitle>
              <span style={{ fontSize: 11, color: 'var(--fg)', opacity: 0.4, fontFamily: "'JetBrains Mono', monospace" }}>{files.length}/{MAX_FILES}</span>
            </div>

            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                    <FileText size={13} style={{ color: '#7F77DD', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg)' }}>{f.name}</span>
                    <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg)', opacity: 0.35, display: 'flex', flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = 1 }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.opacity = 0.35 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < MAX_FILES && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDropActive(true) }}
                onDragLeave={() => setDropActive(false)}
                onDrop={e => { e.preventDefault(); setDropActive(false); addFiles(e.dataTransfer.files) }}
                style={{
                  border: `2px dashed ${dropActive ? '#7F77DD' : 'var(--border)'}`,
                  borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
                  background: dropActive ? '#EEEDFE' : 'transparent',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <input ref={fileRef} type="file" accept=".pdf" multiple style={{ display: 'none' }}
                  onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
                <Upload size={20} style={{ color: dropActive ? '#7F77DD' : 'var(--fg)', opacity: dropActive ? 1 : 0.3, margin: '0 auto 6px' }} />
                <p style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.5, margin: 0 }}>
                  Kliknij lub przeciągnij PDF-y<br />
                  <span style={{ opacity: 0.6 }}>{MAX_FILES - files.length} pozostało</span>
                </p>
              </div>
            )}
          </div>

          {/* Source text */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <div style={{ marginBottom: 10 }}><SectionTitle>Tekst źródłowy</SectionTitle></div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Wklej tutaj materiał, z którego AI wygeneruje pytania… (możesz łączyć z plikami PDF)"
              style={{
                width: '100%', minHeight: 140, resize: 'vertical', padding: '10px 12px',
                background: 'var(--bg-muted)', border: '2px solid var(--border)', borderRadius: 10,
                fontSize: 13, fontFamily: "'Nunito Sans', sans-serif", color: 'var(--fg)',
                outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#7F77DD'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Count slider */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <SectionTitle>Liczba pytań</SectionTitle>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18, color: '#7F77DD' }}>{count}</span>
            </div>
            <input
              type="range" min={1} max={20} value={count}
              onChange={e => setCount(+e.target.value)}
              style={{ width: '100%', accentColor: '#7F77DD' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg)', opacity: 0.4, marginTop: 4 }}>
              <span>1</span><span>20</span>
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <div style={{ marginBottom: 12 }}><SectionTitle>Poziom trudności</SectionTitle></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'easy',   label: '😊 Łatwy',   active: '#1D9E75', activeBg: '#E1F5EE' },
                { value: 'medium', label: '🎯 Średni',  active: '#7F77DD', activeBg: '#EEEDFE' },
                { value: 'hard',   label: '🔥 Trudny',  active: '#F0997B', activeBg: '#FFF1EC' },
              ].map(({ value, label, active, activeBg }) => (
                <button key={value} onClick={() => setDifficulty(value)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${difficulty === value ? active : 'var(--border)'}`, background: difficulty === value ? activeBg : 'var(--bg-muted)', color: difficulty === value ? active : 'var(--fg)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", transition: 'all 0.15s' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question type */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <div style={{ marginBottom: 12 }}><SectionTitle>Typ pytań</SectionTitle></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'single',   label: 'Jednokrotny' },
                { value: 'multiple', label: 'Wielokrotny' },
                { value: 'mixed',    label: 'Mieszany'    },
              ].map(({ value, label }) => (
                <button key={value} onClick={() => setQuestionType(value)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${questionType === value ? '#7F77DD' : 'var(--border)'}`, background: questionType === value ? '#EEEDFE' : 'var(--bg-muted)', color: questionType === value ? '#3C3489' : 'var(--fg)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", transition: 'all 0.15s' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#b91c1c', background: '#fef2f2', borderRadius: 12, padding: '10px 14px', border: '1px solid #fecaca' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'var(--bg-muted)' : '#7F77DD', color: loading ? 'var(--fg)' : '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
              opacity: loading ? 0.6 : 1, transition: 'background 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3C3489' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7F77DD' }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
            {loading ? 'Generuję pytania…' : 'Generuj pytania'}
          </button>
        </div>

        {/* ── Right: results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {generated.length > 0 ? (
            <>
              {/* Questions */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SectionTitle>Wygenerowane pytania</SectionTitle>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#EEEDFE', color: '#7F77DD', fontFamily: "'JetBrains Mono', monospace" }}>
                      {generated.length}
                    </span>
                  </div>
                  <button
                    onClick={toggleAll}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7F77DD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {selected.size === generated.length ? <Square size={12} /> : <CheckSquare size={12} />}
                    {selected.size === generated.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                  {generated.map((q, i) => (
                    <div
                      key={i}
                      onClick={() => toggleSelect(i)}
                      style={{
                        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${selected.has(i) ? '#7F77DD' : 'var(--border)'}`,
                        background: selected.has(i) ? '#EEEDFE' : 'var(--bg-muted)',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: 5, flexShrink: 0, marginTop: 2,
                          border: `2px solid ${selected.has(i) ? '#7F77DD' : 'var(--border)'}`,
                          background: selected.has(i) ? '#7F77DD' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                        }}>
                          {selected.has(i) && <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.45, margin: 0, flex: 1 }}>{q.text}</p>
                        <button
                          onClick={e => { e.stopPropagation(); handleRegenerate(i) }}
                          disabled={regenerating !== null}
                          title="Generuj nowe pytanie na ten sam temat"
                          style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: regenerating !== null ? 'not-allowed' : 'pointer', opacity: regenerating !== null && regenerating !== i ? 0.35 : 1, transition: 'all 0.15s' }}
                          onMouseEnter={e => { if (regenerating === null) { e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.color = '#7F77DD' } }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg)' }}
                        >
                          <RefreshCw size={12} style={{ animation: regenerating === i ? 'spin 0.8s linear infinite' : 'none' }} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, paddingLeft: 26 }}>
                        {(q.options || []).map((opt, j) => (
                          <p key={j} style={{
                            fontSize: 12, padding: '4px 8px', borderRadius: 7, margin: 0,
                            fontWeight: opt.correct ? 600 : 400,
                            background: opt.correct ? '#E1F5EE' : 'transparent',
                            color: opt.correct ? '#085041' : 'var(--fg)',
                            opacity: opt.correct ? 1 : 0.55,
                          }}>
                            {OPTION_LABELS[j]}. {opt.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save actions */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <SectionTitle>Zapisz zaznaczone</SectionTitle>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: selected.size > 0 ? '#7F77DD' : 'var(--bg-muted)', color: selected.size > 0 ? '#fff' : 'var(--fg)', opacity: selected.size > 0 ? 1 : 0.45, fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.2s' }}>
                    {selected.size}
                  </span>
                </div>

                {/* Add to existing */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', opacity: 0.6, display: 'block', marginBottom: 8 }}>
                    Dodaj do istniejącego quizu
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <select
                        value={targetQuizId}
                        onChange={e => setTargetQuizId(e.target.value)}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 10, border: '2px solid var(--border)',
                          background: 'var(--bg-muted)', color: 'var(--fg)', fontSize: 13,
                          fontFamily: "'Nunito Sans', sans-serif", outline: 'none', appearance: 'none', cursor: 'pointer',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#7F77DD'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      >
                        <option value="">{quizzesLoading ? 'Ładowanie…' : quizzes.length === 0 ? 'Brak zapisanych quizów' : '— wybierz quiz —'}</option>
                        {quizzes.map(q => (
                          <option key={q.id} value={q.id}>{q.title || 'Quiz bez tytułu'}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg)', opacity: 0.4, pointerEvents: 'none' }} />
                    </div>
                    <Button onClick={handleAddToQuiz} loading={adding} disabled={selected.size === 0 || !targetQuizId}>
                      <Plus size={14} />
                      Dodaj
                    </Button>
                  </div>
                  {addMsg && (
                    <p style={{ fontSize: 12, marginTop: 6, color: addMsg.includes('Błąd') || addMsg.includes('Wybierz') || addMsg.includes('Zaznacz') ? '#ef4444' : '#1D9E75', margin: '6px 0 0' }}>
                      {addMsg}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--fg)', opacity: 0.35, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  lub
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {/* Save as new */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', opacity: 0.6, display: 'block', marginBottom: 8 }}>
                    Zapisz jako nowy quiz
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={newQuizTitle}
                      onChange={e => setNewQuizTitle(e.target.value)}
                      placeholder="Nazwa nowego quizu…"
                      style={{
                        flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid var(--border)',
                        background: 'var(--bg-muted)', color: 'var(--fg)', fontSize: 13,
                        fontFamily: "'Nunito Sans', sans-serif", outline: 'none', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#7F77DD'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      onKeyDown={e => e.key === 'Enter' && handleSaveAsNew()}
                    />
                    <Button onClick={handleSaveAsNew} loading={savingNew} disabled={selected.size === 0} variant="outline">
                      <Save size={14} />
                      Zapisz
                    </Button>
                  </div>
                  {saveNewMsg && (
                    <p style={{ fontSize: 12, marginTop: 6, color: saveNewMsg.includes('Błąd') || saveNewMsg.includes('Zaznacz') ? '#ef4444' : '#1D9E75', margin: '6px 0 0' }}>
                      {saveNewMsg}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 420, borderRadius: 16, border: '1.5px dashed var(--border)',
              background: 'var(--bg-card)', textAlign: 'center', padding: 40,
            }}>
              {loading ? (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Loader2 size={26} style={{ color: '#7F77DD', animation: 'spin 1s linear infinite' }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', margin: '0 0 6px' }}>AI generuje pytania…</p>
                  <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.4, margin: 0 }}>To może chwilę zająć</p>
                </>
              ) : (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Sparkles size={26} style={{ color: 'var(--fg)', opacity: 0.2 }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: 'var(--fg)', margin: '0 0 6px' }}>Gotowy na pytania?</p>
                  <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.45, margin: 0, lineHeight: 1.6 }}>
                    Wklej tekst lub prześlij PDF,<br />ustaw liczbę pytań i kliknij <strong>Generuj</strong>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

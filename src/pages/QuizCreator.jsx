import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Trash2, Save, Globe, Clock, FileText, Eye, X, ChevronRight, ImagePlus, ArrowLeft } from 'lucide-react'
import { useQuizStore } from '../store/quizStore'
import { quizService } from '../services/quizService'
import QuestionEditor from '../components/quiz/QuestionEditor'
import Button from '../components/ui/Button'
import { useIsMobile } from '../hooks/useIsMobile'

const LABELS = ['A', 'B', 'C', 'D']

const TYPE_BADGE = {
  single:    { label: 'Jedna popr.',   bg: '#7F77DD', color: '#fff' },
  multiple:  { label: 'Wielokrotny',   bg: '#E1F5EE', color: '#085041' },
  truefalse: { label: 'Prawda/Fałsz', bg: '#FEF3EC', color: '#B45309' },
}

function SortableQuestion({ question, index, isActive, onClick, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })
  const badge = TYPE_BADGE[question.type] ?? TYPE_BADGE.single

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform), transition,
        display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', borderRadius: 12,
        cursor: 'pointer', userSelect: 'none',
        opacity: isDragging ? 0.5 : 1,
        border: `2px solid ${isActive ? '#7F77DD' : 'var(--border)'}`,
        background: isActive ? '#EEEDFE' : 'var(--bg-card)',
      }}
      onClick={onClick}
    >
      {/* Top row: grip + number + text + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          {...attributes} {...listeners}
          onClick={(e) => e.stopPropagation()}
          style={{ color: 'var(--fg)', opacity: 0.3, cursor: 'grab', background: 'none', border: 'none', padding: 0, display: 'flex', flexShrink: 0 }}
        >
          <GripVertical size={14} />
        </button>

        <span style={{
          flexShrink: 0, width: 24, height: 24, borderRadius: 7, fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace",
          background: isActive ? '#7F77DD' : 'var(--bg-muted)', color: isActive ? '#fff' : 'var(--fg)',
        }}>
          {index + 1}
        </span>

        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: isActive ? '#3C3489' : 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {question.text
            ? <span dangerouslySetInnerHTML={{ __html: question.text.replace(/<[^>]*>/g, '') }} />
            : <em style={{ opacity: 0.4 }}>Bez treści</em>}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(question.id) }}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 6, display: 'flex', color: 'var(--fg)', opacity: 0.25, transition: 'opacity 0.15s, color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = 1 }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.opacity = 0.25 }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Bottom row: type badge (right-aligned) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 22 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
          background: badge.bg, color: badge.color,
          fontFamily: "'Nunito Sans', sans-serif", letterSpacing: '0.02em',
        }}>
          {badge.label}
        </span>
      </div>
    </div>
  )
}

function PreviewModal({ questions, quizTitle, onClose }) {
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState({})
  const q = questions[current]

  if (!q) return null

  const selected = picked[current] ?? []
  const isLast = current === questions.length - 1

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg)', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1.5px solid var(--border)', background: 'var(--bg-card)' }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--fg)' }}>
            Podgląd — {quizTitle}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg)', opacity: 0.5, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ height: 4, background: 'var(--border)' }}>
          <div style={{ height: '100%', background: '#7F77DD', width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* Question */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', opacity: 0.45, marginBottom: 10 }}>
            Pytanie {current + 1} z {questions.length} • {q.points ?? 1} {(q.points ?? 1) === 1 ? 'punkt' : 'punkty'}
          </div>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--fg)', marginBottom: 20, lineHeight: 1.35 }}>
            {q.text || <em style={{ opacity: 0.4 }}>Brak treści pytania</em>}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, i) => {
              const isSel = selected.includes(i)
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const isMulti = q.type === 'multiple'
                    setPicked(prev => {
                      const cur = prev[current] ?? []
                      if (isMulti) return { ...prev, [current]: cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i] }
                      return { ...prev, [current]: [i] }
                    })
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                    border: `2px solid ${isSel ? '#7F77DD' : 'var(--border)'}`,
                    background: isSel ? '#EEEDFE' : 'var(--bg-card)',
                    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0, background: isSel ? '#7F77DD' : 'var(--bg-muted)', color: isSel ? '#fff' : 'var(--fg)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {LABELS[i]}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{opt.text || `Opcja ${LABELS[i]}`}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1.5px solid var(--border)', background: 'var(--bg-card)' }}>
          <button
            onClick={() => { setCurrent(c => Math.max(0, c - 1)); }}
            disabled={current === 0}
            style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--fg)', fontWeight: 600, fontSize: 14, cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Poprzednie
          </button>
          <button
            onClick={() => { if (!isLast) setCurrent(c => c + 1); else onClose() }}
            style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#7F77DD', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#3C3489'}
            onMouseLeave={e => e.currentTarget.style.background = '#7F77DD'}
          >
            {isLast ? 'Zamknij podgląd' : <><span>Następne</span><ChevronRight size={15} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuizCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    quiz, questions, activeQuestionId,
    setQuizField, addQuestion, removeQuestion, reorderQuestions, setActiveQuestion, loadQuiz, reset,
  } = useQuizStore()

  const [savingDraft, setSavingDraft] = useState(false)
  const [savingPublish, setSavingPublish] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [titleEditing, setTitleEditing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'editor'
  const isMobile = useIsMobile()
  const bannerRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (id) {
      quizService.get(id).then((res) => {
        loadQuiz(res.data.quiz, res.data.questions)
      }).catch(() => navigate('/creator'))
    } else {
      reset()
    }
  }, [id])

  useEffect(() => {
    if (!activeQuestionId && questions.length) {
      setActiveQuestion(questions[0].id)
    }
  }, [questions.length])

  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      reorderQuestions(arrayMove(questions, oldIndex, newIndex))
    }
  }

  async function handleSave(publish = false) {
    const setLoading = publish ? setSavingPublish : setSavingDraft
    setLoading(true)
    setSaveMsg('')
    try {
      const payload = { ...quiz, published: publish || quiz.published, questions }
      if (quiz.id) {
        await quizService.update(quiz.id, payload)
      } else {
        const res = await quizService.create(payload)
        setQuizField('id', res.data.id)
        navigate(`/creator/${res.data.id}`, { replace: true })
      }
      setSaveMsg(publish ? 'Opublikowano!' : 'Zapisano!')
      setTimeout(() => setSaveMsg(''), 2500)
    } catch {
      setSaveMsg('Błąd zapisu.')
    } finally {
      setLoading(false)
    }
  }

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) || null
  const activeIndex = questions.findIndex((q) => q.id === activeQuestionId)

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1.5px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <FileText size={15} style={{ color: 'var(--fg)', opacity: 0.4, flexShrink: 0 }} />

        {titleEditing ? (
          <input
            autoFocus
            value={quiz.title}
            onChange={(e) => setQuizField('title', e.target.value)}
            onBlur={() => setTitleEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setTitleEditing(false)}
            style={{ flex: 1, background: 'transparent', fontSize: 14, fontWeight: 700, color: 'var(--fg)', outline: 'none', borderBottom: '2px solid #7F77DD', fontFamily: "'Nunito Sans', sans-serif" }}
          />
        ) : (
          <button
            onClick={() => setTitleEditing(true)}
            style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 700, color: 'var(--fg)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#7F77DD'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--fg)'}
          >
            {quiz.title || 'Kliknij, aby zmienić tytuł'}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          {saveMsg && (
            <span style={{ fontSize: 12, color: saveMsg.startsWith('Błąd') ? '#ef4444' : '#1D9E75', fontWeight: 600 }}>{saveMsg}</span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg)', opacity: 0.5, border: '1.5px solid var(--border)', borderRadius: 10, padding: '6px 10px' }}>
            <Clock size={12} />
            <input
              type="number"
              value={quiz.timeLimit || ''}
              onChange={(e) => setQuizField('timeLimit', e.target.value ? +e.target.value : null)}
              placeholder="∞"
              min={1}
              style={{ width: 36, background: 'transparent', outline: 'none', textAlign: 'center', color: 'var(--fg)', fontFamily: "'Nunito Sans', sans-serif", fontSize: 12 }}
            />
            <span>min</span>
          </div>

          {/* Banner upload */}
          <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const file = e.target.files[0]; if (!file) return
            const reader = new FileReader()
            reader.onload = ev => setQuizField('bannerUrl', ev.target.result)
            reader.readAsDataURL(file); e.target.value = ''
          }} />
          <button
            onClick={() => quiz.bannerUrl ? setQuizField('bannerUrl', null) : bannerRef.current?.click()}
            title={quiz.bannerUrl ? 'Usuń baner' : 'Dodaj baner quizu'}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 10, border: `1.5px solid ${quiz.bannerUrl ? '#7F77DD' : 'var(--border)'}`, background: quiz.bannerUrl ? '#EEEDFE' : 'transparent', color: quiz.bannerUrl ? '#7F77DD' : 'var(--fg)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", transition: 'all 0.15s' }}
          >
            {quiz.bannerUrl
              ? <><img src={quiz.bannerUrl} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} /> Baner</>
              : <><ImagePlus size={13} /> Baner</>
            }
          </button>

          <Button variant="ghost" size="sm" onClick={() => setPreview(true)}>
            <Eye size={13} />
            <span className="hidden sm:block">Podgląd</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave(false)} loading={savingDraft}>
            <Save size={13} />
            <span className="hidden sm:block">Zapisz</span>
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} loading={savingPublish}>
            <Globe size={13} />
            <span className="hidden sm:block">Opublikuj</span>
          </Button>
        </div>
      </div>

      {/* Split layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: question list — hidden on mobile when editing */}
        {(!isMobile || mobileView === 'list') && (
          <aside style={{ width: isMobile ? '100%' : 240, flexShrink: 0, borderRight: isMobile ? 'none' : '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-muted)' }}>
            <div style={{ padding: 10, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                  {questions.map((q, i) => (
                    <SortableQuestion
                      key={q.id}
                      question={q}
                      index={i}
                      isActive={q.id === activeQuestionId}
                      onClick={() => { setActiveQuestion(q.id); if (isMobile) setMobileView('editor') }}
                      onRemove={removeQuestion}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div style={{ padding: '8px 10px 10px', borderTop: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: 'var(--fg)', opacity: 0.35, margin: 0 }}>
                {questions.length} {questions.length === 1 ? 'pytanie' : questions.length < 5 ? 'pytania' : 'pytań'}
              </p>
              {isMobile && (
                <button
                  onClick={() => { addQuestion(); setMobileView('editor') }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#7F77DD', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  <Plus size={14} /> Dodaj
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Right: editor — hidden on mobile when viewing list */}
        {(!isMobile || mobileView === 'editor') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-card)' }}>
            {isMobile && (
              <div style={{ padding: '8px 12px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setMobileView('list')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--fg)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", padding: '4px 0' }}
                >
                  <ArrowLeft size={15} /> Lista pytań
                </button>
              </div>
            )}
            <QuestionEditor
              question={activeQuestion}
              questionIndex={activeIndex}
              onRemove={removeQuestion}
              onAddQuestion={addQuestion}
            />
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          questions={questions}
          quizTitle={quiz.title}
          onClose={() => setPreview(false)}
        />
      )}
    </main>
  )
}

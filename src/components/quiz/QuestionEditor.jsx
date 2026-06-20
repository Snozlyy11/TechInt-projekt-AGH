import { useRef } from 'react'
import { AlignLeft, Square, CheckSquare, ToggleRight, Trash2, Minus, Plus, ImagePlus, X } from 'lucide-react'
import { useQuizStore } from '../../store/quizStore'
import AnswerOption from './AnswerOption'
import RichTextEditor from '../ui/RichTextEditor'

const TYPES = [
  { type: 'single',    label: 'Jedna poprawna',    Icon: Square },
  { type: 'multiple',  label: 'Wielokrotny wybór', Icon: CheckSquare },
  { type: 'truefalse', label: 'Prawda / Fałsz',   Icon: ToggleRight },
]

function SectionLabel({ children }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg)', opacity: 0.45 }}>
      {children}
    </span>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange} style={{ width: 38, height: 22, borderRadius: 11, position: 'relative', flexShrink: 0, background: checked ? '#7F77DD' : 'var(--border)', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{label}</span>
    </label>
  )
}

export default function QuestionEditor({ question, questionIndex, onRemove, onAddQuestion }) {
  const { updateQuestion, updateOption, setCorrect } = useQuizStore()
  const imgRef = useRef()

  if (!question) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, color: 'var(--fg)', opacity: 0.3 }}>
        <AlignLeft size={32} strokeWidth={1} />
        <p style={{ fontSize: 14 }}>Wybierz pytanie lub dodaj nowe</p>
      </div>
    )
  }

  const isTrueFalse = question.type === 'truefalse'
  const isRequired = question.required ?? false
  const points = question.points ?? 1

  function handleImageFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateQuestion(question.id, { imageUrl: ev.target.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1.5px solid var(--border)', background: 'var(--bg-muted)', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, color: '#7F77DD' }}>
          Pytanie {questionIndex + 1}
        </span>
        <button
          onClick={() => onRemove(question.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9, border: '1.5px solid #fecaca', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 size={13} /> Usuń pytanie
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Question text + image — 70/30 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>Treść pytania</SectionLabel>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* 70% — rich text */}
            <div style={{ flex: '0 0 70%' }}>
              <RichTextEditor
                key={question.id}
                value={question.text}
                onChange={html => updateQuestion(question.id, { text: html })}
                placeholder="Wpisz treść pytania…"
                minHeight={130}
              />
            </div>

            {/* 30% — image upload */}
            <div style={{ flex: 1 }}>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
              {question.imageUrl ? (
                <div style={{ position: 'relative', height: 160, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border)' }}>
                  <img src={question.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  <button
                    onClick={() => updateQuestion(question.id, { imageUrl: null })}
                    style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                  >
                    <X size={13} />
                  </button>
                  <button
                    onClick={() => imgRef.current?.click()}
                    style={{ position: 'absolute', bottom: 6, right: 6, fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 7, background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    Zmień
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => imgRef.current?.click()}
                  style={{ height: 160, border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', background: 'var(--bg-muted)', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.background = '#EEEDFE' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-muted)' }}
                >
                  <ImagePlus size={20} style={{ color: 'var(--fg)', opacity: 0.35 }} />
                  <span style={{ fontSize: 11, color: 'var(--fg)', opacity: 0.45, textAlign: 'center', fontFamily: "'Nunito Sans', sans-serif" }}>Dodaj zdjęcie</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type + Points */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 220 }}>
            <SectionLabel>Typ odpowiedzi</SectionLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(({ type, label, Icon }) => {
                const active = question.type === type
                return (
                  <button key={type} onClick={() => updateQuestion(question.id, { type })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `2px solid ${active ? '#7F77DD' : 'var(--border)'}`, background: active ? '#EEEDFE' : 'var(--bg-muted)', color: active ? '#3C3489' : 'var(--fg)', cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", transition: 'all 0.15s' }}>
                    <Icon size={13} /> {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SectionLabel>
            {isTrueFalse ? 'Odpowiedź' : `Opcje odpowiedzi ${question.type === 'single' ? '· kliknij literę = poprawna' : '· zaznacz wszystkie poprawne'}`}
          </SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.options.map((option, i) => (
              <AnswerOption key={option.id} option={option} index={i} questionType={question.type} readonly={isTrueFalse}
                onTextChange={text => updateOption(question.id, option.id, { text })}
                onToggleCorrect={() => setCorrect(question.id, option.id)}
              />
            ))}
          </div>

          <SectionLabel>Dodać punktację</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isRequired ? 1 : 0.35, pointerEvents: isRequired ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
              <button onClick={() => updateQuestion(question.id, { points: Math.max(0, points - 1) })}
                style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--fg)' }}>
                <Minus size={12} />
              </button>
              <span style={{ minWidth: 32, textAlign: 'center', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: '#7F77DD' }}>{points} pkt</span>
              <button onClick={() => updateQuestion(question.id, { points: Math.min(10, points + 1) })}
                style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--fg)' }}>
                <Plus size={12} />
              </button>
            </div>
            <Toggle checked={isRequired} onChange={() => updateQuestion(question.id, { required: !isRequired })} label="Wymagane" />
          </div>
        </div>

        {/* Add question divider */}
        {onAddQuestion && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)', opacity: 0.4 }} />
            <button onClick={onAddQuestion}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--fg)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Nunito Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD'; e.currentTarget.style.color = '#7F77DD'; e.currentTarget.style.background = '#EEEDFE' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--bg-card)' }}
            >
              <Plus size={14} /> Dodaj pytanie
            </button>
            <div style={{ flex: 1, height: 1, background: 'var(--border)', opacity: 0.4 }} />
          </div>
        )}
      </div>
    </div>
  )
}

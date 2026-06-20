import { Check } from 'lucide-react'

const LABELS = ['A', 'B', 'C', 'D']

const ACCENT = [
  { border: '#7F77DD', bg: '#EEEDFE', text: '#3C3489' },
  { border: '#F0997B', bg: '#FAECE7', text: '#993C1D' },
  { border: '#FAC725', bg: '#FFF8CC', text: '#7a6000' },
  { border: '#1D9E75', bg: '#E1F5EE', text: '#085041' },
]

export default function AnswerOption({ option, index, questionType, onTextChange, onToggleCorrect, readonly = false }) {
  const accent = ACCENT[index] ?? ACCENT[0]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
      borderRadius: 12, border: `2px solid ${option.correct ? accent.border : 'var(--border)'}`,
      background: option.correct ? accent.bg : 'var(--bg-muted)',
      transition: 'border-color 0.15s, background 0.15s',
    }}>
      <button
        type="button"
        onClick={onToggleCorrect}
        title={questionType === 'single' || questionType === 'truefalse' ? 'Zaznacz jako poprawną' : 'Przełącz poprawność'}
        style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: 8, border: `2px solid ${option.correct ? accent.border : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
          background: option.correct ? accent.border : 'var(--bg-card)',
          color: option.correct ? '#fff' : 'var(--fg)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {option.correct ? <Check size={12} strokeWidth={3} /> : LABELS[index]}
      </button>

      {readonly ? (
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: option.correct ? accent.text : 'var(--fg)' }}>
          {option.text}
        </span>
      ) : (
        <input
          type="text"
          value={option.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Opcja ${LABELS[index]}…`}
          style={{
            flex: 1, background: 'transparent', fontSize: 14, fontWeight: 500,
            color: 'var(--fg)', outline: 'none', border: 'none',
            fontFamily: "'Nunito Sans', sans-serif",
          }}
        />
      )}
    </div>
  )
}

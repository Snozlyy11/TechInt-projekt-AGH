import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react'

function ToolBtn({ onMouseDown, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown() }}
      style={{
        padding: '4px 6px', borderRadius: 6, border: 'none', cursor: 'pointer',
        background: 'transparent', color: 'var(--fg)', opacity: 0.7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, opacity 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#EEEDFE'; e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#7F77DD' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = 0.7; e.currentTarget.style.color = 'var(--fg)' }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 100 }) {
  const ref = useRef()
  const isFocused = useRef(false)

  useEffect(() => {
    if (ref.current && !isFocused.current) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    ref.current?.focus()
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const charCount = value ? value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').length : 0

  return (
    <div
      className="rte-wrapper"
      style={{ border: '2px solid var(--border)', borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s' }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = '#7F77DD'; isFocused.current = true }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; isFocused.current = false }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', borderBottom: '1.5px solid var(--border)', background: 'var(--bg-muted)', flexWrap: 'wrap' }}>
        <ToolBtn onMouseDown={() => exec('bold')} title="Pogrubienie"><Bold size={14} /></ToolBtn>
        <ToolBtn onMouseDown={() => exec('italic')} title="Kursywa"><Italic size={14} /></ToolBtn>
        <ToolBtn onMouseDown={() => exec('underline')} title="Podkreślenie"><Underline size={14} /></ToolBtn>
        <Divider />
        <ToolBtn onMouseDown={() => exec('justifyLeft')} title="Wyrównaj do lewej"><AlignLeft size={14} /></ToolBtn>
        <ToolBtn onMouseDown={() => exec('justifyCenter')} title="Wyśrodkuj"><AlignCenter size={14} /></ToolBtn>
        <ToolBtn onMouseDown={() => exec('justifyRight')} title="Wyrównaj do prawej"><AlignRight size={14} /></ToolBtn>
        <Divider />
        <ToolBtn onMouseDown={() => exec('insertUnorderedList')} title="Lista punktowana"><List size={14} /></ToolBtn>
        <ToolBtn onMouseDown={() => exec('insertOrderedList')} title="Lista numerowana"><ListOrdered size={14} /></ToolBtn>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fg)', opacity: 0.35, fontFamily: "'JetBrains Mono', monospace" }}>
          {charCount}
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight, padding: '10px 12px', fontSize: 14,
          fontFamily: "'Nunito Sans', sans-serif", color: 'var(--fg)',
          lineHeight: 1.65, outline: 'none', background: 'var(--bg-card)',
        }}
      />
    </div>
  )
}

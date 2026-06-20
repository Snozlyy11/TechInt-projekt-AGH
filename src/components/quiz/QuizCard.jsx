import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, Play, Trash2, Clock, BookOpen, Users, Copy, Check, XCircle } from 'lucide-react'
import Badge from '../ui/Badge'
import { sessionService } from '../../services/sessionService'

const SESSION_KEY = (id) => `kq-session-${id}`

const pill = {
  base: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif", cursor: 'pointer', border: 'none', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' },
}

export default function QuizCard({ quiz, onDelete, from = '/dashboard' }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY(quiz.id))) } catch { return null }
  })
  const [creating, setCreating] = useState(false)
  const [closing, setClosing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hoverDelete, setHoverDelete] = useState(false)

  const createSession = async () => {
    setCreating(true)
    try {
      const r = await sessionService.create(quiz.id)
      localStorage.setItem(SESSION_KEY(quiz.id), JSON.stringify(r.data))
      setSession(r.data)
    } catch { } finally {
      setCreating(false)
    }
  }

  const closeSession = async () => {
    if (!session) return
    setClosing(true)
    try {
      await sessionService.close(session.code)
    } catch { } finally {
      localStorage.removeItem(SESSION_KEY(quiz.id))
      setSession(null)
      setClosing(false)
    }
  }

  const copyLink = () => {
    if (!session) return
    navigator.clipboard.writeText(session.joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, transition: 'box-shadow 0.2s, border-color 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#7F77DD40' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; setHoverDelete(false) }}
      onMouseMove={() => setHoverDelete(true)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--fg)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {quiz.title || 'Quiz bez tytułu'}
          </h3>
          {quiz.description && (
            <p style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.5, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {quiz.description}
            </p>
          )}
        </div>
        <Badge variant={quiz.published ? 'green' : 'default'}>
          {quiz.published ? 'Opublikowany' : 'Szkic'}
        </Badge>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--fg)', opacity: 0.5, marginBottom: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BookOpen size={11} /> {quiz.questionCount ?? 0} pytań
        </span>
        {quiz.timeLimit && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {quiz.timeLimit} min
          </span>
        )}
      </div>

      {/* Session panel */}
      {session && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 12, background: '#EEEDFE', border: '1.5px solid #C5C2F8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#3C3489', fontWeight: 600 }}>Sesja aktywna</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to={`/session/${session.code}/results`} style={{ fontSize: 11, color: '#7F77DD', fontWeight: 600, textDecoration: 'none' }}>
                Wyniki →
              </Link>
              <button
                onClick={closeSession}
                disabled={closing}
                title="Zakończ sesję"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 7, border: '1.5px solid #F0997B', color: '#993C1D', background: 'transparent', cursor: closing ? 'not-allowed' : 'pointer', fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif", opacity: closing ? 0.5 : 1, transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!closing) e.currentTarget.style.background = '#FAECE7' }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <XCircle size={11} /> {closing ? 'Kończę...' : 'Zakończ'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 20, letterSpacing: '0.2em', color: '#3C3489' }}>
              {session.code}
            </span>
            <button
              onClick={copyLink}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 10px', borderRadius: 8, border: '1.5px solid #7F77DD', color: '#7F77DD', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontFamily: "'Nunito Sans', sans-serif", transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#7F77DD20'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Skopiowano' : 'Kopiuj link'}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Link
          to={`/quiz/${quiz.id}`}
          state={{ from }}
          style={{ ...pill.base, background: '#7F77DD', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#3C3489'}
          onMouseLeave={e => e.currentTarget.style.background = '#7F77DD'}
        >
          <Play size={11} /> Rozwiąż
        </Link>
        <Link
          to={`/creator/${quiz.id}`}
          style={{ ...pill.base, background: 'var(--bg-muted)', color: 'var(--fg)', border: '1.5px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EEEDFE'; e.currentTarget.style.color = '#7F77DD' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--fg)' }}
        >
          <Edit3 size={11} /> Edytuj
        </Link>
        {!session && (
          <button
            onClick={createSession}
            disabled={creating}
            style={{ ...pill.base, background: 'var(--bg-muted)', color: 'var(--fg)', border: '1.5px solid var(--border)', opacity: creating ? 0.5 : 1 }}
            onMouseEnter={e => { if (!creating) { e.currentTarget.style.background = '#EEEDFE'; e.currentTarget.style.color = '#7F77DD' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--fg)' }}
          >
            <Users size={11} /> {creating ? 'Tworzę...' : 'Sesja'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(quiz.id)}
            style={{ marginLeft: 'auto', padding: '6px 8px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', color: hoverDelete ? '#ef4444' : 'var(--fg)', opacity: hoverDelete ? 1 : 0.3, transition: 'color 0.15s, opacity 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = 1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.opacity = 0.3 }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

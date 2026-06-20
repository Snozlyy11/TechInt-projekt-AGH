import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Shield, Trash2, ChevronDown, ChevronRight, Users, BookOpen, Globe, Edit3 } from 'lucide-react'
import { adminService } from '../services/adminService'

function StatusBadge({ published }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
      background: published ? '#E1F5EE' : '#F7F6F2',
      color: published ? '#085041' : '#888780',
    }}>
      {published ? 'Opublikowany' : 'Szkic'}
    </span>
  )
}

function UserRow({ user, onDeleteQuiz }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (quizId, title) => {
    if (!confirm(`Usunąć quiz "${title}"?`)) return
    setDeleting(quizId)
    try {
      await onDeleteQuiz(quizId)
    } finally {
      setDeleting(null)
    }
  }

  const isAdmin = user.role === 'admin'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* User header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: isAdmin ? '#7F77DD' : '#E8E6DF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: isAdmin ? '#fff' : '#5F5E5A', fontFamily: "'Nunito', sans-serif" }}>
            {(user.name || user.email)[0].toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>{user.name}</span>
            {isAdmin && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#7F77DD', color: '#fff', padding: '2px 8px', borderRadius: 100, letterSpacing: '0.06em' }}>ADMIN</span>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.5 }}>{user.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={12} /> {user.quizzes.length} {user.quizzes.length === 1 ? 'quiz' : user.quizzes.length < 5 ? 'quizy' : 'quizów'}
          </span>
          {open ? <ChevronDown size={16} style={{ color: 'var(--fg)', opacity: 0.4 }} /> : <ChevronRight size={16} style={{ color: 'var(--fg)', opacity: 0.4 }} />}
        </div>
      </button>

      {/* Quiz list */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {user.quizzes.length === 0 ? (
            <p style={{ padding: '14px 18px', fontSize: 13, color: 'var(--fg)', opacity: 0.4 }}>Brak quizów.</p>
          ) : (
            user.quizzes.map(quiz => (
              <div key={quiz.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px 10px 70px', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {quiz.title || 'Bez tytułu'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--fg)', opacity: 0.45 }}>
                    {quiz.questionCount} {quiz.questionCount === 1 ? 'pytanie' : quiz.questionCount < 5 ? 'pytania' : 'pytań'}
                  </span>
                </div>
                <StatusBadge published={quiz.published} />
                <button
                  onClick={() => navigate(`/creator/${quiz.id}`)}
                  title="Edytuj quiz"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#7F77DD', opacity: 0.6, transition: 'opacity 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = '#EEEDFE' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(quiz.id, quiz.title)}
                  disabled={deleting === quiz.id}
                  title="Usuń quiz"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: deleting === quiz.id ? 'not-allowed' : 'pointer', color: '#ef4444', opacity: deleting === quiz.id ? 0.4 : 0.6, transition: 'opacity 0.15s, background 0.15s' }}
                  onMouseEnter={e => { if (deleting !== quiz.id) { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = '#FEF2F2' } }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    adminService.getUsers()
      .then(r => setUsers(r.data))
      .catch(() => setError('Nie udało się załadować danych.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleDeleteQuiz = async (quizId) => {
    await adminService.deleteQuiz(quizId)
    setUsers(prev => prev.map(u => ({
      ...u,
      quizzes: u.quizzes.filter(q => q.id !== quizId),
    })))
  }

  const totalQuizzes = users.reduce((s, u) => s + u.quizzes.length, 0)
  const totalPublished = users.reduce((s, u) => s + u.quizzes.filter(q => q.published).length, 0)

  return (
    <main style={{ flex: 1, background: 'var(--bg)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7F77DD', flexShrink: 0 }}>
            <Shield size={22} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>Panel administracyjny</h1>
            <p style={{ fontSize: 13, color: 'var(--fg)', opacity: 0.5, margin: 0 }}>Zarządzaj użytkownikami i quizami platformy</p>
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { Icon: Users,    label: 'Użytkownicy',      value: users.length,    color: '#7F77DD', bg: '#EEEDFE' },
              { Icon: BookOpen, label: 'Wszystkie quizy',  value: totalQuizzes,    color: '#1D9E75', bg: '#E1F5EE' },
              { Icon: Globe,    label: 'Opublikowane',     value: totalPublished,  color: '#F0997B', bg: '#FAECE7' },
            ].map(({ Icon, label, value, color, bg }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--fg)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg)', opacity: 0.5 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: '#7F77DD' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#ef4444' }}>
            <p style={{ fontSize: 15, marginBottom: 12 }}>{error}</p>
            <button onClick={load} style={{ fontSize: 13, fontWeight: 600, color: '#7F77DD', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Spróbuj ponownie
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map(user => (
              <UserRow key={user.id} user={user} onDeleteQuiz={handleDeleteQuiz} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

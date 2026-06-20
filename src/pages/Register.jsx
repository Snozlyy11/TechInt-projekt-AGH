import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  async function onSubmit(data) {
    setLoading(true)
    setApiError('')
    try {
      const res = await authService.register(data.name, data.email, data.password)
      login(res.data.token, res.data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', marginBottom: 16 }}>
            <img src="/logo_64x64.png" alt="KreatorQuiz" style={{ width: 56, height: 56, objectFit: 'contain' }} />
          </Link>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}>
            Utwórz konto
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.55 }}>Zacznij tworzyć quizy za darmo</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 28 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Imię i nazwisko"
              type="text"
              placeholder="Jan Kowalski"
              error={errors.name?.message}
              {...register('name', { required: 'Podaj imię i nazwisko' })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jan@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Podaj email',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Nieprawidłowy email' },
              })}
            />
            <Input
              label="Hasło"
              type="password"
              placeholder="Minimum 8 znaków"
              error={errors.password?.message}
              {...register('password', {
                required: 'Podaj hasło',
                minLength: { value: 8, message: 'Hasło musi mieć co najmniej 8 znaków' },
              })}
            />
            <Input
              label="Powtórz hasło"
              type="password"
              placeholder="••••••••"
              error={errors.confirm?.message}
              {...register('confirm', {
                required: 'Powtórz hasło',
                validate: (v) => v === watch('password') || 'Hasła nie są takie same',
              })}
            />

            {apiError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#b91c1c', background: '#fef2f2', borderRadius: 10, padding: '10px 14px', border: '1px solid #fecaca' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {apiError}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Utwórz konto
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--fg)', opacity: 0.6, marginTop: 20 }}>
          Masz już konto?{' '}
          <Link to="/login" style={{ color: '#7F77DD', fontWeight: 600, textDecoration: 'none' }}>
            Zaloguj się
          </Link>
        </p>
      </div>
    </main>
  )
}

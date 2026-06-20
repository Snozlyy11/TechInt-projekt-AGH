import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  async function onSubmit(data) {
    setLoading(true)
    setApiError('')
    try {
      const res = await authService.login(data.email, data.password)
      login(res.data.token, res.data.user)
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Nieprawidłowy email lub hasło.')
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
            Zaloguj się
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg)', opacity: 0.55 }}>Witaj z powrotem!</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 28 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Podaj hasło' })}
            />

            {apiError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#b91c1c', background: '#fef2f2', borderRadius: 10, padding: '10px 14px', border: '1px solid #fecaca' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {apiError}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Zaloguj się
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--fg)', opacity: 0.6, marginTop: 20 }}>
          Nie masz konta?{' '}
          <Link to="/register" style={{ color: '#7F77DD', fontWeight: 600, textDecoration: 'none' }}>
            Zarejestruj się
          </Link>
        </p>
      </div>
    </main>
  )
}

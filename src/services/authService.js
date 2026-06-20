import api from './api'

const MOCK_USERS = [
  { id: 1, name: 'Admin',       email: 'admin@test.com',  password: 'admin123',  role: 'admin' },
  { id: 2, name: 'Jan Kowalski', email: 'jan@test.com',   password: 'test123',   role: 'user'  },
]

function mockLogin(email, password) {
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
  if (!user) return Promise.reject({ response: { data: { message: 'Nieprawidłowy email lub hasło.' } } })
  const { password: _, ...safeUser } = user
  return Promise.resolve({ data: { token: `mock-token-${user.id}`, user: safeUser } })
}

function mockRegister(name, email, password) {
  if (MOCK_USERS.find((u) => u.email === email))
    return Promise.reject({ response: { data: { message: 'Ten email jest już zajęty.' } } })
  const newUser = { id: Date.now(), name, email, role: 'user' }
  return Promise.resolve({ data: { token: `mock-token-${newUser.id}`, user: newUser } })
}

const USE_MOCK = false

export const authService = {
  login:          (email, password)              => USE_MOCK ? mockLogin(email, password)          : api.post('/auth/login', { email, password }),
  register:       (name, email, password)        => USE_MOCK ? mockRegister(name, email, password) : api.post('/auth/register', { name, email, password }),
  me:             ()                             => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
  changeEmail:    (newEmail, password)           => api.put('/auth/change-email', { newEmail, password }),
}

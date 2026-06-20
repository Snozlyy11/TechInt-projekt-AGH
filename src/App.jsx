import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSystemTheme } from './hooks/useSystemTheme'
import Navbar from './components/layout/Navbar'
import ThemeToggle from './components/layout/ThemeToggle'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import QuizCreator from './pages/QuizCreator'
import QuizSolver from './pages/QuizSolver'
import AIPanel from './pages/AIPanel'
import JoinSession from './pages/JoinSession'
import SessionRoom from './pages/SessionRoom'
import SessionResults from './pages/SessionResults'
import Catalog from './pages/Catalog'
import AdminPanel from './pages/AdminPanel'

function AppRoutes() {
  useSystemTheme()

  return (
    <>
      <Navbar />
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz/:id" element={<QuizSolver />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/session/:code" element={<SessionRoom />} />
        <Route path="/session/:code/results" element={<SessionResults />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/creator" element={<ProtectedRoute><QuizCreator /></ProtectedRoute>} />
        <Route path="/creator/:id" element={<ProtectedRoute><QuizCreator /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIPanel /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingState } from './components/LoadingState'
import { useAuth } from './hooks/useAuth'
import { DomControlRoomPage } from './pages/DomControlRoomPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SubDashboardPage } from './pages/SubDashboardPage'

function ProtectedRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState label="Đang kiểm tra phiên đăng nhập…" />
  if (!user) return <Navigate to="/login" replace />
  return <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dom/:sessionId" element={<DomControlRoomPage />} />
    <Route path="/sub/:sessionId" element={<SubDashboardPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}

export default function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="*" element={<ProtectedRoutes />} /></Routes>
}

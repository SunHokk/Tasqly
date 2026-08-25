import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { lightTheme, darkTheme } from './styles/theme'
import useThemeStore from './store/themeStore'
import AppLayout from './components/AppLayout'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import TasksPage from './pages/tasks/TasksPage'
import CalendarPage from './pages/calendar/CalendarPage'
import ProfilePage from './pages/profile/ProfilePage'
import NotificationSettingsPage from './pages/notifications/NotificationSettingsPage'
import { supabase } from './utils/supabase'

function App() {
  const { isDark } = useThemeStore()
  const [session, setSession] = useState(undefined) // undefined = belum dicek

  useEffect(() => {
    // Cek session saat app pertama dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen perubahan auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Masih loading session — jangan render apapun dulu
  if (session === undefined) return null

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: isDark ? darkTheme.token : lightTheme.token,
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* Root: kalau sudah login → dashboard, belum → auth */}
          <Route path="/" element={
            session ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />
          } />

          {/* Auth: kalau sudah login langsung redirect ke dashboard */}
          <Route path="/auth" element={
            session ? <Navigate to="/dashboard" /> : <AuthPage />
          } />

          <Route path="/dashboard" element={
            session ? <AppLayout><DashboardPage /></AppLayout> : <Navigate to="/auth" />
          } />
          <Route path="/tasks" element={
            session ? <AppLayout><TasksPage /></AppLayout> : <Navigate to="/auth" />
          } />
          <Route path="/calendar" element={
            session ? <AppLayout><CalendarPage /></AppLayout> : <Navigate to="/auth" />
          } />
          <Route path="/profile" element={
            session ? <AppLayout><ProfilePage /></AppLayout> : <Navigate to="/auth" />
          } />
          <Route path="/notification-settings" element={
            session ? <AppLayout><NotificationSettingsPage /></AppLayout> : <Navigate to="/auth" />
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
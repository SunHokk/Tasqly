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

function App() {
  const { isDark } = useThemeStore()

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: isDark ? darkTheme.token : lightTheme.token,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <AppLayout><DashboardPage /></AppLayout>
          } />
          <Route path="/tasks" element={
            <AppLayout><TasksPage /></AppLayout>
          } />
          <Route path="/calendar" element={
            <AppLayout><CalendarPage /></AppLayout>
          } />
          <Route path="/profile" element={
            <AppLayout><ProfilePage /></AppLayout>
          } />
          <Route path="/notification-settings" element={
            <AppLayout><NotificationSettingsPage /></AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
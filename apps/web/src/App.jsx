import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { lightTheme, darkTheme } from './styles/theme'
import useThemeStore from './store/themeStore'
import AppLayout from './components/AppLayout'

// Pages (kita buat setelah ini)
import DashboardPage from './pages/dashboard/DashboardPage'
import TasksPage from './pages/tasks/TasksPage'
import CalendarPage from './pages/calendar/CalendarPage'

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
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <AppLayout><DashboardPage /></AppLayout>
          } />
          <Route path="/tasks" element={
            <AppLayout><TasksPage /></AppLayout>
          } />
          <Route path="/calendar" element={
            <AppLayout><CalendarPage /></AppLayout>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
import ProfilePage from './pages/profile/ProfilePage'
import NotificationSettingsPage from './pages/notifications/NotificationSettingsPage'

<Route path="/profile" element={
  <AppLayout><ProfilePage /></AppLayout>
} />
<Route path="/notification-settings" element={
  <AppLayout><NotificationSettingsPage /></AppLayout>
} />
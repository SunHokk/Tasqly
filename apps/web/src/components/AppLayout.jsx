import { useEffect, useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Switch, Typography } from 'antd'
import {
  DashboardOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import useThemeStore from '../store/themeStore'

const { Sider, Header, Content } = Layout
const { Text } = Typography

function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useThemeStore()
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url)
      }
    }
    fetchAvatar()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/tasks',     icon: <CheckSquareOutlined />, label: 'Tasks' },
    { key: '/calendar',  icon: <CalendarOutlined />, label: 'Calendar' },
  ]

  const profileMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Edit Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'theme',
      icon: isDark ? <SunOutlined /> : <MoonOutlined />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            size="small"
            onClick={(_, e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      key: 'notification',
      icon: <BellOutlined />,
      label: 'Notifikasi',
      onClick: () => navigate('/notification-settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme={isDark ? 'dark' : 'light'}
        style={{
          borderRight: `1px solid ${isDark ? '#2A3150' : '#E2E8F0'}`,
        }}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#2A3150' : '#E2E8F0'}`,
        }}>
          <Text strong style={{ fontSize: 18, color: '#2D8EFF' }}>
            ✓ Tasqly
          </Text>
        </div>

        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: isDark ? '#1C2033' : '#FFFFFF',
          borderBottom: `1px solid ${isDark ? '#2A3150' : '#E2E8F0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 24px',
        }}>
          <Dropdown
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ background: '#2D8EFF', cursor: 'pointer', border: 'none' }}
            />
          </Dropdown>
        </Header>

        <Content style={{
          padding: 24,
          background: isDark ? '#0F1117' : '#F5F7FA',
          minHeight: 'calc(100vh - 64px)',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
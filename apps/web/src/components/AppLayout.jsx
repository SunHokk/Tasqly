import { useEffect, useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Switch, Typography, Grid } from 'antd'
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
const { useBreakpoint } = Grid

function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useThemeStore()
  const [avatarUrl, setAvatarUrl] = useState(null)
  const screens = useBreakpoint()

  const isMobile = !screens.md // < 768px = mobile

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

  // Bottom nav items (mobile only) — 4 item: 3 pages + profile
  const bottomNavItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/tasks',     icon: <CheckSquareOutlined />, label: 'Tasks' },
    { key: '/calendar',  icon: <CalendarOutlined />, label: 'Calendar' },
    { key: 'profile-menu', icon: (
        <Avatar
          src={avatarUrl}
          icon={<UserOutlined />}
          size={24}
          style={{ background: '#2D8EFF', border: 'none' }}
        />
      ), label: 'Profile'
    },
  ]

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar — desktop only */}
      {!isMobile && (
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
      )}

      <Layout>
        {/* Header */}
        <Header style={{
          background: isDark ? '#1C2033' : '#FFFFFF',
          borderBottom: `1px solid ${isDark ? '#2A3150' : '#E2E8F0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          padding: '0 16px',
        }}>
          {/* Logo di header — mobile only */}
          {isMobile && (
            <Text strong style={{ fontSize: 16, color: '#2D8EFF' }}>
              ✓ Tasqly
            </Text>
          )}

          <Dropdown
            menu={{ items: profileMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            open={isMobile ? profileDropdownOpen : undefined}
            onOpenChange={isMobile ? setProfileDropdownOpen : undefined}
          >
            <Avatar
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{
                background: '#2D8EFF',
                cursor: 'pointer',
                border: 'none',
                objectFit: 'cover',
              }}
            />
          </Dropdown>
        </Header>

        {/* Content — kasih padding bottom di mobile biar tidak ketutup bottom nav */}
        <Content style={{
          padding: isMobile ? '16px 12px' : 24,
          paddingBottom: isMobile ? 76 : 24,
          background: isDark ? '#0F1117' : '#F5F7FA',
          minHeight: 'calc(100vh - 64px)',
          overflowX: 'hidden',
        }}>
          {children}
        </Content>

        {/* Bottom Navigation — mobile only */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: isDark ? '#1C2033' : '#FFFFFF',
            borderTop: `1px solid ${isDark ? '#2A3150' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom)', // support iPhone notch
          }}>
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.key

              if (item.key === 'profile-menu') {
                return (
                  <Dropdown
                    key={item.key}
                    menu={{ items: profileMenuItems }}
                    trigger={['click']}
                    placement="topRight"
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      padding: '4px 12px',
                    }}>
                      {item.icon}
                      <span style={{
                        fontSize: 10,
                        color: isDark ? '#8892B0' : '#64748B',
                      }}>
                        {item.label}
                      </span>
                    </div>
                  </Dropdown>
                )
              }

              return (
                <div
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    padding: '4px 12px',
                    color: isActive ? '#2D8EFF' : (isDark ? '#8892B0' : '#64748B'),
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 10 }}>{item.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </Layout>
    </Layout>
  )
}

export default AppLayout
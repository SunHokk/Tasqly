import { useState } from 'react'
import {
  ConfigProvider, Card, Form, Input, Button,
  Tabs, message, Typography, theme as antdTheme
} from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import useThemeStore from '../../store/themeStore'
import { lightTheme, darkTheme } from '../../styles/theme'

const { Title, Text } = Typography

function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { isDark } = useThemeStore()

  const handleLogin = async (values) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      messageApi.error('Email atau password salah!')
    } else {
      messageApi.success('Login berhasil!')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const handleRegister = async (values) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name }
      }
    })

    if (error) {
      messageApi.error(error.message)
    } else {
      messageApi.success('Registrasi berhasil! Silakan login.')
      form.resetFields()
    }
    setLoading(false)
  }

  const loginForm = (
    <Form form={form} layout="vertical" onFinish={handleLogin} size="large">
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Email tidak boleh kosong' },
          { type: 'email', message: 'Format email tidak valid' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="contoh@email.com" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Password tidak boleh kosong' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Masukkan password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Login
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form form={form} layout="vertical" onFinish={handleRegister} size="large">
      <Form.Item
        name="name"
        label="Nama"
        rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Nama lengkap kamu" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Email tidak boleh kosong' },
          { type: 'email', message: 'Format email tidak valid' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="contoh@email.com" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Password tidak boleh kosong' },
          { min: 8, message: 'Password minimal 8 karakter' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Minimal 8 karakter" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Konfirmasi Password"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Konfirmasi password tidak boleh kosong' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Password tidak cocok!'))
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Ulangi password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Daftar
        </Button>
      </Form.Item>
    </Form>
  )

  const tabs = [
    { key: 'login', label: 'Login', children: loginForm },
    { key: 'register', label: 'Daftar', children: registerForm },
  ]

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: isDark ? darkTheme.token : lightTheme.token,
      }}
    >
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#0F1117' : '#F5F7FA',
        padding: 24,
      }}>
        {contextHolder}
        <Card style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ color: '#4F6AF5', margin: 0 }}>
              ✓ Tasqly
            </Title>
            <Text type="secondary">Kelola tugasmu dengan lebih cerdas</Text>
          </div>

          <Tabs
            defaultActiveKey="login"
            items={tabs}
            centered
            onChange={() => form.resetFields()}
          />
        </Card>
      </div>
    </ConfigProvider>
  )
}

export default AuthPage
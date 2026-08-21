import { useState } from 'react'
import { Card, Form, Input, Button, Tabs, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleLogin = async (values) => {
    setLoading(true)
    // nanti disambungkan ke Supabase
    console.log('Login:', values)
    setTimeout(() => {
      setLoading(false)
      messageApi.success('Login berhasil!')
      navigate('/dashboard')
    }, 1000)
  }

  const handleRegister = async (values) => {
    setLoading(true)
    // nanti disambungkan ke Supabase
    console.log('Register:', values)
    setTimeout(() => {
      setLoading(false)
      messageApi.success('Registrasi berhasil! Silakan login.')
      form.resetFields()
    }, 1000)
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ant-color-bg-base)',
      padding: 24,
    }}>
      {contextHolder}
      <Card style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo & judul */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#2D8EFF', margin: 0 }}>
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
  )
}

export default AuthPage

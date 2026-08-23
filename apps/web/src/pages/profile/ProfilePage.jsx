import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Avatar, Upload, message, Typography } from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import { supabase } from '../../utils/supabase'

const { Title, Text } = Typography

function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()

  useEffect(() => { fetchUser() }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setAvatarUrl(user.user_metadata?.avatar_url || null)
      form.setFieldsValue({
        name: user.user_metadata?.name || '',
        email: user.email,
      })
    }
  }

  const handleUpdateProfile = async (values) => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { name: values.name }
    })

    if (error) messageApi.error('Gagal update profile!')
    else messageApi.success('Profile berhasil diupdate!')
    setLoading(false)
  }

  const handleAvatarUpload = async (file) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      messageApi.error('Gagal upload foto!')
      return false
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const avatarUrl = data.publicUrl

    await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } })
    setAvatarUrl(avatarUrl)
    messageApi.success('Foto profil berhasil diupdate!')
    return false
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 24 }}>Edit Profile</Title>

      <Card>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Upload
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
            accept="image/*"
          >
            <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
              <Avatar
                size={96}
                src={avatarUrl}
                icon={<UserOutlined />}
                style={{ background: '#2D8EFF', border: 'none' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#2D8EFF',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
            </div>
          </Upload>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Klik foto untuk ganti
            </Text>
          </div>
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Nama tidak boleh kosong' }]}
          >
            <Input placeholder="Nama lengkap kamu" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Simpan Perubahan
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ProfilePage
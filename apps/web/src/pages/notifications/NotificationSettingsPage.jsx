import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { Card, Form, Select, Switch, Button, Typography, Divider, message, Space, Alert } from 'antd'
import { BellOutlined, SoundOutlined, WifiOutlined } from '@ant-design/icons'
import { subscribeToPush, unsubscribeFromPush, isPushSupported } from '../../utils/pushNotification'

const { Title, Text } = Typography
const { Option } = Select

const NOTIFICATION_SOUNDS = [
  { value: 'default', label: '🔔 Default' },
  { value: 'chime',   label: '🎵 Chime' },
  { value: 'bell',    label: '🔕 Bell' },
  { value: 'none',    label: '🔇 Tanpa Suara' },
]

const REMINDER_OPTIONS = [
  { value: 1,  label: '1 hari sebelum deadline' },
  { value: 3,  label: '3 hari sebelum deadline' },
  { value: 7,  label: '7 hari sebelum deadline' },
  { value: 14, label: '14 hari sebelum deadline' },
]

const SOUNDS = {
  default: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  chime:   'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3',
  bell:    'https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3',
  none:    null,
}

function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState(false)
  const [sound, setSound] = useState('default')
  const [permission, setPermission] = useState(Notification.permission)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('tasqly_notification_settings')
    if (saved) {
      const settings = JSON.parse(saved)
      setEnabled(settings.enabled || false)
      setSound(settings.sound || 'default')
      form.setFieldsValue(settings)
    }
    checkPushSubscription()
  }, [])

  const checkPushSubscription = async () => {
    if (!isPushSupported()) return
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        setPushSubscribed(!!sub)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      messageApi.success('Izin notifikasi diberikan!')
    } else {
      messageApi.error('Izin notifikasi ditolak!')
    }
  }

  const handleTogglePush = async (checked) => {
    if (permission !== 'granted') {
      messageApi.warning('Izinkan notifikasi browser dulu!')
      return
    }

    setPushLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (checked) {
        // Subscribe push
        const subscription = await subscribeToPush()
        if (!subscription) {
          messageApi.error('Gagal mengaktifkan push notification!')
          setPushLoading(false)
          return
        }

        // Simpan subscription ke Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription: subscription.toJSON(),
          }, { onConflict: 'user_id' })

        if (error) {
          messageApi.error('Gagal menyimpan subscription!')
        } else {
          setPushSubscribed(true)
          messageApi.success('Push notification diaktifkan! Kamu akan dapat notif meski app ditutup.')
        }
      } else {
        // Unsubscribe
        await unsubscribeFromPush()

        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)

        if (error) {
          messageApi.error('Gagal menonaktifkan subscription!')
        } else {
          setPushSubscribed(false)
          messageApi.success('Push notification dinonaktifkan.')
        }
      }
    } catch (e) {
      messageApi.error('Terjadi kesalahan!')
      console.error(e)
    }
    setPushLoading(false)
  }

  const handleSave = (values) => {
    const settings = {
      enabled: values.enabled,
      reminderDays: values.reminderDays,
      sound: values.sound,
    }
    localStorage.setItem('tasqly_notification_settings', JSON.stringify(settings))
    setEnabled(values.enabled)
    setSound(values.sound)
    messageApi.success('Pengaturan notifikasi disimpan!')

    if (values.enabled && permission === 'granted') {
      scheduleNotifications(values.reminderDays)
    }
  }

  const scheduleNotifications = async (days) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'todo')
      .not('deadline', 'is', null)

    if (!tasks || tasks.length === 0) {
      messageApi.info('Tidak ada task dengan deadline')
      return
    }

    const now = new Date()
    tasks.forEach(task => {
      const deadline = new Date(task.deadline)
      days.forEach(day => {
        const reminderTime = new Date(deadline)
        reminderTime.setDate(reminderTime.getDate() - day)
        const diff = reminderTime - now
        if (diff > 0) {
          setTimeout(() => {
            const soundUrl = SOUNDS[sound]
            if (soundUrl) new Audio(soundUrl).play().catch(() => {})
            new Notification(`🔔 Deadline dalam ${day} hari!`, {
              body: task.title,
              icon: '/pwa-192x192.png',
            })
          }, diff)
        }
      })
    })

    messageApi.success(`Reminder aktif untuk ${tasks.length} task!`)
  }

  const previewSound = () => {
    const soundUrl = SOUNDS[sound]
    if (!soundUrl) { messageApi.info('Suara dinonaktifkan'); return }
    new Audio(soundUrl).play().catch(() => messageApi.warning('Tidak bisa memutar suara'))
  }

  const sendTestNotification = () => {
    if (permission !== 'granted') { messageApi.warning('Izinkan notifikasi dulu!'); return }
    new Notification('🔔 Tasqly Reminder', {
      body: 'Ini adalah contoh notifikasi reminder deadline!',
      icon: '/pwa-192x192.png',
    })
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 24 }}>Pengaturan Notifikasi</Title>

      {/* Status izin notifikasi */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text strong>Izin Notifikasi Browser</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {permission === 'granted' ? '✅ Diizinkan' :
               permission === 'denied'  ? '❌ Ditolak — ubah di settings browser' :
               '⏳ Belum diminta'}
            </Text>
          </div>
          {permission !== 'granted' && permission !== 'denied' && (
            <Button type="primary" onClick={requestPermission}>
              Izinkan Notifikasi
            </Button>
          )}
        </div>
      </Card>

      {/* Push Notification Card */}
      {isPushSupported() && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong><WifiOutlined /> Push Notification</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Terima notifikasi meski app ditutup
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {pushSubscribed ? '✅ Aktif' : '○ Tidak aktif'}
              </Text>
            </div>
            <Switch
              checked={pushSubscribed}
              loading={pushLoading}
              onChange={handleTogglePush}
              disabled={permission !== 'granted'}
            />
          </div>
          {permission !== 'granted' && (
            <Alert
              message="Izinkan notifikasi browser terlebih dahulu"
              type="warning"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Card>
      )}

      {/* Form settings */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ enabled: false, reminderDays: [3, 7], sound: 'default' }}
        >
          <Form.Item valuePropName="checked">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text strong><BellOutlined /> Aktifkan Reminder</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Dapatkan notifikasi sebelum deadline task
                </Text>
              </div>
              <Form.Item name="enabled" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </div>
          </Form.Item>

          <Divider />

          <Form.Item
            name="reminderDays"
            label="Waktu Reminder"
            rules={[{ required: true, message: 'Pilih minimal satu waktu reminder' }]}
          >
            <Select mode="multiple" placeholder="Pilih kapan reminder dikirim"
              style={{ width: '100%' }} maxTagCount={2}
              maxTagPlaceholder={(omitted) => `+${omitted.length} lagi`}>
              {REMINDER_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item name="sound" label="Suara Notifikasi">
            <Select style={{ width: '100%' }} onChange={setSound}>
              {NOTIFICATION_SOUNDS.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Space style={{ marginBottom: 16 }}>
            <Button icon={<SoundOutlined />} onClick={previewSound}>Preview Suara</Button>
            <Button onClick={sendTestNotification}>Test Notifikasi</Button>
          </Space>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block>Simpan Pengaturan</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default NotificationSettingsPage
import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Progress, List, Tag, Typography, Drawer, Button, Space, message } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CheckOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import { supabase } from '../../utils/supabase'

const { Title, Text } = Typography

function getPriorityLabel(score) {
  if (score >= 4) return { label: 'High', color: 'red' }
  if (score >= 2.5) return { label: 'Medium', color: 'orange' }
  return { label: 'Low', color: 'green' }
}

const categoryMap = {
  sekolah:    { color: 'cyan',    label: '🏫 Sekolah' },
  kuliah:     { color: 'blue',    label: '📚 Kuliah' },
  kerja:      { color: 'purple',  label: '💼 Kerja' },
  organisasi: { color: 'gold',    label: '🤝 Organisasi' },
  personal:   { color: 'default', label: '🙂 Personal' },
}

function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'todo' ? 'done' : 'todo'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
    if (!error) {
      messageApi.success(newStatus === 'done' ? 'Task ditandai selesai!' : 'Task dibatalkan!')
      fetchTasks()
    }
  }

  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  const upcoming = tasks
    .filter(t => {
      if (t.status === 'done' || !t.deadline) return false
      const diff = new Date(t.deadline) - new Date()
      return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5)

  const highPriorityTasks = tasks.filter(t => t.priority_score >= 4)
  const highPriorityCount = highPriorityTasks.filter(t => t.status === 'todo').length

  return (
    <div>
      {contextHolder}
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Total Task */}
        <Col xs={12} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Total Task"
              value={total}
              prefix={<ClockCircleOutlined style={{ color: '#2D8EFF' }} />}
              valueStyle={{ color: '#2D8EFF' }}
            />
          </Card>
        </Col>

        {/* Selesai */}
        <Col xs={12} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Selesai"
              value={done}
              prefix={<CheckCircleOutlined style={{ color: '#00C48C' }} />}
              valueStyle={{ color: '#00C48C' }}
            />
          </Card>
        </Col>

        {/* Prioritas Tinggi — card khusus */}
        <Col xs={24} sm={8}>
          <Card
            loading={loading}
            onClick={() => !loading && setDrawerOpen(true)}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #2a1215 0%, #1f1010 100%)',
              border: '1px solid #5c1a1a',
              boxShadow: '0 0 16px rgba(255, 77, 79, 0.15)',
              transition: 'all 0.2s ease',
            }}
            styles={{ body: { padding: '20px 24px' } }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 77, 79, 0.35)'
              e.currentTarget.style.borderColor = '#ff4d4f'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 77, 79, 0.15)'
              e.currentTarget.style.borderColor = '#5c1a1a'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: '#ff9a9a', fontSize: 13, display: 'block', marginBottom: 6 }}>
                  Prioritas Tinggi
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FireOutlined style={{ color: '#ff4d4f', fontSize: 28 }} />
                  <span style={{ fontSize: 36, fontWeight: 700, color: '#ff4d4f', lineHeight: 1 }}>
                    {highPriorityCount}
                  </span>
                </div>
                <Text style={{ color: '#ff9a9a', fontSize: 11, marginTop: 6, display: 'block' }}>
                  task belum selesai · tap untuk lihat
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress */}
      <Card title="Progress Keseluruhan" style={{ marginBottom: 24 }} loading={loading}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Progress percent={percent} strokeColor='#2D8EFF' style={{ flex: 1 }} />
          <Text type="secondary">{done} dari {total} task selesai</Text>
        </div>
      </Card>

      {/* Deadline dekat */}
      <Card title="📅 Deadline Dekat (7 hari ke depan)" loading={loading}>
        {upcoming.length === 0 ? (
          <Text type="secondary">Tidak ada task dengan deadline dekat. 🎉</Text>
        ) : (
          <List
            dataSource={upcoming}
            renderItem={(task) => {
              const priority = getPriorityLabel(task.priority_score)
              const deadlineDate = new Date(task.deadline).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <List.Item extra={<Text type="secondary">{deadlineDate}</Text>}>
                  <List.Item.Meta
                    title={task.title}
                    description={<Tag color={priority.color}>{priority.label}</Tag>}
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Card>

      {/* Drawer Prioritas Tinggi */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FireOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
            <span>Task Prioritas Tinggi</span>
            <Tag color="red" style={{ marginLeft: 4 }}>{highPriorityTasks.length} task</Tag>
          </div>
        }
        placement="bottom"
        height="70vh"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: '8px 16px' } }}
      >
        {highPriorityTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Tidak ada task prioritas tinggi. 🎉</Text>
          </div>
        ) : (
          <List
            dataSource={highPriorityTasks}
            rowKey="id"
            renderItem={(task) => {
              const cat = categoryMap[task.category] || { color: 'default', label: task.category }
              const isDone = task.status === 'done'
              return (
                <Card
                  size="small"
                  style={{
                    marginBottom: 10,
                    opacity: isDone ? 0.6 : 1,
                  }}
                  styles={{ body: { padding: '10px 12px' } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? '#aaa' : 'inherit',
                        display: 'block',
                        marginBottom: 6,
                      }}>
                        {task.title}
                      </Text>
                      <Space size={4} wrap>
                        <Tag color="red">🔥 High</Tag>
                        <Tag color={cat.color}>{cat.label}</Tag>
                        <Tag color={isDone ? 'success' : 'processing'}>
                          {isDone ? '✓ Selesai' : '○ To-do'}
                        </Tag>
                      </Space>
                      {task.deadline && (
                        <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
                          ⏰ {new Date(task.deadline).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </div>
                    <Button
                      size="small"
                      type={isDone ? 'default' : 'primary'}
                      danger={!isDone}
                      icon={isDone ? <RollbackOutlined /> : <CheckOutlined />}
                      onClick={() => handleToggleStatus(task)}
                    >
                      {isDone ? 'Batal' : 'Selesai'}
                    </Button>
                  </div>
                </Card>
              )
            }}
          />
        )}
      </Drawer>
    </div>
  )
}

export default DashboardPage
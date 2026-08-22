import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Progress, List, Tag, Typography } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { supabase } from '../../utils/supabase'

const { Title, Text } = Typography

function getPriorityLabel(score) {
  if (score >= 4) return { label: 'High', color: 'red' }
  if (score >= 2.5) return { label: 'Medium', color: 'orange' }
  return { label: 'Low', color: 'green' }
}

function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

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

  // Kalkulasi statistik
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const todo = tasks.filter(t => t.status === 'todo').length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  // Task deadline dekat (7 hari ke depan) yang belum selesai
  const upcoming = tasks
    .filter(t => {
      if (t.status === 'done' || !t.deadline) return false
      const diff = new Date(t.deadline) - new Date()
      return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5)

  // Task prioritas tinggi
  const highPriority = tasks.filter(
    t => t.status === 'todo' && t.priority_score >= 4
  ).length

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      {/* Statistik */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Total Task"
              value={total}
              prefix={<ClockCircleOutlined style={{ color: '#2D8EFF' }} />}
              valueStyle={{ color: '#2D8EFF' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Selesai"
              value={done}
              prefix={<CheckCircleOutlined style={{ color: '#00C48C' }} />}
              valueStyle={{ color: '#00C48C' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Prioritas Tinggi"
              value={highPriority}
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress */}
      <Card
        title="Progress Keseluruhan"
        style={{ marginBottom: 24 }}
        loading={loading}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Progress
            percent={percent}
            strokeColor='#2D8EFF'
            style={{ flex: 1 }}
          />
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
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
              return (
                <List.Item
                  extra={<Text type="secondary">{deadlineDate}</Text>}
                >
                  <List.Item.Meta
                    title={task.title}
                    description={
                      <Tag color={priority.color}>{priority.label}</Tag>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}

export default DashboardPage
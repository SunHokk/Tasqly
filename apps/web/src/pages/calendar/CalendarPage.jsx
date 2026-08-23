import { useEffect, useState } from 'react'
import { Calendar, Badge, Card, List, Tag, Typography, Col, Row, Empty } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { supabase } from '../../utils/supabase'
import { getPriorityLabel } from '../../utils/priorityHelper'

dayjs.locale('id')

const { Title, Text } = Typography

function CalendarPage() {
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(dayjs())

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .not('deadline', 'is', null)

    setTasks(data || [])
  }

  const getTasksForDate = (date) =>
    tasks.filter(t =>
      dayjs(t.deadline).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    )

  // Badge di tiap tanggal
  const dateCellRender = (value) => {
    const dayTasks = getTasksForDate(value)
    if (dayTasks.length === 0) return null

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTasks.slice(0, 2).map(task => {
          const { color } = getPriorityLabel(task.priority_score)
          const dotColor = color === 'red' ? '#ff4d4f' : color === 'orange' ? '#fa8c16' : '#52c41a'
          return (
            <li key={task.id} style={{ marginBottom: 2 }}>
              <Badge
                color={task.status === 'done' ? '#aaa' : dotColor}
                text={
                  <span style={{
                    fontSize: 11,
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    color: task.status === 'done' ? '#aaa' : 'inherit',
                  }}>
                    {task.title.length > 12 ? task.title.slice(0, 12) + '...' : task.title}
                  </span>
                }
              />
            </li>
          )
        })}
        {dayTasks.length > 2 && (
          <li style={{ fontSize: 11, color: '#2D8EFF' }}>
            +{dayTasks.length - 2} lagi
          </li>
        )}
      </ul>
    )
  }

  const selectedTasks = getTasksForDate(selectedDate)

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Calendar</Title>

      <Row gutter={16}>
        {/* Kalender — kiri */}
        <Col xs={24} lg={16}>
          <Card>
            <Calendar
              cellRender={(date, info) => {
                if (info.type === 'date') return dateCellRender(date)
                return null
              }}
              onSelect={(date) => setSelectedDate(date)}
            />
          </Card>
        </Col>

        {/* List task — kanan */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                📅 {selectedDate.format('DD MMMM YYYY')}
              </span>
            }
            style={{ height: '100%' }}
          >
            {selectedTasks.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary">Tidak ada task di tanggal ini</Text>
                }
              />
            ) : (
              <List
                dataSource={selectedTasks}
                renderItem={(task) => {
                  const { label, color } = getPriorityLabel(task.priority_score)
                  const categoryMap = {
                    sekolah:    '🏫 Sekolah',
                    kuliah:     '📚 Kuliah',
                    kerja:      '💼 Kerja',
                    organisasi: '🤝 Organisasi',
                    personal:   '🙂 Personal',
                  }
                  return (
                    <List.Item style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                      <Text
                        strong
                        style={{
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          color: task.status === 'done' ? '#aaa' : 'inherit',
                        }}
                      >
                        {task.title}
                      </Text>
                      {task.description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {task.description}
                        </Text>
                      )}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Tag color={color}>{label}</Tag>
                        <Tag color={task.status === 'done' ? 'success' : 'processing'}>
                          {task.status === 'done' ? '✓ Selesai' : '○ To-do'}
                        </Tag>
                        <Tag>{categoryMap[task.category] || task.category}</Tag>
                      </div>
                      {task.estimated_hours && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ⏱ Estimasi: {task.estimated_hours} jam
                        </Text>
                      )}
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CalendarPage
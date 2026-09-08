import { useEffect, useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Select,
  DatePicker, InputNumber, Tag, Popconfirm,
  Tooltip, message, Typography, Space, Slider, Grid, Card, List
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CheckOutlined, RollbackOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { supabase } from '../../utils/supabase'
import { calculatePriorityScore, getPriorityLabel } from '../../utils/priorityHelper'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select
const { useBreakpoint } = Grid

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('priority_score', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  const openAddModal = () => {
    setEditingTask(null)
    form.resetFields()
    form.setFieldsValue({ importance: 3, estimated_hours: 1 })
    setModalOpen(true)
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      importance: task.importance,
      estimated_hours: task.estimated_hours,
      deadline: task.deadline ? dayjs(task.deadline) : null,
      category: task.category,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (values) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const deadline = values.deadline ? values.deadline.toISOString() : null
    const priority_score = calculatePriorityScore(values.importance, deadline)
    const payload = {
      title: values.title,
      description: values.description || null,
      importance: values.importance,
      estimated_hours: values.estimated_hours,
      deadline,
      category: values.category || 'personal',
      priority_score,
    }
    if (editingTask) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id)
      if (error) messageApi.error('Gagal update task!')
      else messageApi.success('Task berhasil diupdate!')
    } else {
      const { error } = await supabase.from('tasks').insert({ ...payload, user_id: user.id, status: 'todo' })
      if (error) messageApi.error('Gagal tambah task!')
      else messageApi.success('Task berhasil ditambahkan!')
    }
    setModalOpen(false)
    fetchTasks()
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) messageApi.error('Gagal hapus task!')
    else { messageApi.success('Task dihapus!'); fetchTasks() }
  }

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'todo' ? 'done' : 'todo'
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    if (!error) fetchTasks()
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    return matchSearch && matchStatus
  })

  const categoryMap = {
    sekolah:    { color: 'cyan',    label: '🏫 Sekolah' },
    kuliah:     { color: 'blue',    label: '📚 Kuliah' },
    kerja:      { color: 'purple',  label: '💼 Kerja' },
    organisasi: { color: 'gold',    label: '🤝 Organisasi' },
    personal:   { color: 'default', label: '🙂 Personal' },
  }

  const columns = [
    {
      title: 'Nama Task', dataIndex: 'title', key: 'title',
      render: (text, record) => (
        <span style={{
          textDecoration: record.status === 'done' ? 'line-through' : 'none',
          color: record.status === 'done' ? '#aaa' : 'inherit',
          fontWeight: 500,
        }}>{text}</span>
      )
    },
    {
      title: 'Prioritas', dataIndex: 'priority_score', key: 'priority', width: 110,
      render: (score) => {
        const { label, color } = getPriorityLabel(score)
        return <Tag color={color}>{label}</Tag>
      }
    },
    {
      title: 'Kategori', dataIndex: 'category', key: 'category', width: 110,
      render: (c) => {
        const item = categoryMap[c] || { color: 'default', label: c }
        return <Tag color={item.color}>{item.label}</Tag>
      }
    },
    {
      title: 'Deadline', dataIndex: 'deadline', key: 'deadline', width: 150,
      render: (d) => d
        ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : <span style={{ color: '#aaa' }}>-</span>
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (s) => (
        <Tag color={s === 'done' ? 'success' : 'processing'}>
          {s === 'done' ? '✓ Selesai' : '○ To-do'}
        </Tag>
      )
    },
    {
      title: 'Aksi', key: 'action', width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.status === 'done' ? 'Tandai belum selesai' : 'Tandai selesai'}>
            <Button size="small" type={record.status === 'done' ? 'default' : 'primary'}
              icon={record.status === 'done' ? <RollbackOutlined /> : <CheckOutlined />}
              onClick={() => handleToggleStatus(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm title="Hapus task ini?" okText="Hapus" cancelText="Batal"
            okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="Hapus">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    },
  ]

  const MobileTaskList = () => (
    <List
      loading={loading}
      dataSource={filtered}
      rowKey="id"
      pagination={{ pageSize: 8, showSizeChanger: false }}
      renderItem={(task) => {
        const { label, color } = getPriorityLabel(task.priority_score)
        const cat = categoryMap[task.category] || { color: 'default', label: task.category }
        const isDone = task.status === 'done'
        return (
          <Card
            size="small"
            style={{ marginBottom: 10 }}
            bodyStyle={{ padding: '10px 12px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <Text strong style={{
                textDecoration: isDone ? 'line-through' : 'none',
                color: isDone ? '#aaa' : 'inherit',
                flex: 1,
              }}>
                {task.title}
              </Text>
              <Space size={4}>
                <Button size="small" type={isDone ? 'default' : 'primary'}
                  icon={isDone ? <RollbackOutlined /> : <CheckOutlined />}
                  onClick={() => handleToggleStatus(task)} />
                <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(task)} />
                <Popconfirm title="Hapus task ini?" okText="Hapus" cancelText="Batal"
                  okButtonProps={{ danger: true }} onConfirm={() => handleDelete(task.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              <Tag color={color}>{label}</Tag>
              <Tag color={cat.color}>{cat.label}</Tag>
              <Tag color={isDone ? 'success' : 'processing'}>
                {isDone ? '✓ Selesai' : '○ To-do'}
              </Tag>
            </div>
            {task.deadline && (
              <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
                ⏰ {new Date(task.deadline).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            )}
          </Card>
        )
      }}
    />
  )

  return (
    <div>
      {contextHolder}

      {/* CSS override untuk slider dan datepicker di mobile */}
      <style>{`
        .ant-slider-rail {
          background-color: rgba(255, 255, 255, 0.3) !important;
          height: 5px !important;
        }
        .ant-slider-track {
          height: 5px !important;
        }
        .ant-slider-handle::after {
          width: 14px !important;
          height: 14px !important;
        }
        @media (max-width: 767px) {
          .task-datepicker-popup {
            position: fixed !important;
            left: 16px !important;
            right: 16px !important;
            width: calc(100vw - 32px) !important;
            max-width: 100% !important;
          }
          .task-datepicker-popup .ant-picker-panel-container {
            width: 100% !important;
          }
          .task-datepicker-popup .ant-picker-date-panel,
          .task-datepicker-popup .ant-picker-time-panel {
            width: auto !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Tasks</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Tambah Task
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Cari task..."
          allowClear
          style={{ width: isMobile ? '100%' : 240 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 140 }}>
          <Option value="all">Semua Status</Option>
          <Option value="todo">To-do</Option>
          <Option value="done">Selesai</Option>
        </Select>
      </Space>

      {isMobile ? <MobileTaskList /> : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      )}

      <Modal
        title={editingTask ? 'Edit Task' : 'Tambah Task Baru'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ top: isMobile ? 16 : 20 }}
        styles={{
          content: {
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 12,
          },
          body: {
            maxHeight: isMobile ? 'calc(100dvh - 140px)' : 'calc(100vh - 200px)',
            overflowY: 'auto',
            paddingRight: isMobile ? 12 : 24,
          }
        }}
        width={isMobile ? 'calc(100vw - 32px)' : 520}
        centered={!isMobile}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Nama Task" rules={[{ required: true, message: 'Nama task tidak boleh kosong' }]}>
            <Input placeholder="Contoh: Kerjakan tugas Data Structures" />
          </Form.Item>

          <Form.Item name="description" label="Deskripsi (opsional)">
            <Input.TextArea rows={3} placeholder="Deskripsi singkat task..." />
          </Form.Item>

          <Form.Item
            name="importance"
            label="Tingkat Kepentingan (1 = tidak penting, 5 = sangat penting)"
            rules={[{ required: true }]}
          >
            <Slider
              min={1}
              max={5}
              marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
              styles={{
                rail: { backgroundColor: 'rgba(255,255,255,0.3)', height: 5 },
                track: { height: 5 },
              }}
            />
          </Form.Item>

          <Form.Item
            name="estimated_hours"
            label="Estimasi Waktu (jam)"
            rules={[{ required: true, message: 'Isi estimasi waktu' }]}
          >
            <InputNumber min={0.5} max={100} step={0.5} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="deadline" label="Deadline">
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              style={{ width: '100%' }}
              format="DD MMM YYYY, HH:mm"
              placeholder="Pilih tanggal dan jam deadline"
              popupClassName="task-datepicker-popup"
              getPopupContainer={() => document.body}
              popupStyle={{ zIndex: 1200 }}
            />
          </Form.Item>

          <Form.Item name="category" label="Kategori">
            <Select placeholder="Pilih kategori">
              <Option value="sekolah">🏫 Sekolah</Option>
              <Option value="kuliah">📚 Kuliah</Option>
              <Option value="kerja">💼 Kerja</Option>
              <Option value="organisasi">🤝 Organisasi</Option>
              <Option value="personal">🙂 Personal</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Simpan Perubahan' : 'Tambah Task'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TasksPage
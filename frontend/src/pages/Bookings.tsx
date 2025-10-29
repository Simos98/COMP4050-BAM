import { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, message, Popconfirm, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import type { Booking } from '../services/bookings'
import { listBookings, createBooking, updateBookingStatus, deleteBooking } from '../services/bookings'
import { listDevices } from '../services/devices'
import type { DeviceRecord } from '../services/devices'
import { useAuth } from '../context/AuthContext'
import { listStudents } from '../services/mockAuth'
import type { AuthUser } from '../services/mockAuth'
import { useNavigate } from 'react-router-dom'

const { RangePicker } = DatePicker

const STATUS_COLORS: Record<string, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'volcano',
  cancelled: 'blue'
}

export default function Bookings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = (user?.role ?? '').toString().toUpperCase()
  const isAdmin = role === 'ADMIN'
  const isTeacher = role === 'TEACHER'

  const [data, setData] = useState<Booking[]>([])
  const [devices, setDevices] = useState<DeviceRecord[]>([])
  const [students, setStudents] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([listBookings(), listDevices(), listStudents()])
      const [bRes, dRes, sRes] = results

      if (bRes.status === 'fulfilled') {
        const bookingsResp = bRes.value
        const rows = Array.isArray(bookingsResp) ? bookingsResp : (bookingsResp.items ?? bookingsResp ?? [])
        setData(rows)
      } else {
        console.warn('Failed to load bookings:', bRes.reason)
        setData([])
      }

      if (dRes.status === 'fulfilled') {
        setDevices(dRes.value ?? [])
      } else {
        console.warn('Failed to load devices:', dRes.reason)
        setDevices([])
      }

      if (sRes.status === 'fulfilled') {
        setStudents(sRes.value ?? [])
      } else {
        console.warn('Failed to load students:', sRes.reason)
        setStudents([])
      }
    } catch (e) {
      message.error('Failed to load data')
      setData([]); setDevices([]); setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const onCreate = async () => {
    try {
      const values = await form.validateFields()
      const range: [Dayjs, Dayjs] = values.range
      const owner = (values.user ?? user?.email ?? '').toString().toLowerCase()

      await createBooking({
        user: owner,
        deviceId: values.deviceId,
        start: range[0].toISOString(),
        end: range[1].toISOString(),
        notes: values.notes,
      })
      message.success('Booking created')
      form.resetFields()
      setOpen(false)
      void load()
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      if (status === 403) message.error('Forbidden: insufficient permissions')
      else if (status === 404) message.error('Target user or device not found')
      else message.error(err?.message || 'Failed to create booking')
    }
  }

  const handleStatus = async (id: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(id, status)
      message.success(`Marked as ${status}`)
      void load()
    } catch (err: any) {
      const statusCode = err?.status ?? err?.response?.status
      if (statusCode === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id)
      message.success('Deleted')
      void load()
    } catch (err: any) {
      const statusCode = err?.status ?? err?.response?.status
      if (statusCode === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to delete')
    }
  }

  const visibleData = useMemo(() => {
    if (role === 'ADMIN') return data
    if (!user) return []
    return data.filter(b => b.user === user.email)
  }, [data, user, role])

  const columns: ColumnsType<Booking> = [
    { title: 'User', dataIndex: 'user', key: 'user' },
    {
      title: 'Device',
      dataIndex: 'deviceId',
      key: 'deviceId',
      filters: devices.map(d => ({ text: `${d.deviceId} (${d.lab})`, value: d.deviceId })),
      onFilter: (val, record) => record.deviceId === val
    },
    { title: 'Start', dataIndex: 'start', key: 'start', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'End', dataIndex: 'end', key: 'end', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Status', dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (val, record) => record.status === val,
      render: (s: any) => <Tag color={STATUS_COLORS[s]}>{String(s).toUpperCase()}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isOwner = user && record.user === user.email
        const canCancel = (role === 'ADMIN' || isOwner) && record.status !== 'cancelled'
        return (
          <Space>
            {role === 'ADMIN' ? (
              <>
                <Button size="small" onClick={() => handleStatus(record.id, 'approved')} disabled={record.status === 'approved'}>Approve</Button>
                <Button size="small" danger onClick={() => handleStatus(record.id, 'rejected')} disabled={record.status === 'rejected'}>Reject</Button>
                <Button size="small" onClick={() => handleStatus(record.id, 'cancelled')} disabled={record.status === 'cancelled'}>Cancel</Button>
                <Popconfirm title="Delete booking?" onConfirm={() => handleDelete(record.id)}><Button size="small" danger type="text">Delete</Button></Popconfirm>
              </>
            ) : (
              <Button size="small" onClick={() => handleStatus(record.id, 'cancelled')} disabled={!canCancel}>Cancel</Button>
            )}
          </Space>
        )
      }
    }
  ]

  return (
    <Card title="Bookings" extra={<Button type="primary" onClick={() => setOpen(true)} disabled={devices.length === 0}>Create Booking</Button>}>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={visibleData} pagination={{ pageSize: 8, showSizeChanger: false }} onRow={(record) => ({
        onClick: (e) => {
          const target = e.target as HTMLElement
          if (target.closest('button, a, input, .ant-btn')) return
          navigate(`/bookings/${record.id}`)
        }
      })} rowClassName={() => 'clickable-row'} />

      <Modal title="Create Booking" open={open} onOk={onCreate} onCancel={() => { setOpen(false); form.resetFields() }} okText="Create">
        {devices.length === 0 && <Alert message="No devices available to book" type="warning" showIcon style={{ marginBottom: 12 }} />}
        <Form layout="vertical" form={form} initialValues={{ user: user?.email || '' }}>
          <Form.Item label="User Email" name="user" rules={[{ required: true, message: 'Select or enter a user' }, { type: 'email', message: 'Enter a valid email' }]}>
            {isAdmin ? <Input placeholder="student@school.edu or teacher@school.edu" /> : isTeacher ? <Select placeholder="Select student (or yourself)" options={students.map(s => ({ label: `${s.name} <${s.email}>`, value: s.email }))} /> : <Input disabled value={user?.email ?? ''} />}
          </Form.Item>

          <Form.Item label="Device" name="deviceId" rules={[{ required: true }]}>
            <Select placeholder="Select device" options={devices.map(d => ({ label: `${d.deviceId} (${d.lab})`, value: d.deviceId }))} disabled={devices.length === 0} />
          </Form.Item>

          <Form.Item label="Time Range" name="range" rules={[{ required: true }]}>
            <RangePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item label="Notes" name="notes"><Input.TextArea rows={3} placeholder="Optional context…" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
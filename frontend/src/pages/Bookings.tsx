import { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import type { Booking, BookingStatus } from '../types'
import { listBookings, createBooking, updateBookingStatus, deleteBooking } from '../services/bookings'
import { listDevices } from '../services/devices'
import type { Device } from '../services/devices'
import { useAuth } from '../context/AuthContext'
import { listStudents } from '../services/mockAuth'
import type { AuthUser } from '../services/mockAuth'
import { useNavigate } from 'react-router-dom'

const { RangePicker } = DatePicker

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'volcano',
  cancelled: 'blue'
}

export default function Bookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const [data, setData] = useState<Booking[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [students, setStudents] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [rows, devs, studs] = await Promise.all([listBookings(), listDevices(), listStudents()])
      setData(rows)
      setDevices(devs)
      setStudents(studs)
    } catch (e) {
      message.error('Failed to load bookings, devices or students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    try {
      const values = await form.validateFields()
      const range: [Dayjs, Dayjs] = values.range

      // normalize owner: values.user may be undefined; fall back to current user's email
      const rawOwner = values.user ?? user?.email
      const owner = typeof rawOwner === 'string' ? rawOwner.toLowerCase().trim() : String(rawOwner ?? user?.email ?? '').toLowerCase()

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
      load()
    } catch (err:any) {
      // booking service already throws status codes/messages
      if (err?.status === 403) message.error('Forbidden: insufficient permissions')
      else if (err?.status === 404) message.error('Target user or device not found')
      else message.error(err?.message || 'Failed to create booking')
    }
  }

  const handleStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status)
      message.success(`Marked as ${status}`)
      load()
    } catch {
      message.error('Failed to update status')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking(id)
      message.success('Deleted')
      load()
    } catch {
      message.error('Failed to delete')
    }
  }

  // show all bookings to admin, otherwise only bookings made by the logged-in user
  const visibleData = useMemo(() => {
    if (user?.role === 'admin') return data
    if (!user) return []
    return data.filter(b => b.user === user.email)
  }, [data, user])

  const columns = useMemo<ColumnsType<Booking>>(() => [
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
      render: (s: BookingStatus) => <Tag color={STATUS_COLORS[s]}>{s.toUpperCase()}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isOwner = user && record.user === user.email
        const canCancel = (user?.role === 'admin' || isOwner) && record.status !== 'cancelled'
        return (
          <Space>
            {user?.role === 'admin' ? (
              <>
                <Button size="small" onClick={() => handleStatus(record.id, 'approved')} disabled={record.status === 'approved'}>
                  Approve
                </Button>
                <Button size="small" danger onClick={() => handleStatus(record.id, 'rejected')} disabled={record.status === 'rejected'}>
                  Reject
                </Button>
                <Button size="small" onClick={() => handleStatus(record.id, 'cancelled')} disabled={record.status === 'cancelled'}>
                  Cancel
                </Button>
                <Popconfirm title="Delete booking?" onConfirm={() => handleDelete(record.id)}>
                  <Button size="small" danger type="text">Delete</Button>
                </Popconfirm>
              </>
            ) : (
              <Button size="small" onClick={() => handleStatus(record.id, 'cancelled')} disabled={!canCancel}>
                Cancel
              </Button>
            )}
          </Space>
        )
      }
    }
  ], [devices, user])

  return (
    <Card
      title="Bookings"
      extra={<Button type="primary" onClick={() => setOpen(true)}>Create Booking</Button>}
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={visibleData}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        onRow={(record) => ({
          onClick: (e) => {
            // don't navigate if clicking a button/link/input inside the row
            const target = e.target as HTMLElement
            if (target.closest('button, a, input, .ant-btn')) return
            navigate(`/bookings/${record.id}`)
          }
        })}
        rowClassName={() => 'clickable-row'}
      />

      <Modal
        title="Create Booking"
        open={open}
        onOk={onCreate}
        onCancel={() => { setOpen(false); form.resetFields() }}
        okText="Create"
      >
        <Form layout="vertical" form={form} initialValues={{
          user: user?.email || '',
        }}>
          <Form.Item label="User Email" name="user" rules={[
            { required: true, message: 'Select or enter a user' },
            { type: 'email', message: 'Enter a valid email' }
          ]}>
            {isAdmin ? (
              // Admin: free input
              <Input placeholder="student@school.edu or teacher@school.edu" />
            ) : isTeacher ? (
              // Teacher: select from students or self
              (() => {
                // build options ensuring value is always a string
                const userOpt = user?.email ? [{ label: `${user?.name || 'You'} (you)`, value: user.email }] : []
                const studentOpts = students.map(s => ({ label: `${s.name} <${s.email}>`, value: s.email }))
                const selectOptions = [...userOpt, ...studentOpts]
                return <Select placeholder="Select student (or yourself)" options={selectOptions} />
              })()
            ) : (
              // Student: fixed to their own email
              <Input disabled value={user?.email ?? ''} />
            )}
          </Form.Item>

          <Form.Item label="Device" name="deviceId" rules={[{ required: true }]}>
            <Select
              placeholder="Select device"
              options={devices.map(d => ({ label: `${d.deviceId} (${d.lab})`, value: d.deviceId }))}
            />
          </Form.Item>

          <Form.Item label="Time Range" name="range" rules={[{ required: true }]}>
            <RangePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Optional context…" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

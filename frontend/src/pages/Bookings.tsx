import { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import type { Booking, BookingStatus } from '../types'
import { listBookings, createBooking, updateBookingStatus, deleteBooking } from '../services/bookings'
import { listDevices } from '../services/devices'
import type { Device } from '../services/devices'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom' // added

const { RangePicker } = DatePicker

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'volcano',
  cancelled: 'blue'
}

export default function Bookings() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [data, setData] = useState<Booking[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate() // added

  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [rows, devs] = await Promise.all([listBookings(), listDevices()])
      setData(rows)
      setDevices(devs)
    } catch (e) {
      message.error('Failed to load bookings or devices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    try {
      const values = await form.validateFields()
      const range: [Dayjs, Dayjs] = values.range
      await createBooking({
        user: values.user,
        deviceId: values.deviceId,
        start: range[0].toISOString(),
        end: range[1].toISOString(),
        notes: values.notes,
      })
      message.success('Booking created')
      form.resetFields()
      setOpen(false)
      load()
    } catch {/* validation or create error shown by message already */}
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
    if (isAdmin) return data
    if (!user) return []
    return data.filter(b => b.user === user.email)
  }, [data, user, isAdmin])

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
        const canCancel = (isAdmin || isOwner) && record.status !== 'cancelled'
        // Admins: full controls. Non-admins: only Cancel on their own bookings.
        return (
          <Space onClick={e => e.stopPropagation() /* prevent row click when pressing buttons */}>
            {isAdmin ? (
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
              <>
                <Button size="small" onClick={() => handleStatus(record.id, 'cancelled')} disabled={!canCancel}>
                  Cancel
                </Button>
              </>
            )}
          </Space>
        )
      }
    }
  ], [devices, user, isAdmin])

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
          onClick: () => navigate(`/bookings/${record.id}`),
          style: { cursor: 'pointer' }
        })}
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
          <Form.Item label="User Email" name="user" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="student@school.edu" disabled={!isAdmin} />
          </Form.Item>

          <Form.Item label="Device" name="deviceId" rules={[{ required: true }]}>
            <Select
              placeholder="Select device"
              options={devices.map(d => ({ label: `${d.model} (${d.location})`, value: d.id }))}
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

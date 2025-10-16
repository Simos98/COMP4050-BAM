import { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, message, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import type { Booking, BookingStatus } from '../types'
import { listBookings, createBooking, updateBookingStatus, deleteBooking } from '../services/bookings'
import { useAuth } from '../context/AuthContext'

const { RangePicker } = DatePicker

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'volcano',
  cancelled: 'blue'
}

export default function Bookings() {
  const { user } = useAuth()
  const [data, setData] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const rows = await listBookings()
      setData(rows)
    } catch (e) {
      message.error('Failed to load bookings')
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

  const columns = useMemo<ColumnsType<Booking>>(() => [
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Device', dataIndex: 'deviceId', key: 'deviceId', filters: [
        { text: 'B-001', value: 'B-001' }, { text: 'B-002', value: 'B-002' }, { text: 'B-003', value: 'B-003' }
      ],
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
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleStatus(record.id, 'approved')} disabled={record.status==='approved'}>
            Approve
          </Button>
          <Button size="small" danger onClick={() => handleStatus(record.id, 'rejected')} disabled={record.status==='rejected'}>
            Reject
          </Button>
          <Button size="small" onClick={() => handleStatus(record.id, 'cancelled')} disabled={record.status==='cancelled'}>
            Cancel
          </Button>
          <Popconfirm title="Delete booking?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger type="text">Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [])

  return (
    <Card
      title="Bookings"
      extra={<Button type="primary" onClick={() => setOpen(true)}>Create Booking</Button>}
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 8, showSizeChanger: false }}
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
            <Input placeholder="student@school.edu" />
          </Form.Item>

          <Form.Item label="Device" name="deviceId" rules={[{ required: true }]}>
            <Select
              placeholder="Select device"
              options={[
                { label: 'B-001 (Lab 1)', value: 'B-001' },
                { label: 'B-002 (Lab 2)', value: 'B-002' },
                { label: 'B-003 (Lab 3)', value: 'B-003' },
              ]}
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

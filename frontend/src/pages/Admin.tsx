import { useEffect, useMemo, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, DatePicker, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { listDevices, createDevice, deleteDevice, type DeviceRecord } from '../services/devices'
import { listBookings, createBooking, updateBookingStatus, deleteBooking } from '../services/bookings'
import type { Booking } from '../services/bookings'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const { RangePicker } = DatePicker

export default function Admin() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [devices, setDevices] = useState<DeviceRecord[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(false)

  // modals
  const [deviceOpen, setDeviceOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  const [deviceForm] = Form.useForm()
  const [bookingForm] = Form.useForm()

  const loadDevices = async () => {
    setLoadingDevices(true)
    try {
      const rows = await listDevices()
      setDevices(rows ?? [])
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to load devices')
    } finally {
      setLoadingDevices(false)
    }
  }

  const loadBookings = async () => {
    setLoadingBookings(true)
    try {
      const rows = await listBookings()
      const arr = Array.isArray(rows) ? rows : (rows?.data?.bookings ?? rows?.bookings ?? [])
      setBookings(arr)
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to load bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  useEffect(() => { void loadDevices(); void loadBookings() }, [])

  // device actions
  const handleAddDevice = async () => {
    try {
      const vals = await deviceForm.validateFields()
      await createDevice({ deviceId: vals.deviceId.trim(), lab: vals.lab.trim(), ipAddress: vals.ipAddress?.trim() || '', port: Number(vals.port || 0) })
      message.success('Device added')
      deviceForm.resetFields()
      setDeviceOpen(false)
      void loadDevices()
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      message.error(err?.body?.message || err?.message || 'Failed to add device')
    }
  }

  const handleDeleteDevice = async (id: string) => {
    try {
      await deleteDevice(id)
      message.success('Device deleted')
      void loadDevices()
    } catch (err: any) {
      message.error('Failed to delete device')
    }
  }

  // bookings actions
  const handleCreateBooking = async () => {
    try {
      const vals = await bookingForm.validateFields()
      const range = vals.range as [any, any]
      const payload = {
        user: vals.user?.toString().toLowerCase() || '',
        deviceId: vals.deviceId,
        start: range[0].toISOString(),
        end: range[1].toISOString(),
        notes: vals.notes,
      }
      await createBooking(payload)
      message.success('Booking created')
      bookingForm.resetFields()
      setBookingOpen(false)
      void loadBookings()
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 401) { await logout(); navigate('/login'); return }
      const serverMsg = err?.body?.message || err?.body?.error || err?.message
      message.error(serverMsg || 'Failed to create booking')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await updateBookingStatus(id, 'approved')
      message.success('Booking approved')
      void loadBookings()
    } catch (err) {
      message.error('Failed to approve booking')
    }
  }

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id)
      message.success('Booking deleted')
      void loadBookings()
    } catch (err) {
      message.error('Failed to delete booking')
    }
  }

  const deviceColumns: ColumnsType<DeviceRecord> = [
    { title: 'Device ID', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Lab', dataIndex: 'lab', key: 'lab' },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', render: (v) => v ?? '—' },
    { title: 'Port', dataIndex: 'port', key: 'port', render: (v) => v ?? '—' },
    {
      title: 'Actions', key: 'actions', render: (_, r) => (
        <Space>
          <Popconfirm title="Delete device?" onConfirm={() => handleDeleteDevice(r.deviceId)}>
            <Button type="text" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // helper: resolve owner display/studentId/email from different possible booking shapes
  const resolveBookingOwner = (b: any): { display: string; studentId?: string; email?: string; id?: string } => {
    if (!b) return { display: 'Unknown' }
    // prefer backend-provided studentId
    if (b.studentId) return { display: String(b.studentId), studentId: String(b.studentId) }
    // relation/object shape
    if (b.user && typeof b.user === 'object') {
      const sid = b.user.studentId ?? b.user.studentID ?? b.user.student_id
      if (sid) return { display: String(sid), studentId: String(sid) }
      const email = (b.user.email ?? '').toString()
      const id = (b.user.id ?? '').toString()
      return { display: email || id || 'Unknown', email: email?.toLowerCase(), id }
    }
    // string email fallback
    if (typeof b.user === 'string') return { display: b.user, email: b.user.toLowerCase() }
    // userId fallback
    if (b.userId) return { display: String(b.userId), id: String(b.userId) }
    return { display: 'Unknown' }
  }

  const bookingsColumns: ColumnsType<Booking> = [
    { title: 'User', dataIndex: 'user', key: 'user', render: (_, r) => {
      const owner = resolveBookingOwner(r as any)
      return owner.studentId ?? owner.display
    } },
    { title: 'Device', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Start', dataIndex: 'start', key: 'start', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'End', dataIndex: 'end', key: 'end', render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: any) => <Tag>{String(s ?? 'pending').toUpperCase()}</Tag> },
    {
      title: 'Actions', key: 'actions', render: (_, r) => (
        <Space>
          <Button size="small" type="primary" onClick={() => handleApprove(r.id)} disabled={String(r.status ?? '').toLowerCase() === 'approved'}>Approve</Button>
          <Popconfirm title="Delete booking?" onConfirm={() => handleDeleteBooking(r.id)}>
            <Button size="small" danger type="text">Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const deviceOptions = useMemo(() => devices.map(d => ({ label: `${d.deviceId} (${d.lab})`, value: d.deviceId })), [devices])

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Card title="Admin Dashboard - Devices" extra={<Button type="primary" onClick={() => setDeviceOpen(true)}>Add Device</Button>}>
        <Table rowKey={(r) => r.deviceId} dataSource={devices} columns={deviceColumns} loading={loadingDevices} pagination={{ pageSize: 8 }} />

        <Modal title="Add Device" open={deviceOpen} onCancel={() => { setDeviceOpen(false); deviceForm.resetFields() }} onOk={handleAddDevice} okText="Add">
          <Form layout="vertical" form={deviceForm}>
            <Form.Item label="Device ID" name="deviceId" rules={[{ required: true }]}> <Input placeholder="e.g. B-001" /> </Form.Item>
            <Form.Item label="Lab" name="lab" rules={[{ required: true }]}> <Input placeholder="e.g. Lab 1" /> </Form.Item>
            <Form.Item label="IP Address" name="ipAddress"> <Input placeholder="e.g. 192.168.10.101" /> </Form.Item>
            <Form.Item label="Port" name="port"> <Input placeholder="e.g. 8000" /> </Form.Item>
          </Form>
        </Modal>
      </Card>

      <Card title="Admin Dashboard - Bookings" extra={<Button type="primary" onClick={() => setBookingOpen(true)}>Create Booking</Button>}>
        <Table rowKey={(r) => r.id} dataSource={bookings} columns={bookingsColumns} loading={loadingBookings} pagination={{ pageSize: 8 }} />

        <Modal title="Create Booking" open={bookingOpen} onCancel={() => { setBookingOpen(false); bookingForm.resetFields() }} onOk={handleCreateBooking} okText="Create">
          <Form layout="vertical" form={bookingForm} initialValues={{}}>
            <Form.Item label="User Email" name="user" rules={[{ required: true }, { type: 'email' }]}>
              <Input placeholder="student@example.edu" />
            </Form.Item>
            <Form.Item label="Device" name="deviceId" rules={[{ required: true }]}>
              <Select options={deviceOptions} placeholder="Select device" />
            </Form.Item>
            <Form.Item label="Time Range" name="range" rules={[{ required: true }]}>
              <RangePicker showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>
            <Form.Item label="Notes" name="notes"> <Input.TextArea rows={3} /> </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}
  
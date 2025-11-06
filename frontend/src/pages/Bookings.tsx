import { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, message, Popconfirm, Alert, ConfigProvider } from 'antd'
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

  // Disable dates before today or fully-booked days for the selected device
  const dateFullyBooked = (deviceId: string | undefined, date: Dayjs | null) => {
    if (!deviceId || !date) return false
    const bookedHours = getDisabledHoursForDate(deviceId, date)
    return bookedHours.length >= 24
  }

  const disabledDate = (current: Dayjs | null) => {
    if (!current) return false
    // past dates
    if (current.isBefore(dayjs(), 'day')) return true
    // if device selected, disable days that are fully booked
    const deviceId = form.getFieldValue('deviceId')
    if (deviceId && dateFullyBooked(deviceId, current)) return true
    return false
  }

  // helper: bookings for a given device (ignore cancelled/rejected)
  const getBookingsForDevice = (deviceId?: string) => {
    if (!deviceId) return [] as Booking[]
    return data.filter(b => {
      if (b.deviceId !== deviceId) return false
      const st = String((b as any).status ?? '').toLowerCase()
      return st !== 'cancelled' && st !== 'rejected'
    })
  }

  // For a given device and date, return hours (0-23) that overlap existing bookings.
  const getDisabledHoursForDate = (deviceId: string | undefined, date: Dayjs | null) => {
    if (!deviceId || !date) return [] as number[]
    const bookingsForDevice = getBookingsForDevice(deviceId)
    const disabled: number[] = []
    for (let h = 0; h < 24; h++) {
      const hourStart = date.hour(h).minute(0).second(0)
      const hourEnd = hourStart.add(1, 'hour')
      const overlaps = bookingsForDevice.some(b => {
        const bs = dayjs(b.start)
        const be = dayjs(b.end)
        return bs.isBefore(hourEnd) && be.isAfter(hourStart)
      })
      if (overlaps) disabled.push(h)
    }
    return disabled
  }

  // For a given device, date and hour return minutes (0-59) that are taken by bookings.
  const getDisabledMinutesForDateHour = (deviceId: string | undefined, date: Dayjs | null, hour: number) => {
    if (!deviceId || !date) return [] as number[]
    const bookingsForDevice = getBookingsForDevice(deviceId)
    const minutesSet = new Set<number>()
    const hourStart = date.hour(hour).minute(0).second(0)
    const hourEnd = hourStart.add(1, 'hour')

    for (const b of bookingsForDevice) {
      const bs = dayjs(b.start)
      const be = dayjs(b.end)
      if (!(bs.isBefore(hourEnd) && be.isAfter(hourStart))) continue
      // compute minute range within this hour that overlap the booking
      const startMin = bs.isAfter(hourStart) ? bs.minute() : 0
      // if booking end is inside this hour, disable minutes strictly less than end minute
      // (so exact minute equal to end is allowed)
      const endMin = be.isBefore(hourEnd) ? Math.max(0, be.minute() - 1) : 59
      for (let m = startMin; m <= endMin; m++) minutesSet.add(m)
    }
    return Array.from(minutesSet).sort((a, b) => a - b)
  }

  // Combined disabledTime for RangePicker:
  // - blocks any time in the past (for today's date)
  // - blocks hours/minutes that overlap existing bookings for the selected device
  // - for the "end" picker also prevents selecting times <= chosen start
  const disabledTimeForRange = (current: Dayjs | null, type: 'start' | 'end') => {
    try {
      if (!current) return {}
      const now = dayjs()
      const deviceId: string | undefined = form.getFieldValue('deviceId')
      const bookedHours = getDisabledHoursForDate(deviceId, current)
      const isToday = current.isSame(now, 'day')

      // base: hours in the past (for today)
      const pastHours = isToday ? Array.from({ length: now.hour() }, (_, i) => i) : []

      // union of past + booked
      const disabledHourSet = new Set<number>([...pastHours, ...bookedHours])

      // if user is picking the "end" side and a start is already chosen, prevent selecting end <= start
      const rangeVal: [Dayjs, Dayjs] | undefined = form.getFieldValue('range')
      if (type === 'end' && rangeVal && rangeVal[0]) {
        const startPick = dayjs(rangeVal[0])
        // if end date is same day as start, block hours up to and including start.hour()
        if (current.isSame(startPick, 'day')) {
          for (let h = 0; h <= startPick.hour(); h++) disabledHourSet.add(h)
        } else {
          // if end day is before start day (shouldn't happen because disabledDate prevents past),
          // just block entire day
        }
      }

      const disabledHours = () => Array.from(disabledHourSet).sort((a, b) => a - b)

      const disabledMinutes = (hour: number) => {
        // minutes that are already booked within this hour
        const bookedMins = getDisabledMinutesForDateHour(deviceId, current, hour)
        if (bookedMins.length >= 60) return Array.from({ length: 60 }, (_, i) => i)

        // if selecting today's current hour, disable minutes before now
        const pastMins = (isToday && hour === now.hour()) ? Array.from({ length: now.minute() }, (_, i) => i) : []

        // if end picker and start is on same day and hour, disable minutes <= start.minute()
        let startBlocked: number[] = []
        if (type === 'end' && rangeVal && rangeVal[0] && current.isSame(dayjs(rangeVal[0]), 'day')) {
          const startPick = dayjs(rangeVal[0])
          if (hour === startPick.hour()) {
            startBlocked = Array.from({ length: startPick.minute() + 1 }, (_, i) => i)
          }
        }

        const merged = new Set<number>([...bookedMins, ...pastMins, ...startBlocked])
        return Array.from(merged).sort((a, b) => a - b)
      }

      const disabledSeconds = () => []

      return { disabledHours, disabledMinutes, disabledSeconds }
    } catch {
      return {}
    }
  }

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

      // additional client-side check for overlap before sending to backend
      const deviceId = values.deviceId
      const bookingsForDevice = getBookingsForDevice(deviceId)
      const newStart = dayjs(range[0])
      const newEnd = dayjs(range[1])
      const conflict = bookingsForDevice.find(b => {
        const bs = dayjs(b.start)
        const be = dayjs(b.end)
        return bs.isBefore(newEnd) && be.isAfter(newStart)
      })
      if (conflict) {
        message.error('Selected device is already booked for that time range')
        return
      }

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
      if (status === 409) {
        message.error('Selected device is already booked for that time range')
        return
      }
      if (status === 403) message.error('Forbidden: insufficient permissions')
      else if (status === 404) message.error('Target user or device not found')
      else message.error(err?.message || 'Failed to create booking')
    }
  }

  const handleStatus = async (id: string, status: Booking['status']) => {
    try {
      // normalize to lowercase before sending
      const normalized = String(status).toLowerCase() as Booking['status']
      await updateBookingStatus(id, normalized)
      message.success(`Marked as ${normalized}`)
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

  // helper: resolve owner display/studentId/email from different possible booking shapes
  const resolveBookingOwner = (b: any): { display: string; studentId?: string; email?: string; id?: string } => {
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

  const visibleData = useMemo(() => {
    if (role === 'ADMIN') return data
    if (!user) return []
    return data.filter(b => {
      const owner = resolveBookingOwner(b)
      // prefer studentId compare if available, otherwise compare email or user id
      if (owner.studentId && (user as any)?.studentId) return owner.studentId === String((user as any).studentId)
      if (owner.email && user?.email) return owner.email === user.email.toLowerCase()
      if (owner.id && (user as any).id) return String(owner.id) === String((user as any).id)
      return owner.display === user.email
    })
  }, [data, user, role])

  const showActions = role !== 'STUDENT'

  const baseColumns: ColumnsType<Booking> = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (_, record) => {
        const owner = resolveBookingOwner(record as any)
        return owner.studentId ?? owner.display
      }
    },
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
      render: (s: any) => <Tag color={STATUS_COLORS[String(s ?? 'pending')]}>{String((s ?? 'pending')).toUpperCase()}</Tag>
    },
  ]

  const actionsColumn = {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: Booking) => {
      // only show actionable buttons to admins (column itself hidden for students)
      if (!isAdmin) return null
      const alreadyApproved = String(record.status ?? '').toLowerCase() === 'approved'
      return (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => handleStatus(record.id, 'approved')}
            disabled={alreadyApproved}
          >
            Approve
          </Button>

          <Popconfirm title="Delete booking?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger type="text">Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  }

  const columns = showActions ? [...baseColumns, actionsColumn] : baseColumns

  return (
    <Card title="Bookings" extra={<Button type="primary" onClick={() => setOpen(true)} disabled={devices.length === 0}>Create Booking</Button>}>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={visibleData} pagination={{ pageSize: 8, showSizeChanger: false }} onRow={(record) => ({
        onClick: (e) => {
          const target = e.target as HTMLElement
          if (target.closest('button, a, input, .ant-btn')) return
          navigate(`/bookings/${record.id}`)
        }
      })} rowClassName={() => 'clickable-row'} />

      <Modal 
        title="Create Booking" 
        open={open} 
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button key="cancel" onClick={() => { setOpen(false); form.resetFields() }} style={{ minWidth: 88 }}>
              Cancel
            </Button>
            <Button key="submit" type="primary" onClick={onCreate} style={{ minWidth: 88 }}>
              Create
            </Button>
          </div>
        }
        onCancel={() => { setOpen(false); form.resetFields() }}
        centered
        width={400}
      >
        {devices.length === 0 && <Alert message="No devices available to book" type="warning" showIcon style={{ marginBottom: 12 }} />}
        <Form layout="vertical" form={form} initialValues={{ user: user?.email || '' }}>
          <Form.Item label="User Email" name="user" rules={[{ required: true, message: 'Select or enter a user' }, { type: 'email', message: 'Enter a valid email' }]}>
            {isAdmin ? <Input placeholder="student@school.edu or teacher@school.edu" /> : isTeacher ? <Select placeholder="Select student (or yourself)" options={students.map(s => ({ label: `${s.name} <${s.email}>`, value: s.email }))} /> : <Input disabled value={user?.email ?? ''} />}
          </Form.Item>

          <Form.Item label="Device" name="deviceId" rules={[{ required: true }]}>
            <Select placeholder="Select device" options={devices.map(d => ({ label: `${d.deviceId} (${d.lab})`, value: d.deviceId }))} disabled={devices.length === 0} />
          </Form.Item>

          <Form.Item label="Time Range" name="range" rules={[{ required: true }]}>
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              disabledDate={disabledDate}
              disabledTime={disabledTimeForRange}
            />
          </Form.Item>

          <Form.Item label="Notes" name="notes"><Input.TextArea rows={3} placeholder="Optional context…" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
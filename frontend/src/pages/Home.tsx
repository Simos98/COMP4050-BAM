import { useEffect, useMemo, useState } from 'react'
import { Card, Table, Tag, message, Row, Col, Statistic } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useAuth } from '../context/AuthContext'
import { listBookings } from '../services/bookings'
import type { Booking } from '../services/bookings'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS: Record<string, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'volcano',
  cancelled: 'blue'
}

export default function Home() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Helper: resolve owner info from different booking shapes
  const resolveBookingOwner = (b: any): { email?: string; id?: string; studentId?: string } => {
    if (!b) return {}
    // backend may include userEmail / email field
    if (b.userEmail || b.email) return { email: String(b.userEmail ?? b.email).toLowerCase() }
    // backend may include studentId scalar
    if (b.studentId) return { studentId: String(b.studentId) }
    // booking.user could be nested object
    if (b.user && typeof b.user === 'object') {
      const email = (b.user.email ?? '').toString()
      const studentId = (b.user.studentId ?? b.user.studentID ?? b.user.student_id) ?? undefined
      const id = (b.user.id ?? b.userId ?? '').toString()
      return { email: email ? email.toLowerCase() : undefined, studentId: studentId ? String(studentId) : undefined, id }
    }
    // scalar user string (email)
    if (typeof b.user === 'string' && b.user.trim()) return { email: b.user.toLowerCase() }
    // fallback userId scalar
    if (b.userId) return { id: String(b.userId) }
    return {}
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await listBookings()
        const rows: Booking[] = Array.isArray(res) ? res : (res?.items ?? res?.bookings ?? [])
        if (!mounted) return
        setBookings(rows)
      } catch (err: any) {
        console.error('Failed to load bookings', err)
        message.error('Failed to load your bookings')
        setBookings([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [user?.email, user?.id])

  // show only bookings belonging to current user
  const visible = useMemo(() => {
    if (!user) return []
    const uemail = String(user.email ?? '').toLowerCase()
    const uid = String((user as any).id ?? '')
    const uStudentId = String((user as any).studentId ?? (user as any).studentID ?? '')
    return bookings.filter(b => {
      const owner = resolveBookingOwner(b)
      if (owner.email && uemail) return owner.email === uemail
      if (owner.id && uid) return String(owner.id) === uid
      if (owner.studentId && uStudentId) return String(owner.studentId) === uStudentId
      return false
    })
  }, [bookings, user])

  // compute approved/pending counts for the current user's visible bookings
  const statusCounts = useMemo(() => {
    const counts = { approved: 0, pending: 0 }
    for (const b of visible) {
      const s = String((b as any).status ?? 'pending').toLowerCase()
      if (s === 'approved') counts.approved += 1
      else if (s === 'pending') counts.pending += 1
    }
    return counts
  }, [visible])

  const columns: ColumnsType<Booking> = [
    { title: 'Device', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Start', dataIndex: 'start', key: 'start', render: v => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'End', dataIndex: 'end', key: 'end', render: v => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: s => <Tag color={STATUS_COLORS[String(s ?? 'pending')]}>{String(s ?? 'pending').toUpperCase()}</Tag> },
  ]

  return (
    <Card title="My Bookings">
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12}>
          <Card bordered hoverable bodyStyle={{ padding: 12 }}>
            <Statistic title="Approved" value={statusCounts.approved} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered hoverable bodyStyle={{ padding: 12 }}>
            <Statistic title="Pending" value={statusCounts.pending} />
          </Card>
        </Col>
      </Row>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={visible}
        pagination={{ pageSize: 6, showSizeChanger: false }}
        locale={{ emptyText: 'No bookings found' }}
        onRow={(record) => ({
          onClick: (e) => {
            const target = e.target as HTMLElement
            if (target.closest('button, a, input, .ant-btn')) return
            navigate(`/bookings/${record.id}`)
          }
        })}
        rowClassName={() => 'clickable-row'}
      />
    </Card>
  )
}

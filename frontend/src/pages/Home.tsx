import { Card, Col, Row, Statistic, Table, Tag } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { listBookings } from '../services/bookings'
import type { Booking } from '../types'
import { useAuth } from '../context/AuthContext'

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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const rows = await listBookings()
        setBookings(rows)
      } catch {
        // swallow — pages that call Home should handle messaging elsewhere
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const myBookings = useMemo(
    () => bookings.filter(b => user ? b.user === user.email : false),
    [bookings, user]
  )

  const approved = myBookings.filter(b => b.status === 'approved').length
  const pending = myBookings.filter(b => b.status === 'pending').length

  const columns = useMemo(() => [
    { title: 'Device', dataIndex: 'deviceId', key: 'deviceId' },
    { title: 'Start', dataIndex: 'start', key: 'start', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'End', dataIndex: 'end', key: 'end', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={STATUS_COLORS[s]}>{String(s).toUpperCase()}</Tag> },
  ], [])

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="My Bookings" value={myBookings.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Approved" value={approved} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Pending" value={pending} />
          </Card>
        </Col>
      </Row>

      <Card title="My Bookings" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={myBookings}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: 'No bookings found' }}
        />
      </Card>
    </>
  )
}

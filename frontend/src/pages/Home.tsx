import { Card, Col, Row, Statistic } from 'antd'
import { useEffect, useState } from 'react'
import { listBookings } from '../services/bookings'
import type { Booking } from '../types'

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>([])
  useEffect(() => { listBookings().then(setBookings) }, [])
  const approved = bookings.filter(b=>b.status==='approved').length
  const pending = bookings.filter(b=>b.status==='pending').length
  return (
    <Row gutter={[16,16]}>
      <Col xs={24} md={8}><Card><Statistic title="Total Bookings" value={bookings.length} /></Card></Col>
      <Col xs={24} md={8}><Card><Statistic title="Approved" value={approved} /></Card></Col>
      <Col xs={24} md={8}><Card><Statistic title="Pending" value={pending} /></Card></Col>
    </Row>
  )
}

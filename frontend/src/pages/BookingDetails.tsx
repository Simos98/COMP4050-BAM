// src/pages/BookingDetails.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Row, Col, Statistic, Typography, Space, Progress, Tag, Image, Skeleton, Empty, Alert } from 'antd'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { Booking, BookingStatus } from '../types'
import { getBooking, listBookingImages } from '../services/bookings'

// Enable timezone handling (once per bundle; safe to call here)
dayjs.extend(utc)
dayjs.extend(timezone)

const SYD_TZ = 'Australia/Sydney' // adjust if you want a different display TZ

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'volcano',
  cancelled: 'blue',
}

type BookingImage = {
  id: string
  url?: string
  createdAt?: string
}

function formatHMS(ms: number) {
  const pos = Math.max(0, ms)
  const totalSeconds = Math.floor(pos / 1000)
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).toString().padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

/**
 * Countdown:
 * - Treat stored ISO strings as absolute instants (UTC instants).
 * - Compare with local "now" in epoch ms (no timezone errors).
 * - Display times in Australia/Sydney to avoid 23:00 → 12:00 confusion.
 */
function useCountdown(startISO?: string, endISO?: string) {
  const [now, setNow] = useState(() => Date.now())
  const ref = useRef<number | null>(null)

  useEffect(() => {
    ref.current = window.setInterval(() => setNow(Date.now()), 1000)
    return () => { if (ref.current) window.clearInterval(ref.current) }
  }, [])

  return useMemo(() => {
    if (!startISO || !endISO) {
      return { mode: 'unknown' as const, remainingMs: 0, totalMs: 0, percent: 0 }
    }
    // Parse ISO instants to epoch ms (independent of display timezone)
    const startMs = dayjs(startISO).valueOf()
    const endMs = dayjs(endISO).valueOf()
    const nowMs = now
    const totalMs = Math.max(0, endMs - startMs)
    const GRACE_MS = 1000

    if (nowMs + GRACE_MS < startMs) {
      return { mode: 'before' as const, remainingMs: startMs - nowMs, totalMs, percent: 0 }
    }
    if (nowMs >= endMs + GRACE_MS) {
      return { mode: 'ended' as const, remainingMs: 0, totalMs, percent: 100 }
    }
    const remainingMs = Math.max(0, endMs - nowMs)
    const elapsed = Math.max(0, totalMs - remainingMs)
    const percent = totalMs ? Math.min(100, Math.max(0, Math.round((elapsed / totalMs) * 100))) : 0
    return { mode: 'running' as const, remainingMs, totalMs, percent }
  }, [startISO, endISO, now])
}

export default function BookingDetails() {
  const { id } = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [images, setImages] = useState<BookingImage[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgLoading, setImgLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!id) return
        const b = await getBooking(id)
        if (!mounted) return
        setBooking(b)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!id) return
        const imgs = await listBookingImages(id)
        if (!mounted) return
        setImages(imgs)
      } finally {
        if (mounted) setImgLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  const { mode, remainingMs, totalMs, percent } = useCountdown(booking?.start, booking?.end)

  const remainingLabel = useMemo(() => {
    if (!booking) return ''
    if (mode === 'before') return 'Starts In'
    if (mode === 'running') return 'Time Remaining'
    return 'Session Ended'
  }, [mode, booking])

  const sessionLength = useMemo(() => {
    if (!booking) return '—'
    const total = dayjs(booking.end).valueOf() - dayjs(booking.start).valueOf()
    return formatHMS(total)
  }, [booking])

  // Display in AU/Sydney; pick 12-hr or 24-hr to taste:
  // For 24-hour: 'YYYY-MM-DD HH:mm'
  // For 12-hour: 'YYYY-MM-DD hh:mm A'
  const DISPLAY_FMT = 'YYYY-MM-DD hh:mm A'

  const startLocal = booking ? dayjs(booking.start).tz(SYD_TZ).format(DISPLAY_FMT) : ''
  const endLocal   = booking ? dayjs(booking.end).tz(SYD_TZ).format(DISPLAY_FMT)   : ''

  return (
    <Space direction="vertical" style={{ display: 'flex' }} size="large">
      <Link to="/">{'< Back'}</Link>

      <Card title="Booking Details">
        {loading || !booking ? (
          <Skeleton active />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="small">
                  <Typography.Text type="secondary">Booking ID</Typography.Text>
                  <Typography.Text code>{booking.id}</Typography.Text>

                  <Typography.Text type="secondary">Device</Typography.Text>
                  <Typography.Text>{booking.deviceId}</Typography.Text>

                  <Typography.Text type="secondary">User</Typography.Text>
                  <Typography.Text>{booking.user}</Typography.Text>

                  <Typography.Text type="secondary">Start (Australia/Sydney)</Typography.Text>
                  <Typography.Text>{startLocal}</Typography.Text>

                  <Typography.Text type="secondary">End (Australia/Sydney)</Typography.Text>
                  <Typography.Text>{endLocal}</Typography.Text>

                  <Typography.Text type="secondary">Status</Typography.Text>
                  <Tag color={STATUS_COLORS[booking.status]}>{booking.status.toUpperCase()}</Tag>

                  {booking.notes ? (
                    <>
                      <Typography.Text type="secondary">Notes</Typography.Text>
                      <Typography.Text>{booking.notes}</Typography.Text>
                    </>
                  ) : null}
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Card>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title={remainingLabel} value={mode === 'ended' ? '00:00:00' : formatHMS(remainingMs)} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Session Length" value={sessionLength} />
                    </Col>
                  </Row>

                  <div style={{ marginTop: 16 }}>
                    <Progress percent={percent} status={mode === 'ended' ? 'success' : 'active'} />
                  </div>

                  {mode === 'before' && (
                    <Alert style={{ marginTop: 16 }} type="info" message="This session has not started yet." showIcon />
                  )}
                  {mode === 'ended' && (
                    <Alert style={{ marginTop: 16 }} type="warning" message="This session has ended." showIcon />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Card title="Microscope Images">
        {imgLoading ? (
          <Skeleton active />
        ) : images && images.length > 0 ? (
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {images.map((img) => (
                <Col xs={24} sm={12} md={8} lg={6} key={img.id}>
                  <Card hoverable>
                    {img.url ? (
                      <Image src={img.url} alt={`Image ${img.id}`} width="100%" style={{ maxHeight: 220, objectFit: 'cover' }} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: 180,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f5f5f5',
                          border: '1px dashed #d9d9d9',
                        }}
                      >
                        <Typography.Text type="secondary">Image placeholder (from microscope)</Typography.Text>
                      </div>
                    )}
                    <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                      {img.createdAt ? dayjs(img.createdAt).tz(SYD_TZ).format('YYYY-MM-DD HH:mm:ss') : 'Pending'}
                    </Typography.Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        ) : (
          <Empty description="No images yet for this booking." />
        )}
      </Card>
    </Space>
  )
}

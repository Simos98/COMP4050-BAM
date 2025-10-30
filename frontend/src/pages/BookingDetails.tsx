// src/pages/BookingDetails.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Space, Spin, message, Typography, Alert } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { getBooking } from '../services/bookings'
import { getPreview, move, type Direction, type CameraState } from '../services/camera'
import type { Booking } from '../types'
import { useAuth } from '../context/AuthContext'
import { getDevice } from '../services/devices'

const { Title, Text } = Typography

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [camState, setCamState] = useState<CameraState | null>(null)
  const [busy, setBusy] = useState(false)
  const [allowedToView, setAllowedToView] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    const load = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const b = await getBooking(id)
        if (!mounted) return
        setBooking(b)

        const device = await getDevice(b.deviceId)
        const deviceOk = !!(device && device.ip && device.port)
        const canView = deviceOk && (user?.role === 'admin' || b.status === 'approved')
        setAllowedToView(Boolean(canView))

        if (deviceOk && canView) {
          const p = await getPreview(b.deviceId)
          if (!mounted) return
          setImgUrl(p.url)
          setCamState(p.state)
        } else {
          setImgUrl(null)
          setCamState(null)
        }
      } catch (err: any) {
        if (err?.status === 401) {
          await logout()
          navigate('/login')
          return
        }
        console.error(err)
        if (err?.status === 403 || err?.status === 401) {
          setErrorMessage('Not authorized to view this booking.')
        } else if (err?.status === 404) {
          setErrorMessage('Booking or device not found.')
        } else {
          setErrorMessage(err?.message || 'Unexpected error loading booking.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, navigate, user, logout])

  const doMove = async (dir: Direction) => {
    if (!booking) return
    if (!allowedToView) {
      message.warning('Camera unavailable until booking is approved and device configured')
      return
    }
    setBusy(true)
    try {
      const res = await move(booking.deviceId, dir)
      setImgUrl(res.url)
      setCamState(res.state)
    } catch (err: any) {
      if (err?.status === 401) { await logout(); navigate('/login'); return }
      message.error('Failed to move camera')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div style={{display:'flex', justifyContent:'center', padding:40}}><Spin size="large" /></div>
  if (errorMessage) return <div style={{ padding: 24 }}><Alert type="error" message="Error" description={errorMessage} /></div>
  if (!booking) return null

  const canControl = Boolean(user) && allowedToView

  return (
    <Row gutter={[16,16]}>
      <Col xs={24} md={16}>
        <Card title={<Title level={4}>{`Booking ${booking.id} — ${booking.deviceId}`}</Title>}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 480, background: '#f5f5f5' }}>
            {imgUrl ? (
              <img src={imgUrl} alt="camera preview" style={{ maxWidth: '100%', maxHeight: 640, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', width: '100%' }}>
                {!allowedToView ? (
                  <Alert
                    type="warning"
                    message="Camera preview unavailable"
                    description={
                      <div>
                        <div>This booking cannot preview the camera.</div>
                        <div>Reasons: booking not approved or device not configured with IP/port.</div>
                        <div>Ask an admin to configure the device (IP & port) and/or approve the booking.</div>
                      </div>
                    }
                  />
                ) : (
                  <div style={{ padding: 60 }}><Spin /></div>
                )}
              </div>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <Text strong>Start:</Text> <Text>{booking.start}</Text><br />
            <Text strong>End:</Text> <Text>{booking.end}</Text><br />
            <Text strong>Status:</Text> <Text>{booking.status}</Text>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card title="Camera Controls">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ textAlign:'center' }}>
              <Button onClick={() => doMove('up')} icon={<ArrowUpOutlined />} disabled={!canControl || busy} />
            </div>

            <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
              <Button onClick={() => doMove('left')} icon={<ArrowLeftOutlined />} disabled={!canControl || busy} />
              <Button onClick={() => doMove('right')} icon={<ArrowRightOutlined />} disabled={!canControl || busy} />
            </div>

            <div style={{ textAlign:'center' }}>
              <Button onClick={() => doMove('down')} icon={<ArrowDownOutlined />} disabled={!canControl || busy} />
            </div>

            <Space>
              <Button onClick={() => doMove('zoomin')} icon={<ZoomInOutlined />} disabled={!canControl || busy}>Zoom In</Button>
              <Button onClick={() => doMove('zoomout')} icon={<ZoomOutOutlined />} disabled={!canControl || busy}>Zoom Out</Button>
              <Button onClick={() => doMove('reset')} icon={<ReloadOutlined />} disabled={!canControl || busy}>Reset</Button>
            </Space>

            <div style={{ marginTop: 12 }}>
              <Text strong>Position:</Text><br />
              <Text>{camState ? `x=${camState.x}, y=${camState.y}, zoom=${camState.zoom.toFixed(2)}` : '—'}</Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

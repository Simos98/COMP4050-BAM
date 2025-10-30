// src/pages/BookingDetails.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Space, Spin, message, Typography, Alert } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined, ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { getBooking } from '../services/bookings'
import { getPreview } from '../services/camera'
import { apiFetch } from '../services/api'
import type { Booking } from '../types'
import { useAuth } from '../context/AuthContext'
import { getDevice } from '../services/devices'

const { Title, Text } = Typography

type CameraState = { x: number; y: number; zoom: number }

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

  // fetch booking + device + initial preview, and start periodic preview polling when allowed
  useEffect(() => {
    if (!id) return
    let mounted = true
    let pollTimer: ReturnType<typeof setTimeout> | null = null

    const startPreviewPoll = async (deviceId: string) => {
      // poll loop: fetch preview, wait, repeat
      const loop = async () => {
        try {
          const p = await getPreview(deviceId)
          if (!mounted) return
          if (p?.url) setImgUrl(p.url)
          if (p?.state) setCamState(p.state as CameraState)
        } catch (e) {
          // ignore transient preview errors
        }
        if (!mounted) return
        pollTimer = setTimeout(loop, 3000)
      }
      void loop()
    }

    const load = async () => {
      setLoading(true)
      setErrorMessage(null)
      setImgUrl(null)
      setCamState(null)
      try {
        const b = await getBooking(id)
        if (!mounted) return
        setBooking(b)

        const device = await getDevice(b.deviceId)
        const deviceOk = !!(device && device.ipAddress && device.port)
        const canView = deviceOk && (String(user?.role ?? '').toLowerCase() === 'admin' || b.status === 'approved')
        setAllowedToView(Boolean(canView))

        if (deviceOk && canView) {
          // fetch immediate preview and start poll loop
          try {
            const p = await getPreview(b.deviceId)
            if (!mounted) return
            setImgUrl(p?.url ?? null)
            setCamState(p?.state ?? null)
          } catch (err) {
            // continue, poll will try again
          }
          void startPreviewPoll(b.deviceId)
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

    void load()

    return () => {
      mounted = false
      if (pollTimer) clearTimeout(pollTimer)
    }
  }, [id, navigate, user, logout])

  // map UI actions to command payloads described in your spec
  const buildCommandPayload = (action: string): { command: string; amount?: number } => {
    // default step size; adjust as needed
    const STEP = 20
    const FINE_STEP = 2

    switch (action) {
      case 'up': return { command: 'move_y', amount: STEP }
      case 'down': return { command: 'move_y', amount: -STEP }
      case 'left': return { command: 'move_x', amount: -STEP }
      case 'right': return { command: 'move_x', amount: STEP }
      case 'zoomin': return { command: 'zoom_in_fine', amount: FINE_STEP }
      case 'zoomout': return { command: 'zoom_out_fine', amount: FINE_STEP }
      case 'reset': return { command: 'change_lens' } // no amount
      case 'brightnessUp': return { command: 'brightness_up', amount: 1 }
      case 'brightnessDown': return { command: 'brightness_down', amount: 1 }
      case 'apertureUp': return { command: 'aperture_up', amount: 1 }
      case 'apertureDown': return { command: 'aperture_down', amount: 1 }
      default: return { command: action }
    }
  }

  // send command to backend and refresh preview
  const doMove = async (action: string) => {
    if (!booking) return
    if (!allowedToView) {
      message.warning('Image unavailable until booking is approved and device configured')
      return
    }
    setBusy(true)
    try {
      const payload = buildCommandPayload(action)
      // post to backend controller that accepts the JSON command as described
      // endpoint: POST /api/camera/:deviceId/command
      await apiFetch(`/api/camera/${booking.deviceId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // after a successful command we fetch the latest preview (backend pushes new image to storage)
      try {
        const p = await getPreview(booking.deviceId)
        if (p?.url) setImgUrl(p.url)
        if (p?.state) setCamState(p.state as CameraState)
      } catch (e) {
        // ignore preview fetch error; UI still usable
      }
    } catch (err: any) {
      if (err?.status === 401) { await logout(); navigate('/login'); return }
      // backend may return {status:"invalid command"} or {status:"error"} in body
      const body = (err?.body ?? err?.details) as any
      if (body && body.status === 'invalid command') {
        message.error('Invalid command')
      } else {
        message.error('Failed to send command')
      }
      console.error('command error', err)
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
              <img src={imgUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 640, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', width: '100%' }}>
                {!allowedToView ? (
                  <Alert
                    type="warning"
                    message="Image unavailable"
                    description={
                      <div>
                        <div>This booking cannot show the image preview.</div>
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
        <Card title="Controls">
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
              <Text>{camState ? `x=${camState.x}, y=${camState.y}, zoom=${camState.zoom?.toFixed?.(2) ?? camState.zoom}` : '—'}</Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}
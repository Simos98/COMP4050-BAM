// src/pages/BookingDetails.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Descriptions, Spin, Image, Space, Tag, message } from 'antd'
import dayjs from 'dayjs'
import type { Booking } from '../types'
import { getBooking, listBookingImages } from '../services/bookings'

type BookingImage = {
  id: string
  bookingId: string
  url: string
  createdAt: string
}

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [images, setImages] = useState<BookingImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await getBooking(id)
        if (data) setBooking(data)
        const imgs = await listBookingImages(id)
        setImages(imgs)
      } catch (err) {
        console.error(err)
        message.error('Failed to load booking details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spin tip="Loading booking..." size="large" />
      </div>
    )
  }

  if (!booking) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Booking not found.</div>
  }

  return (
    <Card
      title={`Booking Details – ${booking.deviceId}`}
      style={{ margin: '24px' }}
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Booking ID">{booking.id}</Descriptions.Item>
        <Descriptions.Item label="User">{booking.user}</Descriptions.Item>
        <Descriptions.Item label="Device">{booking.deviceId}</Descriptions.Item>
        <Descriptions.Item label="Start">
          {dayjs(booking.start).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="End">
          {dayjs(booking.end).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={
            booking.status === 'approved'
              ? 'green'
              : booking.status === 'pending'
              ? 'gold'
              : booking.status === 'rejected'
              ? 'volcano'
              : 'blue'
          }>
            {booking.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Notes">{booking.notes || '—'}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <h3>Microscope Images</h3>
        {images.length === 0 ? (
          <div style={{ color: '#888' }}>No images for this booking yet.</div>
        ) : (
          <Space size="middle" wrap>
            <Image.PreviewGroup>
              {images.map((img) => (
                <Image
                  key={img.id}
                  width={200}
                  height={150}
                  src={img.url}
                  alt={`Image ${img.id}`}
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
              ))}
            </Image.PreviewGroup>
          </Space>
        )}
      </div>
    </Card>
  )
}

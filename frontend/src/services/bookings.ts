import { apiFetch } from './api'

export type Booking = {
  id: string
  user: string
  deviceId: string
  start: string
  end: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export type BookingCreatePayload = {
  user: string
  deviceId: string
  start: string
  end: string
  notes?: string
}

export async function listBookings(): Promise<Booking[] | any> {
  const body = await apiFetch('/api/bookings', { method: 'GET' })
  // Accept multiple possible envelopes
  return body?.data?.bookings ?? body?.bookings ?? (Array.isArray(body) ? body : body?.data ?? [])
}

export async function createBooking(payload: BookingCreatePayload) {
  const body = await apiFetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return body?.data?.booking ?? body?.booking ?? body
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const body = await apiFetch(`/api/bookings/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return body?.data?.booking ?? body?.booking ?? body
}

export async function deleteBooking(id: string) {
  await apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })
}

export async function getBooking(id: string): Promise<Booking | any> {
  const body = await apiFetch(`/api/bookings/${id}`, { method: 'GET' })
  return body?.data?.booking ?? body?.booking ?? body
}

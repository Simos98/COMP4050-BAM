import dayjs from 'dayjs'
import { getDevice } from './devices'
import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from './api'
import type { Booking, BookingStatus } from '../types'

export async function listBookings(params?: Record<string, any>): Promise<{ items: Booking[]; page?: number; page_size?: number; total?: number }> {
  const body = await apiGet('/api/bookings', params)
  return { items: body.items ?? body, page: body.page, page_size: body.page_size, total: body.total }
}

export async function getBooking(id: string): Promise<Booking> {
  const body = await apiGet(`/api/bookings/${encodeURIComponent(id)}`)
  return body.booking ?? body
}

export async function createBooking(input: { user?: string; deviceId: string; start: string; end: string; notes?: string }) {
  // backend will enforce RBAC
  const body = await apiPost('/api/bookings', {
    user: input.user,
    device_id: input.deviceId,
    start: input.start,
    end: input.end,
    notes: input.notes
  })
  return body.booking ?? body
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  // use PATCH /api/bookings/:id with { status }
  const body = await apiPatch(`/api/bookings/${encodeURIComponent(id)}`, { status })
  return body.booking ?? body
}

export async function deleteBooking(id: string) {
  return apiDelete(`/api/bookings/${encodeURIComponent(id)}`)
}

export async function listBookingImages(bookingId: string) {
  const body = await apiGet(`/api/bookings/${encodeURIComponent(bookingId)}/images`)
  return body.items ?? body
}

export async function getMyBookings(): Promise<Booking[]> {
  // backend should return bookings for the logged-in user
  return apiFetch('/api/bookings');
}

// const KEY = 'bookings_v1'

// // Seed demo data
// function seedIfEmpty() {
//   const raw = localStorage.getItem(KEY)
//   if (raw) return
//   const now = dayjs()
//   const demo: Booking[] = [
//     {
//       id: crypto.randomUUID(),
//       user: 'student01@school.edu',
//       deviceId: 'B-001',
//       start: now.add(1, 'hour').toISOString(),
//       end: now.add(2, 'hour').toISOString(),
//       status: 'pending',

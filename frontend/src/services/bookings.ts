import dayjs from 'dayjs'
import { getUserFromToken } from './mockAuth'
import type { Booking, BookingStatus } from '../types'

const KEY = 'bookings_v1'

// Seed demo data
function seedIfEmpty() {
  const raw = localStorage.getItem(KEY)
  if (raw) return
  const now = dayjs()
  const demo: Booking[] = [
    {
      id: crypto.randomUUID(),
      user: 'student01@school.edu',
      deviceId: 'B-001',
      start: now.add(1, 'hour').toISOString(),
      end: now.add(2, 'hour').toISOString(),
      status: 'pending',
      notes: 'Biology class prep'
    },
    {
      id: crypto.randomUUID(),
      user: 'alice@school.edu',
      deviceId: 'B-003',
      start: now.add(1, 'day').hour(9).minute(0).second(0).toISOString(),
      end: now.add(1, 'day').hour(10).minute(0).second(0).toISOString(),
      status: 'approved',
      notes: ''
    },
  ]
  localStorage.setItem(KEY, JSON.stringify(demo))
}
seedIfEmpty()

function readAll(): Booking[] {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Booking[]) : []
}
function writeAll(list: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}
function delay(ms = 200) { return new Promise(res => setTimeout(res, ms)) }

export async function listBookings(): Promise<Booking[]> {
  await delay()
  const user = getUserFromToken()
  const all = readAll().sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
  if (!user) return []
  if (user.role === 'admin') return all
  // non-admins only see their own bookings
  return all.filter(b => b.user === user.email)
}

export async function getBooking(id: string): Promise<Booking> {
  await delay()
  const all = readAll()
  const b = all.find(x => x.id === id)
  if (!b) {
    const e: any = new Error('Not found')
    e.status = 404
    throw e
  }
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }
  if (user.role !== 'admin' && b.user !== user.email) {
    const e: any = new Error('Forbidden'); e.status = 403; throw e
  }
  return b
}

export async function createBooking(
  input: Omit<Booking, 'id' | 'status'> & { status?: BookingStatus }
): Promise<Booking> {
  await delay()
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }

  // if non-admin tries to create for someone else, forbid
  const ownerEmail = input.user || user.email
  if (ownerEmail !== user.email && user.role !== 'admin') {
    const e: any = new Error('Forbidden')
    e.status = 403
    throw e
  }

  // basic validation
  if (!input.deviceId || !input.start || !input.end) {
    const e: any = new Error('Invalid payload'); e.status = 400; throw e
  }
  if (dayjs(input.end).valueOf() <= dayjs(input.start).valueOf()) {
    const e: any = new Error('end must be after start'); e.status = 400; throw e
  }

  const all = readAll()
  const booking: Booking = {
    id: crypto.randomUUID(),
    user: ownerEmail,
    deviceId: input.deviceId,
    start: input.start,
    end: input.end,
    status: input.status ?? 'pending',
    notes: input.notes ?? ''
  }
  all.push(booking)
  writeAll(all)
  return booking
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  await delay()
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }
  const all = readAll()
  const idx = all.findIndex(b => b.id === id)
  if (idx === -1) { const e: any = new Error('Not found'); e.status = 404; throw e }
  const booking = all[idx]

  // Admins can set any status. Non-admins can only cancel their own booking.
  if (user.role !== 'admin') {
    if (status !== 'cancelled') {
      const e: any = new Error('Forbidden'); e.status = 403; throw e
    }
    if (booking.user !== user.email) {
      const e: any = new Error('Forbidden'); e.status = 403; throw e
    }
  }

  booking.status = status
  all[idx] = booking
  writeAll(all)
  return booking
}

export async function deleteBooking(id: string): Promise<void> {
  await delay()
  const user = getUserFromToken()
  if (!user) { const e: any = new Error('Unauthorized'); e.status = 401; throw e }
  const all = readAll()
  const idx = all.findIndex(b => b.id === id)
  if (idx === -1) { const e: any = new Error('Not found'); e.status = 404; throw e }
  const booking = all[idx]
  // allow admin only (or owner only while pending — choose your policy)
  if (user.role !== 'admin') {
    const e: any = new Error('Forbidden'); e.status = 403; throw e
  }
  all.splice(idx, 1)
  writeAll(all)
}

export async function listBookingImages(_bookingId: string) {
  await delay(120)
  return []
}

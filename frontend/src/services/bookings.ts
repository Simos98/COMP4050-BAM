import dayjs from 'dayjs'
import type { Booking, BookingStatus } from '../types'

const KEY = 'bookings_v1'

// Seed local demo data if none exists
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
      user: 'teacher.alice@school.edu',
      deviceId: 'B-003',
      start: now.add(1, 'day').hour(9).minute(0).second(0).toISOString(),
      end: now.add(1, 'day').hour(10).minute(0).second(0).toISOString(),
      status: 'approved'
    },
  ]
  localStorage.setItem(KEY, JSON.stringify(demo))
}
seedIfEmpty()

// Helpers for storage access
function readAll(): Booking[] {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Booking[]) : []
}

function writeAll(list: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

// Artificial delay for realism
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}


export async function listBookings(): Promise<Booking[]> {
  await delay(200)
  return readAll().sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
}

// Create a new booking
export async function createBooking(
  input: Omit<Booking, 'id' | 'status'> & { status?: BookingStatus }
): Promise<Booking> {
  await delay(250)
  const b: Booking = { id: crypto.randomUUID(), status: input.status ?? 'pending', ...input }
  const all = readAll()
  all.push(b)
  writeAll(all)
  return b
}

// Update booking status
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  await delay(200)
  const all = readAll()
  const idx = all.findIndex(b => b.id === id)
  if (idx === -1) throw new Error('Booking not found')
  all[idx] = { ...all[idx], status }
  writeAll(all)
  return all[idx]
}

// Delete a booking
export async function deleteBooking(id: string): Promise<void> {
  await delay(200)
  writeAll(readAll().filter(b => b.id !== id))
}

export async function getBooking(id: string): Promise<Booking> {
  await delay(150)
  const all = readAll()
  const found = all.find(b => b.id === id)
  if (!found) throw new Error('Booking not found')
  return found
}

// Get microscope images for a booking (placeholder data)
export async function listBookingImages(
  bookingId: string
): Promise<Array<{ id: string; url?: string; createdAt?: string }>> {
  await delay(150)
  // Placeholder demo images (backend will replace with real data later)
  return [
    {
      id: `${bookingId}-img-1`,
      url: undefined, // URL will come from backend later
      createdAt: dayjs().subtract(5, 'minutes').toISOString()
    },
    {
      id: `${bookingId}-img-2`,
      url: undefined,
      createdAt: dayjs().subtract(2, 'minutes').toISOString()
    }
  ]
}

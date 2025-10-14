import dayjs from 'dayjs'
import type { Booking, BookingStatus } from '../types'

const KEY = 'bookings_v1'

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

function readAll(): Booking[] {
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as Booking[]) : []
}
function writeAll(list: Booking[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export async function listBookings(): Promise<Booking[]> {
  await delay(200)
  return readAll().sort((a,b)=>dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
}

export async function createBooking(input: Omit<Booking, 'id' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
  await delay(250)
  const b: Booking = { id: crypto.randomUUID(), status: input.status ?? 'pending', ...input }
  const all = readAll()
  all.push(b)
  writeAll(all)
  return b
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  await delay(200)
  const all = readAll()
  const idx = all.findIndex(b=>b.id===id)
  if (idx === -1) throw new Error('Booking not found')
  all[idx] = { ...all[idx], status }
  writeAll(all)
  return all[idx]
}

export async function deleteBooking(id: string): Promise<void> {
  await delay(200)
  writeAll(readAll().filter(b=>b.id!==id))
}

function delay(ms: number) {
  return new Promise(res=>setTimeout(res, ms))
}

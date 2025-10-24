// src/services/bookings.ts
import { api } from './api'
import type { Booking } from '../types'
import { useMocks } from './useMocks'

// ------------------
// Mock implementations
// ------------------

function mockListBookings(): Booking[] {
  const raw = localStorage.getItem('bookings_v1')
  if (!raw) return []
  return JSON.parse(raw)
}

function mockCreateBooking(payload: {
  user: string
  deviceId: string
  start: string
  end: string
  notes?: string
}): Booking {
  const all = mockListBookings()
  const newBooking: Booking = {
    id: crypto.randomUUID(),
    user: payload.user,
    deviceId: payload.deviceId,
    start: payload.start,
    end: payload.end,
    status: 'pending',
    notes: payload.notes,
  }
  all.push(newBooking)
  localStorage.setItem('bookings_v1', JSON.stringify(all))
  return newBooking
}

function mockUpdateBookingStatus(id: string, status: string): Booking | undefined {
  const all = mockListBookings()
  const idx = all.findIndex((b) => b.id === id)
  if (idx >= 0) {
    all[idx].status = status as any
    localStorage.setItem('bookings_v1', JSON.stringify(all))
    return all[idx]
  }
  return undefined
}

function mockDeleteBooking(id: string) {
  const all = mockListBookings().filter((b) => b.id !== id)
  localStorage.setItem('bookings_v1', JSON.stringify(all))
}

// ------------------
// Live API implementations
// ------------------

async function apiListBookings(): Promise<Booking[]> {
  const res = await api.get('/bookings')
  // Backend should return { data: [...] }
  return res.data.data ?? res.data
}

async function apiCreateBooking(payload: {
  user: string
  deviceId: string
  start: string
  end: string
  notes?: string
}): Promise<Booking> {
  const res = await api.post('/bookings', payload)
  return res.data.data ?? res.data
}

async function apiUpdateBookingStatus(id: string, status: string): Promise<Booking> {
  const res = await api.patch(`/bookings/${id}`, { status })
  return res.data.data ?? res.data
}

async function apiDeleteBooking(id: string) {
  await api.delete(`/bookings/${id}`)
}

// ------------------
// Toggle export based on mock mode
// ------------------

export const listBookings = useMocks ? mockListBookings : apiListBookings
export const createBooking = useMocks ? mockCreateBooking : apiCreateBooking
export const updateBookingStatus = useMocks ? mockUpdateBookingStatus : apiUpdateBookingStatus
export const deleteBooking = useMocks ? mockDeleteBooking : apiDeleteBooking

// ------------------
// Get single booking by ID (mock + API support)
// ------------------

async function apiGetBooking(id: string): Promise<Booking> {
  const res = await api.get(`/bookings/${id}`)
  return res.data.data ?? res.data
}

function mockGetBooking(id: string): Booking | undefined {
  const all = mockListBookings()
  return all.find((b) => b.id === id)
}

// Toggle export
export const getBooking = useMocks ? mockGetBooking : apiGetBooking

// For now, mock data structure for images
type BookingImage = {
  id: string
  bookingId: string
  url: string
  createdAt: string
}

const mockBookingImages: BookingImage[] = [
  {
    id: 'img-001',
    bookingId: 'b001',
    url: 'https://via.placeholder.com/300x200?text=Microscope+Image+1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'img-002',
    bookingId: 'b001',
    url: 'https://via.placeholder.com/300x200?text=Microscope+Image+2',
    createdAt: new Date().toISOString(),
  },
]

// Mock + API versions
async function apiListBookingImages(bookingId: string): Promise<BookingImage[]> {
  const res = await api.get(`/bookings/${bookingId}/images`)
  return res.data.data ?? res.data
}

async function mockListBookingImages(bookingId: string): Promise<BookingImage[]> {
  return mockBookingImages.filter((img) => img.bookingId === bookingId)
}

// Export toggle
export const listBookingImages = useMocks ? mockListBookingImages : apiListBookingImages


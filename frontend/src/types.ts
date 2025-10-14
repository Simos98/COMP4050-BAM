// src/types.ts
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type Booking = {
  id: string
  user: string
  deviceId: string
  start: string   // ISO
  end: string     // ISO
  status: BookingStatus
  notes?: string
}

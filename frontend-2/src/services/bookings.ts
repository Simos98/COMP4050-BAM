import { apiFetch } from './api';
import type { Booking } from '../types';

export async function getMyBookings(): Promise<Booking[]> {
  // expects backend endpoint that returns bookings for the logged in user
  return apiFetch('/bookings');
}
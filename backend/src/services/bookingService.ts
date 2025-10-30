import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const bookingService = {
  /**
   * Get all bookings (with optional filters)
   */
  async getAllBookings(filters?: { userId?: string; deviceId?: string }) {
    return await prisma.booking.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.deviceId && { deviceId: filters.deviceId })
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string) {
    return await prisma.booking.findUnique({
      where: { id }
    });
  },

  /**
   * Create a new booking
   */
  async createBooking(data: {
    userId: string;
    deviceId: string;
    start: Date;
    end: Date;
    notes?: string;
  }) {
    return await prisma.booking.create({
      data
    });
  },

  /**
   * Update a booking
   */
  async updateBooking(id: string, data: Partial<{
    start: Date;
    end: Date;
    notes: string;
  }>) {
    return await prisma.booking.update({
      where: { id },
      data
    });
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: string) {
    return await prisma.booking.delete({
      where: { id }
    });
  }
};
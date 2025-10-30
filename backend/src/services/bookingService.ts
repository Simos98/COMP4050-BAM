import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export const bookingService = {
  async findAll() {
    return prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
    })
  },

  // prefer userId scalar lookup
  async findByUserId(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  // create using userId (preferred). Accepts either userId or userEmail fallback.
  async create(data: {
    userId?: string
    userEmail?: string
    deviceId: string
    start: string
    end: string
    notes?: string
  }) {
    const notes = data.notes ?? null

    // 1) Preferred: create with scalar userId and deviceId fields (matches schema)
    if (data.userId) {
      return prisma.booking.create({
        data: {
          userId: data.userId,
          deviceId: data.deviceId,
          start: new Date(data.start),
          end: new Date(data.end),
          notes,
        } as any,
      })
    }

    // 2) Fallback: attempt to resolve userId from email if provided
    if (data.userEmail) {
      const user = await prisma.user.findUnique({ where: { email: data.userEmail.toLowerCase() } })
      if (user) {
        return prisma.booking.create({
          data: {
            userId: user.id,
            deviceId: data.deviceId,
            start: new Date(data.start),
            end: new Date(data.end),
            notes,
          } as any,
        })
      }
    }

    // 3) Last resort: create without userId (may violate constraints) — allow caller to detect
    return prisma.booking.create({
      data: {
        userId: data.userId ?? '', // keep type but may fail if DB requires non-empty
        deviceId: data.deviceId,
        start: new Date(data.start),
        end: new Date(data.end),
        notes,
      } as any,
    })
  },

  // Keep update/delete working for scalar schema
  async updateStatus(id: string, status: BookingStatus) {
    // If schema has no status column this call will fail — ensure your schema has status if you use this
    return prisma.booking.update({
      where: { id },
      data: { status } as any,
    })
  },

  async deleteById(id: string) {
    return prisma.booking.delete({ where: { id } })
  },
}

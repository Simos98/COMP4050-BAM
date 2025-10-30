import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export const bookingService = {
  async findAll() {
    return prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.booking.findUnique({ where: { id } })
  },

  async findByUserId(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async create(data: {
    userId?: string
    userEmail?: string
    deviceId: string
    start: string
    end: string
    notes?: string
  }) {
    const notes = data.notes ?? null
    const startDate = new Date(data.start)
    const endDate = new Date(data.end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      const e: any = new Error('Invalid start or end date')
      e.status = 400
      throw e
    }

    if (startDate >= endDate) {
      const e: any = new Error('Start must be before end')
      e.status = 400
      throw e
    }

    // overlap check (ignore any cancelled/rejected only if your schema has status - using schema with status)
    const overlapWhere: any = {
      deviceId: data.deviceId,
      AND: [
        { start: { lt: endDate } }, // existing.start < newEnd
        { end: { gt: startDate } }, // existing.end > newStart
      ],
    }
    // If you want to ignore specific statuses (e.g. REJECTED/CANCELLED), ensure schema has status and uncomment:
    // overlapWhere.NOT = { status: { in: ['REJECTED', 'CANCELLED'] } }

    const conflict = await prisma.booking.findFirst({ where: overlapWhere })

    if (conflict) {
      const err: any = new Error('Device already booked for the selected time range')
      err.status = 409
      err.conflict = { bookingId: conflict.id, start: conflict.start, end: conflict.end }
      throw err
    }

    // create booking record - use enum values from Prisma (uppercase)
    let created: any = null

    if (data.userId) {
      created = await prisma.booking.create({
        data: {
          userId: data.userId,
          deviceId: data.deviceId,
          start: startDate,
          end: endDate,
          notes,
        } as any,
      })
    } else if (data.userEmail) {
      const user = await prisma.user.findUnique({ where: { email: data.userEmail.toLowerCase() } })
      if (user) {
        created = await prisma.booking.create({
          data: {
            userId: user.id,
            deviceId: data.deviceId,
            start: startDate,
            end: endDate,
            notes,
          } as any,
        })
      }
    }

    if (!created) {
      created = await prisma.booking.create({
        data: {
          userId: data.userId ?? '',
          deviceId: data.deviceId,
          start: startDate,
          end: endDate,
          notes,
        } as any,
      })
    }

    // attach studentId/email for convenience (non-persistent)
    if (created?.userId) {
      const u = await prisma.user.findUnique({ where: { id: created.userId }, select: { studentId: true, email: true } })
      ;(created as any).studentId = u?.studentId ?? u?.email ?? ''
    } else {
      ;(created as any).studentId = (created as any).studentId ?? ''
    }
    ;(created as any).status = (created as any).status ?? 'PENDING'
    return created
  },

  async updateStatus(id: string, status: string) {
    if (!status) {
      const e: any = new Error('status required')
      e.status = 400
      throw e
    }
    const s = String(status).toUpperCase()
    // validate
    const allowed = Object.keys(status) // enum keys
    if (!allowed.includes(s)) {
      const e: any = new Error('invalid status')
      e.status = 400
      throw e
    }
    return prisma.booking.update({
      where: { id },
      data: { status: s } as any,
    })
  },

  async deleteById(id: string) {
    return prisma.booking.delete({ where: { id } })
  },
}

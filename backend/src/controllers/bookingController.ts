import { Request, Response } from 'express'
import { bookingService } from '../services/bookingService'
import { sendSuccess, sendError } from '../utils/apiResponses'

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    let bookings
    if (user && (user.role ?? '').toString().toUpperCase() === 'ADMIN') {
      bookings = await bookingService.findAll()
    } else if (user) {
      // use user.id (userId) to fetch bookings
      bookings = await bookingService.findByUserId(user.id)
    } else {
      return sendError(res, 'Not authenticated', 401)
    }
    sendSuccess(res, { bookings })
  } catch (err) {
    console.error('getAllBookings error', err)
    sendError(res, 'Could not fetch bookings', 500)
  }
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user
    const { userId, deviceId, start, end, notes, userEmail } = req.body

    // determine owner: if request supplies userId and caller is admin allow it, otherwise use authenticated user id
    let ownerId = userId ?? authUser?.id

    // if userEmail provided and no ownerId, try to resolve
    if (!ownerId && userEmail) {
      const u = await (req as any).prisma?.user?.findUnique?.({ where: { email: userEmail.toLowerCase() } })
      ownerId = u?.id
    }

    if (!ownerId || !deviceId || !start || !end) {
      return sendError(res, 'userId (or authenticated session), deviceId, start and end are required', 400)
    }

    const created = await bookingService.create({
      userId: ownerId,
      deviceId,
      start,
      end,
      notes,
    })

    sendSuccess(res, { booking: created }, 'Booking created')
  } catch (err) {
    console.error('createBooking error', err)
    sendError(res, 'Could not create booking', 500)
  }
}

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!status) return sendError(res, 'status required', 400)
    const updated = await bookingService.updateStatus(id, status)
    sendSuccess(res, { booking: updated }, 'Booking status updated')
  } catch (err) {
    console.error('updateBookingStatus error', err)
    sendError(res, 'Could not update booking status', 500)
  }
}

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await bookingService.deleteById(id)
    res.status(204).send()
  } catch (err) {
    console.error('deleteBooking error', err)
    sendError(res, 'Could not delete booking', 500)
  }
}

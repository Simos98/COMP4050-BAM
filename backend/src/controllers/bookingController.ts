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
    // accept { userId } OR { userEmail } OR { user } (email string)
    const { userId, user: userField, userEmail, deviceId, start, end, notes, status } = req.body
    const ownerEmail = (userEmail ?? userField) ? String(userEmail ?? userField).toLowerCase() : undefined
    const ownerId = userId ?? authUser?.id

    if (!ownerId && !ownerEmail) {
      return sendError(res, 'userId (or authenticated session) or userEmail is required', 400)
    }
    if (!deviceId || !start || !end) {
      return sendError(res, 'deviceId, start and end are required', 400)
    }

    // Validate start/end are valid dates and not in the past
    const startDate = new Date(start)
    const endDate = new Date(end)
    const now = new Date()
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return sendError(res, 'Invalid start or end date', 400)
    }
    if (startDate <= now) {
      return sendError(res, 'Start time must be in the future', 400)
    }
    if (endDate <= now) {
      return sendError(res, 'End time must be in the future', 400)
    }
    if (startDate >= endDate) {
      return sendError(res, 'Start must be before end', 400)
    }

    const created = await bookingService.create({
      userId: ownerId,
      userEmail: ownerEmail,
      deviceId,
      start,
      end,
      notes,
    })

    sendSuccess(res, { booking: created }, 'Booking created')
  } catch (err: any) {
    console.error('createBooking error', err)
    // surface conflict as 409
    if (err?.status === 409) {
      return sendError(res, err.message || 'Booking time conflict', 409)
    }
    if (err?.status === 400) {
      return sendError(res, err.message || 'Invalid request', 400)
    }
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

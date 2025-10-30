import { Request, Response, NextFunction } from 'express'
import { bookingService } from '../services/bookingService'

export const authorizeBookingOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user
  if (!user) {
    res.status(401).json({ success: false, message: 'Not authenticated' })
    return
  }

  const { id } = req.params
  try {
    const booking = await bookingService.findById(id)
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' })
      return
    }

    // compare scalar userId from booking to authenticated user's id
    const bookingOwnerId = String((booking as any).userId ?? '')
    const userId = String(user.id ?? '')

    const role = String(user.role ?? '').toUpperCase()
    if (role === 'ADMIN' || bookingOwnerId === userId) {
      next()
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' })
    }
  } catch (err) {
    next(err)
  }
}
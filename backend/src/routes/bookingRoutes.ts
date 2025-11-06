import { Router } from 'express'
import { getAllBookings, createBooking, updateBookingStatus, deleteBooking, getBookingById } from '../controllers/bookingController'
import { authenticate } from '../middleware/authMiddleware'
import { authorizeBookingOwner } from '../middleware/authorizeBookingOwner'
import { authorizeAdmin } from '../middleware/authorizeAdmin'
import { get } from 'http'

const router = Router()

router.get('/', authenticate, getAllBookings)
router.post('/', authenticate, createBooking)
// status update restricted to admin
router.put('/:id/status', authenticate, authorizeAdmin, updateBookingStatus)
// delete: owner or admin
router.delete('/:id', authenticate, authorizeBookingOwner, deleteBooking)
router.get('/:id', getBookingById)

export default router

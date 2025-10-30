import { Router } from 'express';
import { authenticate } from '@middleware/authMiddleware';
import {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} from '@controllers/bookingController';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// GET /api/bookings - Get all bookings
router.get('/', getAllBookings);

// GET /api/bookings/:id - Get single booking
router.get('/:id', getBooking);

// POST /api/bookings - Create booking
router.post('/', createBooking);

// PATCH /api/bookings/:id - Update booking
router.patch('/:id', updateBooking);

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', deleteBooking);

export default router;
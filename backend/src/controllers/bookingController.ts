import { Request, Response } from 'express';
import { sendSuccess, sendError } from '@utils/apiResponses';
import { bookingService } from '@services/bookingService';
import { AuthRequest } from '@middleware/authMiddleware';

//GET /api/bookings - Get all bookings
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, deviceId } = req.query;
    
    const bookings = await bookingService.getAllBookings({
      userId: userId as string,
      deviceId: deviceId as string
    });

    sendSuccess(res, { items: bookings, total: bookings.length }, 'Bookings retrieved');
  } catch (error) {
    console.error('Get bookings error:', error);
    sendError(res, 'Failed to retrieve bookings', 500);
  }
};

//GET /api/bookings/:id - Get a single booking
export const getBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    sendSuccess(res, { booking }, 'Booking retrieved');
  } catch (error) {
    console.error('Get booking error:', error);
    sendError(res, 'Failed to retrieve booking', 500);
  }
};

//POST /api/bookings - Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, deviceId, start, end, notes } = req.body;

    if (!userId || !deviceId || !start || !end) {
      sendError(res, 'Missing required fields', 400);
      return;
    }

    const booking = await bookingService.createBooking({
      userId,
      deviceId,
      start: new Date(start),
      end: new Date(end),
      notes
    });

    sendSuccess(res, { booking }, 'Booking created', 201);
  } catch (error) {
    console.error('Create booking error:', error);
    sendError(res, 'Failed to create booking', 500);
  }
};

//PATCH /api/bookings/:id - Update a booking
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { start, end, notes } = req.body;

    const booking = await bookingService.updateBooking(id, {
      ...(start && { start: new Date(start) }),
      ...(end && { end: new Date(end) }),
      ...(notes !== undefined && { notes })
    });

    sendSuccess(res, { booking }, 'Booking updated');
  } catch (error: any) {
    console.error('Update booking error:', error);
    if (error.code === 'P2025') {
      sendError(res, 'Booking not found', 404);
    } else {
      sendError(res, 'Failed to update booking', 500);
    }
  }
};

//DELETE /api/bookings/:id - Delete a booking
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await bookingService.deleteBooking(id);

    sendSuccess(res, null, 'Booking deleted');
  } catch (error: any) {
    console.error('Delete booking error:', error);
    if (error.code === 'P2025') {
      sendError(res, 'Booking not found', 404);
    } else {
      sendError(res, 'Failed to delete booking', 500);
    }
  }
};
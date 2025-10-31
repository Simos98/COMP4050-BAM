import { Router } from 'express';
import healthRoutes from './healthRoutes';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import deviceRoutes from './deviceRoutes';
import bookingRoutes from './bookingRoutes';
import motorRoutes from './motorRoutes';

const router = Router();

// Mount different route groups
router.use('/', healthRoutes);
router.use('/api/users', userRoutes);
router.use('/api/devices', deviceRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/motor', motorRoutes);

export default router;

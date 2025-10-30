import { Router } from 'express';
import healthRoutes from './healthRoutes';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import deviceRoutes from './deviceRoutes';
import bookingRoutes from './bookingRoutes';

const router = Router();

// Health routes
router.use('/', healthRoutes);

// API routes
router.use('/', healthRoutes);
router.use('/api/users', userRoutes);
router.use('/api/devices', deviceRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/bookings', bookingRoutes);

export default router;

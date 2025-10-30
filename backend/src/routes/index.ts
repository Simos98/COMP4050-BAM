import { Router } from 'express';
import healthRoutes from './healthRoutes';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import bookingRoutes from './bookingRoutes';

const router = Router();

// Mount different route groups
router.use('/', healthRoutes);

// Future routes will go here:
// router.use('/api/users', userRoutes);
// router.use('/api/auth', authRoutes);

router.use('/', healthRoutes);
router.use('/api/users', userRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/bookings', bookingRoutes);

export default router;

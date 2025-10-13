import { Router } from 'express';
import healthRoutes from './healthRoutes';

const router = Router();

// Mount different route groups
router.use('/', healthRoutes);

// Future routes will go here:
// router.use('/api/users', userRoutes);
// router.use('/api/auth', authRoutes);

export default router;

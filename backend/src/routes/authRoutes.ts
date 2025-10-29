import { Router } from 'express';
import { login, register, getCurrentUser, logout } from '@controllers/authController';
import { authenticate } from '@middleware/authMiddleware';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (optional)
router.post('/register', register);

// GET /api/auth/me (requires auth middleware)
router.get('/me', authenticate, getCurrentUser);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
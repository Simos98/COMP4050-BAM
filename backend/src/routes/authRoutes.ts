import { Router } from 'express';
import { login, register, getCurrentUser } from '@controllers/authController';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register (optional)
router.post('/register', register);

// GET /api/auth/me (requires auth middleware - add later)
router.get('/me', getCurrentUser);

export default router;
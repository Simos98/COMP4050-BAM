import { Router } from 'express';
import { getHealth, getRoot } from '@controllers/healthController';

const router = Router();

// GET / - Root endpoint
router.get('/', getRoot);
router.get('/health', getHealth);

export default router;

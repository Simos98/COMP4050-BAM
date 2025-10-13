import { Router } from 'express';
import { getHealth, getRoot } from '@controllers/healthController';

const router = Router();

// Define routes and connect them to controllers
router.get('/', getRoot);
router.get('/health', getHealth);

export default router;

import { Router } from 'express';
import { MotorController } from '../controllers/motorController';

const router = Router();

/**
 * Motor Control Routes
 * All routes are prefixed with /api/motor
 */

// Individual command endpoints
router.post('/move-x', MotorController.moveX);
router.post('/move-y', MotorController.moveY);
router.post('/zoom-in', MotorController.zoomIn);
router.post('/zoom-out', MotorController.zoomOut);

// Generic command endpoint (optional - accepts any valid command)
router.post('/command', MotorController.sendCommand);

export default router;

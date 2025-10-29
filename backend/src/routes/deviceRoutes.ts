import { Router } from 'express';
import {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
} from '../controllers/deviceController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeAdmin } from '../middleware/authorizeAdmin';

const router = Router();

// public list of devices
router.get('/', getAllDevices);
router.get('/:id', getDeviceById);

// admin protected actions
router.post('/', authenticate, authorizeAdmin, createDevice);
router.put('/:id', authenticate, authorizeAdmin, updateDevice);
router.delete('/:id', authenticate, authorizeAdmin, deleteDevice);

export default router;
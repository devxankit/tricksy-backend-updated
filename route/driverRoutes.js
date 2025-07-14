import express from 'express';
import { driverLogin, getDriverProfile } from '../controller/drivercontroller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', driverLogin);

// Protected routes (driver only)
router.get('/profile', authMiddleware(['driver']), getDriverProfile);

export default router; 
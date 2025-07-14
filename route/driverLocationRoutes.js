import express from 'express';
import * as driverLocationController from '../controller/driverLocationController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Driver routes
router.post('/update', authMiddleware(['driver']), driverLocationController.updateDriverLocation);
router.post('/offline', authMiddleware(['driver']), driverLocationController.setDriverOffline);

// Admin routes
router.get('/all', authMiddleware(['admin']), driverLocationController.getAllDriverLocations);
router.get('/driver/:driverId', authMiddleware(['admin']), driverLocationController.getDriverLocation);

export default router; 
import express from 'express';
import * as attendanceController from '../controller/attendanceController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// User and Driver routes (require user or driver authentication)
router.post('/mark', authMiddleware(['user', 'driver']), attendanceController.markAttendance);
router.post('/checkout', authMiddleware(['user', 'driver']), attendanceController.checkOut);
router.get('/user', authMiddleware(['user', 'driver']), attendanceController.getUserAttendance);

// Admin routes (require admin authentication)
router.get('/admin/all', authMiddleware(['admin']), attendanceController.getAllAttendance);
router.put('/admin/:attendanceId', authMiddleware(['admin']), attendanceController.updateAttendanceStatus);
router.get('/admin/stats', authMiddleware(['admin']), attendanceController.getAttendanceStats);

export default router; 
import express from 'express';
import * as driverAssignmentController from '../controller/driverAssignmentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Driver assignment routes are working' });
});

// Admin routes
router.post('/assign', authMiddleware(['admin']), driverAssignmentController.assignDriverToUsers);
router.get('/all', authMiddleware(['admin']), driverAssignmentController.getAllDriverAssignments);
router.patch('/:assignmentId/status', authMiddleware(['admin']), driverAssignmentController.updateAssignmentStatus);
router.delete('/:assignmentId', authMiddleware(['admin']), driverAssignmentController.deleteAssignment);

// Driver routes
router.get('/driver/:driverId', authMiddleware(['driver']), driverAssignmentController.getDriverAssignments);
router.patch('/:assignmentId/user-status', authMiddleware(['driver']), driverAssignmentController.updateUserStatus);

// User routes
router.get('/user', authMiddleware(['user']), driverAssignmentController.getUserAssignment);
router.get('/user/driver-location', authMiddleware(['user']), driverAssignmentController.getUserAssignedDriverLocation);

export default router; 
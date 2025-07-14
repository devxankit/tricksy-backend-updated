import express from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeavesByStatus } from '../controller/leaveController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Driver or User applies for leave
router.post('/apply', auth(['driver', 'user']), applyLeave);

// Driver or User views their own leaves
router.get('/my', auth(['driver', 'user']), getMyLeaves);

// Admin and User views all leaves
router.get('/', auth(['admin', 'user']), getAllLeaves);

// Admin updates leave status
router.patch('/:id/status', auth(['admin']), updateLeaveStatus);

// Get leaves by status (admin, driver, or user)
router.get('/status/:status', auth(['admin', 'driver', 'user']), getLeavesByStatus);

export default router; 
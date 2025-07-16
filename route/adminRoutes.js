import express from 'express';
import { adminLogin, getAllAdmins, getTotalUsers, getTotalDrivers, getTodaysAttendance } from '../controller/admincontroller.js';
import { registerUser, getAllUsers, deleteUser } from '../controller/usercontroller.js';
import { registerDriver, getAllDrivers, deleteDriver } from '../controller/drivercontroller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes (admin only)
router.get('/profile', authMiddleware(['admin']), (req, res) => {
    res.json({ message: 'Admin profile accessed', user: req.user });
});

router.get('/all-admins', authMiddleware(['admin']), getAllAdmins);

// Add new endpoints for real-time stats
router.get('/total-users', authMiddleware(['admin']), getTotalUsers);
router.get('/total-drivers', authMiddleware(['admin']), getTotalDrivers);
router.get('/todays-attendance', authMiddleware(['admin']), getTodaysAttendance);

// Admin can register users and drivers
router.post('/register-user', authMiddleware(['admin']), registerUser);
router.post('/register-driver', authMiddleware(['admin']), registerDriver);

// Admin can view all users and drivers
router.get('/all-users', authMiddleware(['admin']), getAllUsers);
router.get('/all-drivers', authMiddleware(['admin']), getAllDrivers);

// Admin can delete users and drivers
router.delete('/user/:userId', authMiddleware(['admin']), deleteUser);
router.delete('/driver/:driverId', authMiddleware(['admin']), deleteDriver);

export default router; 
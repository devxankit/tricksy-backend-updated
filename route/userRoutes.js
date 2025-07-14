import express from 'express';
import { userLogin, getUserProfile, updateUserProfile } from '../controller/usercontroller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', userLogin);

// Protected routes (user only)
router.get('/profile', authMiddleware(['user']), getUserProfile);
router.patch('/profile', authMiddleware(['user']), updateUserProfile);

export default router; 
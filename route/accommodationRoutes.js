import express from 'express';
import * as accommodationController from '../controller/accommodationController.js';
import authMiddleware from '../middleware/auth.js';

// Use local storage for now (Cloudinary can be added later)
import upload from '../middleware/upload.js';

const router = express.Router();

// User routes (require user authentication)
router.post('/create', authMiddleware(['user']), upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 }
]), accommodationController.createAccommodation);
router.get('/user', authMiddleware(['user']), accommodationController.getUserAccommodations);
router.get('/:accommodationId', authMiddleware(['user', 'admin']), accommodationController.getAccommodationById);

// Admin routes (require admin authentication)
router.get('/admin/all', authMiddleware(['admin']), accommodationController.getAllAccommodations);
router.put('/admin/:accommodationId', authMiddleware(['admin']), accommodationController.updateAccommodation);
router.delete('/admin/:accommodationId', authMiddleware(['admin']), accommodationController.deleteAccommodation);

export default router; 
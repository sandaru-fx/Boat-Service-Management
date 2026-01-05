import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { forgotPassword, resetPassword, changePassword, testEmail } from '../controllers/authController.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.put('/change-password', authMiddleware, changePassword);

// Admin only routes
router.get('/test-email', authMiddleware, testEmail);

export default router;

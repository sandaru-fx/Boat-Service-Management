import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);

export default router;

import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  createBoatRide,
  getMyBookings,
  getAllBookings,
  getBoatRideById,
  updateBoatRide,
  cancelBoatRide,
  assignBoatRide,
  updateBookingStatus,
  processRefund,
  handleCalendlyWebhook,
  getRideByBookingId,
  getPricing,
  getBoatRideStats
} from '../controllers/boatRideController.js';

const router = express.Router();

// Customer routes (auth required)
router.post('/', protect, createBoatRide);
router.get('/my-bookings', protect, getMyBookings);
router.get('/booking/:bookingId', protect, getRideByBookingId);
router.post('/pricing', protect, getPricing);

// Employee/Admin routes (auth + role required)
router.get('/all', protect, restrictTo('employee', 'admin'), getAllBookings);
router.get('/stats', protect, restrictTo('employee', 'admin'), getBoatRideStats);

// ID-based routes (must come after specific routes)
router.get('/:id', protect, getBoatRideById);
router.put('/:id', protect, updateBoatRide);
router.put('/:id/cancel', protect, cancelBoatRide);
router.put('/:id/assign', protect, restrictTo('employee', 'admin'), assignBoatRide);
router.put('/:id/status', protect, restrictTo('employee', 'admin'), updateBookingStatus);
router.put('/:id/refund', protect, restrictTo('employee', 'admin'), processRefund);

// Calendly webhook (no auth required - Calendly calls this)
router.post('/webhook', handleCalendlyWebhook);

export default router;

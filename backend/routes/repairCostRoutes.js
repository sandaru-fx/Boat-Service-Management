import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getCostOptions,
  sendInvoice,
  processFinalPayment,
  getRepairCostBreakdown,
  testEndpoint
} from '../controllers/repairCostController.js';

const router = express.Router();

// Test endpoint
router.get('/test', testEndpoint);

// Get cost options for repair type
router.get('/cost-options/:serviceType', authMiddleware, getCostOptions);

// Send invoice to customer
router.post('/:repairId/send-invoice', authMiddleware, sendInvoice);

// Process final payment
router.post('/:repairId/final-payment', authMiddleware, processFinalPayment);

// Get repair cost breakdown
router.get('/:repairId/cost-breakdown', authMiddleware, getRepairCostBreakdown);

export default router;

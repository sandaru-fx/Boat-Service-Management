import express from 'express';
import { generateFinancialAnalyticsReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate Financial Analytics PDF Report
router.post('/financial-analytics', protect, generateFinancialAnalyticsReport);

export default router;

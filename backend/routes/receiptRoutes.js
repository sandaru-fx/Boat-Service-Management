import express from 'express';
import { generateOrderReceipt } from '../controllers/receiptController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate order receipt PDF (guest checkout allowed)
router.get('/order/:orderId', generateOrderReceipt);

export default router;

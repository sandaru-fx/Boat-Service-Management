import express from 'express';
import { sendOrderConfirmationEmail } from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Send order confirmation email
router.post('/order/:orderId/confirmation', protect, sendOrderConfirmationEmail);

export default router;

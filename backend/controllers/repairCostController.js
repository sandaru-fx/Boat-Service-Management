import RepairCostList from '../models/repairCostListModel.js';
import BoatRepair from '../models/boatRepairModel.js';
import RepairNotification from '../models/repairNotificationModel.js';
import Payment from '../models/Payment.js';

// Test endpoint to debug
export const testEndpoint = async (req, res) => {
  try {
    console.log('Test endpoint called');
    res.json({ success: true, message: 'Test endpoint working' });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cost options for repair type
export const getCostOptions = async (req, res) => {
  try {
    const { serviceType } = req.params;

    const costOptions = await RepairCostList.find({ serviceType });

    res.json({
      success: true,
      data: costOptions
    });
  } catch (error) {
    console.error('Error getting cost options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cost options'
    });
  }
};

// Send invoice to customer
export const sendInvoice = async (req, res) => {
  try {
    const { repairId } = req.params;
    const { finalCost } = req.body;

    const repair = await BoatRepair.findById(repairId).populate('customer');
    
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    // Update repair with final cost
    repair.finalCost = finalCost;
    repair.cost = finalCost; // Keep cost field updated for compatibility
    
    await repair.save();

    // Create notification for customer
    await RepairNotification.create({
      userId: repair.customer._id,
      type: 'repair_invoice',
      title: 'Repair Invoice Ready',
      message: `Your repair ${repair.bookingId} is complete. Final cost: ${finalCost} LKR`,
      repairId: repair.bookingId
    });

    // Calculate remaining amount (assuming advance payment was already made)
    const advancePayment = repair.payment?.amount || 0;
    const remainingAmount = Math.max(0, finalCost - advancePayment);

    res.json({
      success: true,
      message: 'Invoice sent to customer successfully',
      data: {
        repairId: repair.bookingId,
        finalCost,
        remainingAmount
      }
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice'
    });
  }
};

// Process final payment
export const processFinalPayment = async (req, res) => {
  try {
    console.log('Processing final payment for repair:', req.params.repairId);
    console.log('Payment data:', req.body);
    
    const { repairId } = req.params;
    const { paymentIntentId, stripePaymentIntentId, amount } = req.body;
    
    // Use either paymentIntentId or stripePaymentIntentId
    const finalPaymentIntentId = stripePaymentIntentId || paymentIntentId;

    const repair = await BoatRepair.findOne({ bookingId: repairId }).populate('customer', 'name email');
    
    if (!repair) {
      console.log('Repair not found for bookingId:', repairId);
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    console.log('Found repair:', repair.bookingId);
    console.log('Repair cost:', repair.cost);
    console.log('Payment status:', repair.payment?.status || 'pending');

    // Allow payment if repair is completed and not already fully paid
    if (repair.status !== 'completed') {
      console.log('Repair not completed, status:', repair.status);
      return res.status(400).json({
        success: false,
        message: 'Repair must be completed before final payment'
      });
    }

    if (repair.finalPayment?.status === 'paid') {
      console.log('Final payment already completed');
      return res.status(400).json({
        success: false,
        message: 'Final payment already completed for this repair'
      });
    }

    // Update existing payment record instead of creating new one
    console.log('Updating payment record...');
    const existingPayment = await Payment.findOne({ stripePaymentIntentId: finalPaymentIntentId });
    
    if (existingPayment) {
      existingPayment.status = 'succeeded';
      existingPayment.paidAt = new Date();
      existingPayment.serviceDescription = `${repair.serviceType} - Final Payment`;
      await existingPayment.save();
      console.log('Payment record updated:', existingPayment.paymentId);
    } else {
      console.log('No existing payment found, creating new one...');
      const payment = new Payment({
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        stripePaymentIntentId: finalPaymentIntentId,
        customerId: repair.customer,
        customerEmail: repair.customer.email || 'customer@example.com',
        customerName: repair.customer.name || 'Customer Name',
        amount: amount || repair.cost,
        currency: 'lkr',
        amountInCents: (amount || repair.cost) * 100,
        status: 'succeeded',
        serviceType: 'boat_repair',
        serviceId: repair.bookingId,
        serviceDescription: `${repair.serviceType} - Final Payment`,
        paidAt: new Date(),
        paymentMethod: 'card'
      });
      await payment.save();
      console.log('Payment record created:', payment.paymentId);
    }

    // Update repair final payment status
    console.log('Updating repair final payment status...');
    repair.finalPayment = {
      status: 'paid',
      paidAt: new Date(),
      amount: amount || repair.cost,
      stripePaymentIntentId: finalPaymentIntentId
    };
    await repair.save();
    console.log('Repair status updated');

    // Create payment received notification
    try {
      console.log('Creating notification...');
      await RepairNotification.create({
        userId: repair.customer,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Your payment of ${repair.cost} LKR has been received for repair ${repair.bookingId}`,
        repairId: repair.bookingId
      });
      console.log('Notification created');
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the payment if notification fails
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: existingPayment?.paymentId || payment?.paymentId,
        amount: repair.cost
      }
    });
  } catch (error) {
    console.error('Error processing final payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Get repair cost breakdown
export const getRepairCostBreakdown = async (req, res) => {
  try {
    const { repairId } = req.params;

    const repair = await BoatRepair.findOne({ bookingId: repairId });
    
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    res.json({
      success: true,
      data: {
        repairId: repair.bookingId,
        cost: repair.cost,
        paymentStatus: repair.payment?.status || 'pending',
        serviceType: repair.serviceType,
        problemDescription: repair.problemDescription,
        status: repair.status
      }
    });
  } catch (error) {
    console.error('Error getting repair cost breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get repair cost breakdown'
    });
  }
};

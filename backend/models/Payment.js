import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment identification
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'lkr'
  },
  amountInCents: {
    type: Number,
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
    default: 'pending'
  },
  
  // Service information
  serviceType: {
    type: String,
    enum: ['boat_ride', 'boat_repair', 'spare_parts', 'boat_sales', 'maintenance', 'ride_booking', 'other'],
    required: true
  },
  serviceId: {
    type: String,
    required: true
  },
  serviceDescription: {
    type: String,
    required: true
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'other'],
    default: 'card'
  },
  
  // Stripe specific data
  stripeCustomerId: {
    type: String
  },
  stripePaymentMethodId: {
    type: String
  },
  stripeChargeId: {
    type: String
  },
  
  // Receipt and invoice
  receiptUrl: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Timestamps
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  
  // Additional information
  notes: {
    type: String
  },
  internalNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ customerId: 1, createdAt: -1 });
paymentSchema.index({ serviceType: 1, serviceId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ paymentId: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.amount.toLocaleString()} ${this.currency.toUpperCase()}`;
});

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'succeeded': 'Completed',
    'failed': 'Failed',
    'canceled': 'Canceled',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'succeeded';
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function() {
  return this.status === 'succeeded' && !this.refundedAt;
};

// Method to get remaining refundable amount
paymentSchema.methods.getRemainingRefundAmount = function() {
  if (!this.canBeRefunded()) return 0;
  return this.amount - (this.refundAmount || 0);
};

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    successfulAmount: 0,
    failedPayments: 0,
    pendingPayments: 0
  };
};

// Static method to get payments by service type
paymentSchema.statics.getPaymentsByServiceType = async function(serviceType, limit = 10) {
  return this.find({ serviceType })
    .populate('customerId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default mongoose.model('Payment', paymentSchema);

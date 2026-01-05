import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  
  // Order items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    partNumber: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Order totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment information
  paymentId: {
    type: String,
    ref: 'Payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Shipping information
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    postalCode: {
      type: String
    },
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  
  // Delivery information
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'delivery'
  },
  estimatedDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String
  },
  
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Notes
  customerNotes: {
    type: String
  },
  internalNotes: {
    type: String
  },
  
  // Status history
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Pre-save middleware to generate order ID
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Indexes for better query performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ customerId: 1, orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ];
  
  const stats = await this.aggregate(pipeline);
  return stats.length > 0 ? stats[0] : { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
};

const Order = mongoose.model('Order', orderSchema);

export default Order;

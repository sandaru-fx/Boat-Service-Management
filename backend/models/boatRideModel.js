import mongoose from 'mongoose';

// Boat Ride Schema - defines how boat ride bookings are stored
const boatRideSchema = new mongoose.Schema({
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid Sri Lankan phone number']
  },

  // Booking Details
  rideDate: {
    type: Date,
    required: [true, 'Ride date is required'],
    validate: {
      validator: function(date) {
        // Must be future date
        return date > new Date();
      },
      message: 'Ride date must be in the future'
    }
  },
  rideTime: {
    type: String,
    required: [true, 'Ride time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'],
    max: [12, 'Duration cannot exceed 12 hours']
  },
  passengers: {
    type: Number,
    required: [true, 'Number of passengers is required'],
    min: [1, 'Must have at least 1 passenger'],
    max: [50, 'Cannot exceed 50 passengers']
  },

  // Boat & Journey Information
  boatType: {
    type: String,
    required: [true, 'Boat type is required'],
    enum: {
      values: ['Speedboat', 'Yacht', 'Catamaran', 'Fishing Boat', 'Dinghy', 'Jet Ski'],
      message: 'Invalid boat type'
    }
  },
  journeyType: {
    type: String,
    required: [true, 'Journey type is required'],
    enum: {
      values: [
        'Sunset Tour',
        'Adventure Tour', 
        'Island Hopping',
        'Snorkeling Adventure',
        'Deep Sea Fishing',
        'Romantic Cruise',
        'Family Tour',
        'Corporate Event',
        'Birthday Party',
        'Wedding Proposal'
      ],
      message: 'Invalid journey type'
    }
  },

  // Pricing Information
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  passengerPrice: {
    type: Number,
    required: [true, 'Passenger price is required'],
    min: [0, 'Passenger price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },

  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'manual', 'cash'],
    default: 'manual'
  },
  paymentId: {
    type: String,
    trim: true
  },

  // Calendly Integration
  calendlyEventId: {
    type: String,
    trim: true
  },
  calendlyEventUri: {
    type: String,
    trim: true
  },
  calendlyScheduledAt: {
    type: Date
  },
  calendlyInviteeUri: {
    type: String,
    trim: true
  },
  calendlyStatus: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  calendlyCancelReason: {
    type: String,
    trim: true
  },

  // Status & Assignment
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedBoat: {
    type: String,
    trim: true
  },
  assignedCaptain: {
    type: String,
    trim: true
  },

  // Additional Information
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters'],
    trim: true
  },
  emergencyContact: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid Sri Lankan phone number'],
    trim: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Pre-save middleware to calculate total price
boatRideSchema.pre('save', function(next) {
  if (this.isModified('passengers') || this.isModified('basePrice') || this.isModified('passengerPrice')) {
    this.totalPrice = this.basePrice + (this.passengers * this.passengerPrice);
  }
  next();
});

// Pre-save middleware to update updatedAt
boatRideSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if booking can be cancelled (3+ days before ride)
boatRideSchema.methods.canBeCancelled = function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  return this.rideDate > threeDaysFromNow;
};

// Method to calculate refund amount
boatRideSchema.methods.calculateRefund = function() {
  if (this.canBeCancelled()) {
    return this.totalPrice; // Full refund if 3+ days before
  }
  return this.totalPrice * 0.5; // 50% refund if less than 3 days
};

// Method to check if booking is active
boatRideSchema.methods.isActive = function() {
  return this.status !== 'cancelled' && this.status !== 'completed';
};

// Static method to find bookings by date range
boatRideSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    rideDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to find bookings by customer
boatRideSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customerId }).sort({ createdAt: -1 });
};

// Static method to find bookings by status
boatRideSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ rideDate: 1 });
};

// Index for better query performance
boatRideSchema.index({ customerId: 1, createdAt: -1 });
boatRideSchema.index({ rideDate: 1, rideTime: 1 });
boatRideSchema.index({ status: 1 });
boatRideSchema.index({ calendlyEventId: 1 });

// Create and export the BoatRide model
const BoatRide = mongoose.model('BoatRide', boatRideSchema);

export default BoatRide;

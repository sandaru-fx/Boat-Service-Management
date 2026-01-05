import mongoose from 'mongoose';

const boatRepairSchema = new mongoose.Schema({
  // Customer reference (not duplicated data)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },

  // Service Information
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'engine_repair', 'hull_repair', 'electrical_repair',
      'propeller_repair', 'maintenance', 'inspection', 'other'
    ]
  },

  problemDescription: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  serviceDescription: {
    type: String,
    maxlength: [500, 'Service description cannot exceed 500 characters']
  },

  // Boat Details
  boatDetails: {
    boatType: {
      type: String,
      required: [true, 'Boat type is required'],
      enum: ['speedboat', 'yacht', 'fishing_boat', 'sailboat', 'jet_ski', 'other']
    },
    boatMake: {
      type: String,
      required: [true, 'Boat make is required'],
      trim: true
    },
    boatModel: {
      type: String,
      required: [true, 'Boat model is required'],
      trim: true
    },
    boatYear: {
      type: Number,
      required: [true, 'Boat year is required'],
      min: [1900, 'Invalid boat year'],
      max: [new Date().getFullYear() + 1, 'Invalid boat year']
    },
    engineType: {
      type: String,
      enum: ['inboard', 'outboard', 'jet_drive', 'electric', 'other']
    },
    engineModel: {
      type: String,
      trim: true
    },
    hullMaterial: {
      type: String,
      enum: ['fiberglass', 'aluminum', 'wood', 'steel', 'composite', 'other']
    }
  },

  // File Uploads
  photos: [{
    filename: String,
    originalName: String,
    cloudinaryUrl: String,
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Scheduling Information
  scheduledDateTime: {
    type: Date,
    required: [true, 'Scheduled date and time is required']
  },

  calendlyEventId: {
    type: String,
    trim: true
  },

  calendlyEventUri: {
    type: String,
    trim: true
  },

  // Service Location
  serviceLocation: {
    type: {
      type: String,
      enum: ['marina', 'customer_location', 'service_center'],
      default: 'service_center'
    },
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String
    },
    marinaName: String,
    dockNumber: String
  },

  // Customer Notes
  customerNotes: {
    type: String,
    maxlength: [500, 'Customer notes cannot exceed 500 characters']
  },

  // Booking Reference
  bookingId: {
    type: String,
    unique: true
  },

  // Status Management
  status: {
    type: String,
    enum: [
      'pending', 'assigned', 'confirmed', 'in_progress', 'waiting_parts',
      'completed', 'cancelled', 'rescheduled'
    ],
    default: 'pending'
  },

  // Assignment
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  assignedAt: {
    type: Date
  },

  // Boat Handover
  boatReceivedAt: {
    type: Date
  },

  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Status History
  statusUpdates: [{
    status: {
      type: String,
      enum: ['pending', 'assigned', 'confirmed', 'in_progress', 'waiting_parts', 'completed', 'cancelled', 'rescheduled']
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // Cost Information
  estimatedCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },

  finalCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },

  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paymentMethod: String,
    paidAt: Date,
    amount: Number
  },

  // Final Payment Information (for two-step payment)
  finalPayment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paymentMethod: String,
    paidAt: Date,
    amount: Number
  },

  // Repair cost (simplified)
  cost: {
    type: Number,
    required: true,
    default: 0
  },

  // Work Details
  workPerformed: String,
  partsUsed: [{
    partName: String,
    partNumber: String,
    quantity: Number,
    cost: Number
  }],

  laborHours: Number,
  laborRate: Number,

  // Completion
  completedAt: Date,

  // Customer Feedback
  customerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },

  // Warranty
  warranty: {
    duration: Number, // months
    startDate: Date,
    endDate: Date,
    terms: String
  },

  // Internal Notes
  internalNotes: String,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },

  followUpDate: Date,
  followUpNotes: String

}, {
  timestamps: true
});

// Indexes for better query performance
boatRepairSchema.index({ customer: 1, status: 1 });
boatRepairSchema.index({ assignedTechnician: 1, status: 1 });
boatRepairSchema.index({ scheduledDateTime: 1 });
boatRepairSchema.index({ status: 1 });
boatRepairSchema.index({ createdAt: -1 });
boatRepairSchema.index({ bookingId: 1 });

// Virtual for total cost calculation (simplified)
boatRepairSchema.virtual('totalCost').get(function() {
  return this.cost || 0;
});

// Method to update status
boatRepairSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  return this.save();
};

// Method to assign technician
boatRepairSchema.methods.assignTechnician = function(technicianId, assignedBy) {
  this.assignedTechnician = technicianId;
  this.assignedBy = assignedBy;
  this.assignedAt = new Date();
  this.status = 'confirmed';
  return this.save();
};

// Pre-save middleware to generate booking ID
boatRepairSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingId) {
    const timestamp = Date.now().toString().slice(-6);
    this.bookingId = `REP-${timestamp}`;
  }
  next();
});

// Pre-save middleware to update final cost
boatRepairSchema.pre('save', function(next) {
  if (this.isModified('partsUsed') || this.isModified('laborHours') || this.isModified('laborRate')) {
    this.finalCost = this.totalCost;
  }
  next();
});

const BoatRepair = mongoose.model('BoatRepair', boatRepairSchema);

export default BoatRepair;

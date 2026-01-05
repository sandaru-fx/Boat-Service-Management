import mongoose from "mongoose";

const boatBookingSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    customerPhone: {
      type: String,
      required: true,
    },
    
    // Booking Details
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoatPackage',
      required: true
    },
    packageName: {
      type: String,
      required: true,
    },
    numberOfPassengers: {
      type: Number,
      required: true,
    },
    passengerNames: {
      type: String,
      required: true,
    },
    
    // Scheduling
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    
    // Additional Services
    selectedCatering: {
      type: String,
      default: ''
    },
    specialRequests: {
      type: String,
      default: ''
    },
    
    // Pricing
    totalPrice: {
      type: Number,
      required: true,
    },
    
    // Employee Management
    employeeInfo: {
      status: { 
        type: String, 
        default: "Pending Review",
        enum: ['Pending Review', 'Confirmed', 'Cancelled', 'Completed', 'In Progress']
      },
      paymentConfirmed: { type: Boolean, default: false },
      employeeNotes: String,
      assignedEmployee: String,
      quotedPrice: Number,
      finalPrice: Number,
      priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
      },
      followUpDate: Date,
      lastContactDate: Date
    },
    
    // Content Analysis & Review
    contentAnalysis: {
      flagged: { type: Boolean, default: false },
      reasons: [String],
      riskLevel: { 
        type: String, 
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW'
      },
      requiresTermsReminder: { type: Boolean, default: false }
    },
    
    // Payment Information
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: String, // Stripe payment intent ID
    paymentAmount: Number,
    paidAt: Date,
    refundedAt: Date,
    refundReason: String,
    
    // Terms & Conditions Tracking
    termsSent: {
      type: Boolean,
      default: false
    },
    termsReason: {
      type: String,
      enum: ['standard_review', 'content_review', 'large_group', 'employee_request', 'employee_review']
    },
    termsSentAt: {
      type: Date
    },
    
    // Content Review Status
    contentReviewed: {
      type: Boolean,
      default: false
    },
    reviewAction: {
      type: String,
      enum: ['approved', 'rejected', 'modification_requested']
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: String
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Pre-save middleware to handle follow-up dates
boatBookingSchema.pre('save', function(next) {
  // Set follow-up date to 24 hours from creation
  if (!this.employeeInfo.followUpDate && this.isNew) {
    this.employeeInfo.followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

const BoatBooking = mongoose.model("BoatBooking", boatBookingSchema);

export default BoatBooking;

import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Customer Information
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  
  // Appointment Details
  serviceType: {
    type: String,
    required: true,
    enum: [
      'General Service',
      'Engine Repair',
      'Boat Cleaning',
      'Maintenance',
      'Emergency Service',
      'Inspection',
      'Boat Purchase Visit',
      'Other'
    ]
  },
  
  appointmentDate: {
    type: Date,
    required: true,
  },
  
  appointmentTime: {
    type: String,
    required: true,
    enum: [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ]
  },
  
  // Boat Information
  boatDetails: {
    boatName: {
      type: String,
      required: true,
    },
    boatType: {
      type: String,
      required: true,
    },
    boatLength: {
      type: String,
      required: false,
    },
    engineType: {
      type: String,
      required: false,
    }
  },
  
  // Service Details
  description: {
    type: String,
    required: true,
  },
  
  estimatedDuration: {
    type: Number, // in hours
    default: 2,
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    default: '',
  },
  
  // Pricing
  estimatedCost: {
    type: Number,
    default: 0,
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  
  // Reminder Settings
  reminderSent: {
    type: Boolean,
    default: false,
  },
  
  reminderDate: {
    type: Date,
    required: false,
  }
}, {
  timestamps: true, // createdAt, updatedAt
});

// Index for better query performance
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ customerEmail: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;















import mongoose from 'mongoose';

const repairNotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['repair_invoice', 'repair_completed', 'payment_received', 'repair_assigned'],
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  repairId: { 
    type: String 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for better performance
repairNotificationSchema.index({ userId: 1, createdAt: -1 });
repairNotificationSchema.index({ userId: 1, isRead: 1 });

const RepairNotification = mongoose.model('RepairNotification', repairNotificationSchema);

export default RepairNotification;

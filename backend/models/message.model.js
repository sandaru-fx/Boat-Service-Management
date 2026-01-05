import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin', 'bot'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  // WhatsApp-style message status tracking
  status: {
    sent: { type: Boolean, default: true },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
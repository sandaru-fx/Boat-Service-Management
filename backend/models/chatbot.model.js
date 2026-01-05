import mongoose from 'mongoose';

const chatbotSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['greeting', 'services', 'pricing', 'hours', 'contact', 'booking', 'technical', 'escalation'],
    default: 'general'
  },
  keywords: [{
    type: String
  }],
  priority: {
    type: Number,
    default: 1 // 1 = bot can handle, 2 = escalate to admin
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
chatbotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Chatbot = mongoose.model('Chatbot', chatbotSchema);

export default Chatbot;

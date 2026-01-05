import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  phoneNumbers: [{
    type: String,
    required: true,
  }],
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  operatingHours: {
    weekdays: {
      type: String,
      required: true,
    },
    saturday: {
      type: String,
      required: true,
    },
    sunday: {
      type: String,
      required: true,
    },
  },
  emergencyService: {
    available: {
      type: Boolean,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  whatsappNumber: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;















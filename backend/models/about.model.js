import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  // Company Information
  companyInfo: {
    title: { type: String, required: true, default: "About Marine Service Center" },
    subtitle: { type: String, default: "Your Trusted Marine Partner" },
    description: { type: String, required: true },
    mission: { type: String },
    vision: { type: String },
    values: [{ type: String }],
  },

  // Statistics
  statistics: [{
    number: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: 'blue' },
    order: { type: Number, default: 0 }
  }],

  // Team Members
  teamMembers: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    image: { type: String, required: true },
    specialties: [{ type: String }],
    bio: { type: String },
    order: { type: Number, default: 0 }
  }],

  // Customer Testimonials
  testimonials: [{
    name: { type: String, required: true },
    boat: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    image: { type: String },
    order: { type: Number, default: 0 }
  }],

  // Achievements & Awards
  achievements: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    year: { type: String },
    order: { type: Number, default: 0 }
  }],

  // Call to Action
  callToAction: {
    title: { type: String, default: "Ready to Experience Excellence?" },
    description: { type: String, default: "Join thousands of satisfied customers who trust us with their vessels." },
    primaryButton: {
      text: { type: String, default: "Book Service" },
      link: { type: String, default: "/appointments" }
    },
    secondaryButton: {
      text: { type: String, default: "Contact Us" },
      link: { type: String, default: "/contact" }
    }
  },

  // SEO & Meta
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }]
  },

  // Settings
  settings: {
    showTeam: { type: Boolean, default: true },
    showTestimonials: { type: Boolean, default: true },
    showAchievements: { type: Boolean, default: true },
    showStatistics: { type: Boolean, default: true },
    enableVideo: { type: Boolean, default: false },
    videoUrl: { type: String }
  },

  // Status
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Index for better performance
aboutSchema.index({ isActive: 1 });
aboutSchema.index({ 'teamMembers.order': 1 });
aboutSchema.index({ 'testimonials.order': 1 });
aboutSchema.index({ 'achievements.order': 1 });
aboutSchema.index({ 'statistics.order': 1 });

const About = mongoose.model('About', aboutSchema);
export default About;















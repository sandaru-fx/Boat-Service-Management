import mongoose from 'mongoose';

// User visit tracking
const userVisitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  pageViews: {
    type: Number,
    default: 1
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  browser: {
    type: String,
    default: 'unknown'
  },
  location: {
    type: String,
    default: 'unknown'
  }
});

// Boat category views tracking
const categoryViewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  boatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boat',
    required: true
  },
  boatName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  viewDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  source: {
    type: String,
    enum: ['search', 'category', 'direct', 'recommendation'],
    default: 'direct'
  }
});

// User search tracking
const searchSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  searchTerm: {
    type: String,
    required: true
  },
  searchDate: {
    type: Date,
    default: Date.now
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  clickedResults: [{
    boatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boat'
    },
    boatName: String,
    clickTime: {
      type: Date,
      default: Date.now
    }
  }]
});

// User engagement tracking
const engagementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  engagementScore: {
    type: Number,
    default: 0
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  favoriteCategories: [{
    category: String,
    viewCount: Number,
    timeSpent: Number
  }],
  lastVisit: {
    type: Date,
    default: Date.now
  },
  firstVisit: {
    type: Date,
    default: Date.now
  },
  userType: {
    type: String,
    enum: ['new', 'returning', 'loyal', 'vip'],
    default: 'new'
  }
});

// Analytics summary for quick queries
const analyticsSummarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalVisitors: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  returningVisitors: {
    type: Number,
    default: 0
  },
  totalPageViews: {
    type: Number,
    default: 0
  },
  averageSessionDuration: {
    type: Number,
    default: 0
  },
  categoryStats: [{
    category: String,
    views: Number,
    uniqueViewers: Number,
    averageTime: Number
  }],
  topBoats: [{
    boatId: mongoose.Schema.Types.ObjectId,
    boatName: String,
    views: Number
  }],
  deviceStats: {
    desktop: Number,
    mobile: Number,
    tablet: Number
  },
  hourlyStats: [{
    hour: Number,
    visitors: Number
  }]
});

// Create indexes for better performance
userVisitSchema.index({ userId: 1, visitDate: -1 });
userVisitSchema.index({ visitDate: -1 });
categoryViewSchema.index({ boatId: 1, viewDate: -1 });
categoryViewSchema.index({ category: 1, viewDate: -1 });
searchSchema.index({ userId: 1, searchDate: -1 });
searchSchema.index({ searchTerm: 1 });
engagementSchema.index({ userId: 1 });
analyticsSummarySchema.index({ date: -1 });

const UserVisit = mongoose.model('UserVisit', userVisitSchema);
const CategoryView = mongoose.model('CategoryView', categoryViewSchema);
const Search = mongoose.model('Search', searchSchema);
const Engagement = mongoose.model('Engagement', engagementSchema);
const AnalyticsSummary = mongoose.model('AnalyticsSummary', analyticsSummarySchema);

export { UserVisit, CategoryView, Search, Engagement, AnalyticsSummary };










import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './models/userModel.js';

import userRoutes from './routes/userRoutes.js';
import boatRepairRoutes from './routes/boatRepairRoutes.js';
import authRoutes from './routes/authRoutes.js';
import boatRideRoutes from './routes/boatRideRoutes.js';
import productRoutes from './routes/productRoutes.js';
import aboutRoutes from './routes/about.route.js';
import boatCatalogRoutes from './routes/boatCatalog.route.js';
import appointmentBookingRoutes from './routes/appointmentBooking.route.js';
import contactFormRoutes from './routes/contactForm.route.js';
import reviewRoutes from './routes/review.route.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import chatRoutes from './routes/chat.route.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import boatPackageRoutes from './routes/boatPackage.route.js';
import boatBookingRoutes from './routes/boatBooking.route.js';
import notificationRoutes from './routes/notificationRoutes.js';
import repairCostRoutes from './routes/repairCostRoutes.js';
import reportRoutes from './routes/reportRoutes.js';



// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5001;

// Security middleware - protects against common vulnerabilities
app.use(helmet());

// CORS middleware - allows frontend to communicate with backend
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
console.log('🔧 CORS Configuration:', { frontendUrl, nodeEnv: process.env.NODE_ENV });
app.use(cors({
  origin: [frontendUrl],
  credentials: true
}));

// Body parsing middleware - allows us to read JSON from requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware - logs all HTTP requests for debugging
app.use(morgan('combined'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Boat Service Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Boat Service Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs' // We'll add this later
    }
  });
});

// API routes

// user routes 
app.use('/api/users', userRoutes );

// boat repair routes
app.use('/api/boat-repairs', boatRepairRoutes);

// auth routes (password reset, etc.)
app.use('/api/auth', authRoutes);

// boat ride routes
app.use('/api/boat-rides', boatRideRoutes);

// product routes (spare parts)
app.use('/api/products', productRoutes);

// about page routes
app.use('/api/about', aboutRoutes);

// Phase 1: Customer routes
app.use('/api/boats', boatCatalogRoutes);
app.use('/api/appointments', appointmentBookingRoutes);
app.use('/api/contacts', contactFormRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

// payment routes
app.use('/api/payments', paymentRoutes);

// order routes
app.use('/api/orders', orderRoutes);

// receipt routes
app.use('/api/receipts', receiptRoutes);

// email routes
app.use('/api/emails', emailRoutes);

// New boat service routes
app.use('/api/boat-packages', boatPackageRoutes);
app.use('/api/boat-bookings', boatBookingRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Repair cost routes
app.use('/api/repair-costs', repairCostRoutes);

// Report routes
app.use('/api/reports', reportRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`👤 User joined chat: ${chatId}`);
  });

  // Send message
  socket.on('send-message', async (data) => {
    console.log('📨 Received message:', data);
    
    // Check if user is blocked (only for user messages)
    if (data.sender === 'user') {
      try {
        const User = (await import('./models/userModel.js')).default;
        const Chat = (await import('./models/chat.model.js')).default;
        
        // Get chat to find user email
        const chat = await Chat.findById(data.chatId);
        if (chat) {
          const user = await User.findOne({ email: chat.userEmail });
          
          if (user && user.isBlocked) {
            console.log('🚫 Blocked user tried to send message:', chat.userEmail);
            socket.emit('message-error', { 
              error: 'You have been blocked from sending messages. Please contact support.' 
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user block status:', error);
      }
    }
    
    // Broadcast to all users in the chat room (including sender)
    io.to(data.chatId).emit('receive-message', data);
    console.log(`💬 Message broadcasted in chat: ${data.chatId}`);
    
    // Emit notification updates
    try {
      const Notification = (await import('./models/notification.model.js')).default;
      
      if (data.sender === 'user') {
        // Notify admin/employee
        const adminNotification = await Notification.findOne({ userId: 'admin' });
        io.emit('notifications-update', {
          userId: 'admin',
          unreadCount: adminNotification ? adminNotification.unreadCount : 0,
          lastReadAt: adminNotification ? adminNotification.lastReadAt : null
        });
      } else {
        // Notify user
        const userNotification = await Notification.findOne({ userId: data.userEmail });
        io.emit('notifications-update', {
          userId: data.userEmail,
          unreadCount: userNotification ? userNotification.unreadCount : 0,
          lastReadAt: userNotification ? userNotification.lastReadAt : null
        });
      }
    } catch (error) {
      console.error('❌ Error updating notifications:', error);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user-typing', data);
  });

  // Stop typing
  socket.on('stop-typing', (data) => {
    socket.to(data.chatId).emit('user-stop-typing', data);
  });

  // Admin online status
  socket.on('admin-online', () => {
    console.log('👨‍💼 Admin came online');
    socket.broadcast.emit('admin-status', { online: true });
  });

  // Admin offline status
  socket.on('admin-offline', () => {
    console.log('👨‍💼 Admin went offline');
    socket.broadcast.emit('admin-status', { online: false });
  });

  // User online status
  socket.on('user-online', (userData) => {
    console.log('👤 User came online:', userData);
    socket.broadcast.emit('new-user-online', userData);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });

  // Notification events
  socket.on('request-notifications', async (userId) => {
    try {
      const Notification = (await import('./models/notification.model.js')).default;
      const notification = await Notification.findOne({ userId });
      
      socket.emit('notifications-update', {
        unreadCount: notification ? notification.unreadCount : 0,
        lastReadAt: notification ? notification.lastReadAt : null
      });
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  });
});

// Migration function - completed and no longer needed

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Migration completed - no longer needed
    
    // Then start the server
    server.listen(PORT, () => {
      console.log(`🚢 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💬 Socket.io server ready for chat connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;
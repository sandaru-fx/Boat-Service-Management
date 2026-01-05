import express from 'express';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Notification from '../models/notification.model.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat-files/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and videos are allowed.'));
    }
  }
});

// Get all chats for admin dashboard
router.get('/admin/chats', async (req, res) => {
  try {
    console.log('📋 Admin requesting chats...');
    
    // Get unique chats by userEmail (to avoid duplicates)
    const chats = await Chat.aggregate([
      {
        $sort: { lastMessageAt: -1 }
      },
      {
        $group: {
          _id: '$userEmail',
          chat: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$chat' }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);
    
    console.log(`📋 Found ${chats.length} unique chats`);
    
    // Get messages for each chat
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const messages = await Message.find({ chatId: chat._id })
          .sort({ timestamp: 1 });
        return {
          ...chat,
          messages
        };
      })
    );
    
    res.json({
      success: true,
      data: chatsWithMessages
    });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
});

// Get messages for a specific chat
router.get('/chat/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 });
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Create a new chat or return existing one
router.post('/chat/create', async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;
    
    console.log('📝 Creating/finding chat for user:', { userId, userName, userEmail });
    
    // Check if chat already exists for this user
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      // Create new chat
      console.log('🆕 Creating new chat for user:', userId);
      chat = new Chat({
        userId,
        userName,
        userEmail
      });
      await chat.save();
      console.log('✅ New chat created:', chat._id);
    } else {
      // Update existing chat with latest user info
      console.log('🔄 Found existing chat:', chat._id);
      chat.userName = userName;
      chat.userEmail = userEmail;
      chat.updatedAt = new Date();
      await chat.save();
      console.log('✅ Existing chat updated');
    }
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('❌ Error in chat creation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: error.message
    });
  }
});

// Send message with file upload
router.post('/chat/:chatId/message', upload.single('file'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, message } = req.body;
    
    console.log('📨 Saving message:', { chatId, sender, message });
    
    // Check if user is blocked (only for user messages)
    if (sender === 'user') {
      try {
        const User = (await import('../models/userModel.js')).default;
        const Chat = (await import('../models/chat.model.js')).default;
        
        // Get chat to find user email
        const chat = await Chat.findById(chatId);
        if (chat) {
          const user = await User.findOne({ email: chat.userEmail });
          
          if (user && user.isBlocked) {
            console.log('🚫 Blocked user tried to send message via HTTP:', chat.userEmail);
            return res.status(403).json({
              success: false,
              message: 'You have been blocked from sending messages. Please contact support.'
            });
          }
        }
      } catch (error) {
        console.error('Error checking user block status in HTTP:', error);
      }
    }
    
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;
    
    if (req.file) {
      fileUrl = `/uploads/chat-files/${req.file.filename}`;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    }
    
    const newMessage = new Message({
      chatId,
      sender,
      message,
      fileUrl,
      fileName,
      fileType,
      fileSize
    });
    
    await newMessage.save();
    console.log('✅ Message saved to database:', newMessage._id);

    // Update message status based on sender
    if (sender === 'admin') {
      // Admin messages are automatically delivered and read
      newMessage.status.delivered = true;
      newMessage.status.read = true;
      newMessage.status.readAt = new Date();
      await newMessage.save();
    }

    // Update chat with last message info
    const updateData = {
      lastMessage: message,
      lastMessageAt: new Date()
    };

    if (sender === 'user') {
      updateData.$inc = { unreadCount: 1 };
    } else {
      updateData.unreadCount = 0;
    }

    await Chat.findByIdAndUpdate(chatId, updateData);
    console.log('✅ Chat updated');
    
    // Add notification for the recipient
    const chat = await Chat.findById(chatId);
    if (chat) {
      if (sender === 'user') {
        // Notify admin/employee
        await addNotification('admin', chatId, newMessage._id);
      } else {
        // Notify user
        await addNotification(chat.userEmail, chatId, newMessage._id);
      }
    }
    
    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('❌ Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/chat/:chatId/read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender } = req.body;

    console.log('📖 Marking messages as read:', { chatId, sender });

    // Update all unread messages in this chat
    const updateResult = await Message.updateMany(
      { 
        chatId: chatId,
        sender: { $ne: sender }, // Don't mark own messages as read
        'status.read': false
      },
      { 
        $set: { 
          'status.read': true,
          'status.readAt': new Date(),
          isRead: true
        }
      }
    );

    // Update chat unread count
    if (sender === 'admin') {
      await Chat.findByIdAndUpdate(chatId, { unreadCount: 0 });
    }

    console.log('✅ Messages marked as read:', updateResult.modifiedCount);

    res.json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Update chat status
router.put('/chat/:chatId/status', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { status } = req.body;
    
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { status },
      { new: true }
    );
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update chat status',
      error: error.message
    });
  }
});

// Delete chat (Admin only)
router.delete('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    console.log('🗑️ Admin deleting chat:', chatId);

    // Delete all messages in this chat
    const messagesResult = await Message.deleteMany({ chatId: chatId });
    console.log('🗑️ Deleted messages:', messagesResult.deletedCount);

    // Delete the chat
    const chatResult = await Chat.findByIdAndDelete(chatId);
    
    if (!chatResult) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    console.log('✅ Chat deleted successfully:', chatId);

    res.json({
      success: true,
      message: 'Chat deleted successfully',
      deletedMessages: messagesResult.deletedCount
    });
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: error.message
    });
  }
});

// Clean up duplicate chats (Admin only)
router.delete('/admin/cleanup-duplicates', async (req, res) => {
  try {
    console.log('🧹 Cleaning up duplicate chats...');
    
    // Find all chats grouped by userEmail
    const duplicateChats = await Chat.aggregate([
      {
        $group: {
          _id: '$userEmail',
          chats: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let deletedCount = 0;
    let deletedMessages = 0;

    for (const group of duplicateChats) {
      // Keep the most recent chat, delete the rest
      const sortedChats = group.chats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const chatsToDelete = sortedChats.slice(1); // Keep first (most recent), delete the rest

      for (const chat of chatsToDelete) {
        // Delete messages
        const messagesResult = await Message.deleteMany({ chatId: chat._id });
        deletedMessages += messagesResult.deletedCount;
        
        // Delete chat
        await Chat.findByIdAndDelete(chat._id);
        deletedCount++;
      }
    }

    console.log(`✅ Cleanup complete: Deleted ${deletedCount} duplicate chats and ${deletedMessages} messages`);

    res.json({
      success: true,
      message: 'Duplicate chats cleaned up successfully',
      deletedChats: deletedCount,
      deletedMessages: deletedMessages
    });
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean up duplicate chats',
      error: error.message
    });
  }
});

// Get notification count for user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notification = await Notification.findOne({ userId });
    
    res.json({
      success: true,
      data: {
        unreadCount: notification ? notification.unreadCount : 0,
        lastReadAt: notification ? notification.lastReadAt : null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notifications as read
router.put('/notifications/:userId/read', async (req, res) => {
  try {
    const { userId } = req.params;
    const { chatId } = req.body;
    
    let notification = await Notification.findOne({ userId });
    
    if (!notification) {
      notification = new Notification({
        userId,
        chatId,
        unreadCount: 0
      });
    }
    
    // Mark all notifications as read
    notification.notifications.forEach(notif => {
      notif.read = true;
    });
    
    notification.unreadCount = 0;
    notification.lastReadAt = new Date();
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
});

// Add notification when message is sent
const addNotification = async (userId, chatId, messageId) => {
  try {
    let notification = await Notification.findOne({ userId });
    
    if (!notification) {
      notification = new Notification({
        userId,
        chatId,
        unreadCount: 0
      });
    }
    
    // Add new notification
    notification.notifications.push({
      messageId,
      timestamp: new Date(),
      read: false
    });
    
    // Update unread count
    notification.unreadCount = notification.notifications.filter(n => !n.read).length;
    await notification.save();
    
    console.log(`📬 Notification added for user ${userId}, unread count: ${notification.unreadCount}`);
  } catch (error) {
    console.error('❌ Error adding notification:', error);
  }
};

export default router;

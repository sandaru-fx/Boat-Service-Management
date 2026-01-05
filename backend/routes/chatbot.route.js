import express from 'express';
import Chatbot from '../models/chatbot.model.js';

const router = express.Router();

// Get bot response
router.post('/bot/response', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    console.log('🤖 Bot processing message:', message);

    // Convert message to lowercase for matching
    const lowerMessage = message.toLowerCase();

    // Find matching responses
    const responses = await Chatbot.find({ isActive: true });
    
    let bestMatch = null;
    let maxScore = 0;

    // Simple keyword matching algorithm
    for (const response of responses) {
      let score = 0;
      
      // Check if any keywords match
      for (const keyword of response.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      
      // Check if question matches
      if (lowerMessage.includes(response.question.toLowerCase())) {
        score += 2;
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = response;
      }
    }

    // If no good match found, use default responses
    if (!bestMatch || maxScore === 0) {
      // Check for escalation keywords
      const escalationKeywords = ['admin', 'human', 'person', 'manager', 'help', 'problem', 'issue', 'complaint'];
      const needsEscalation = escalationKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (needsEscalation) {
        return res.json({
          success: true,
          data: {
            message: "I understand you'd like to speak with our admin. Let me connect you with our marine service expert right away!",
            sender: 'bot',
            escalate: true,
            chatId: chatId,
            timestamp: new Date()
          }
        });
      }

      // Default response for unmatched queries
      return res.json({
        success: true,
        data: {
          message: "I'm here to help with Marine Service Center questions! You can ask me about our services, hours, pricing, or say 'admin' to speak with our expert. How can I assist you?",
          sender: 'bot',
          escalate: false,
          chatId: chatId,
          timestamp: new Date()
        }
      });
    }

    // Return the best match
    res.json({
      success: true,
      data: {
        message: bestMatch.answer,
        sender: 'bot',
        escalate: bestMatch.priority === 2,
        chatId: chatId,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Bot response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bot response',
      error: error.message
    });
  }
});

// Initialize bot knowledge base
router.post('/bot/init', async (req, res) => {
  try {
    console.log('🤖 Initializing bot knowledge base...');

    const knowledgeBase = [
      {
        question: "hello",
        answer: "Hello! Welcome to Marine Service Center! 🚢 I'm your virtual assistant. How can I help you today?",
        category: "greeting",
        keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
        priority: 1
      },
      {
        question: "services",
        answer: "We offer comprehensive marine services including: 🛠️ Boat repairs, ⚙️ Engine maintenance, 🧽 Cleaning & detailing, 🔧 Electrical work, 🎣 Fishing equipment service, and 🚤 General maintenance. Need more details? Just ask!",
        category: "services",
        keywords: ["services", "what do you do", "repair", "maintenance", "cleaning", "electrical"],
        priority: 1
      },
      {
        question: "hours",
        answer: "Our operating hours are: 📅 Monday to Saturday: 8:00 AM - 6:00 PM, 🚫 Sunday: Closed. We're here to serve your marine needs!",
        category: "hours",
        keywords: ["hours", "time", "open", "closed", "when", "schedule"],
        priority: 1
      },
      {
        question: "contact",
        answer: "Contact Marine Service Center: 📞 Phone: +94 11 234 5678, 📧 Email: marineservicecenter513@gmail.com, 📍 Location: [Your Address]. We're here to help!",
        category: "contact",
        keywords: ["contact", "phone", "email", "address", "location", "where"],
        priority: 1
      },
      {
        question: "pricing",
        answer: "Our pricing varies by service: 🔧 Basic repairs start from 50 LKR, ⚙️ Engine work from 100 LKR, 🧽 Cleaning from 30 LKR, 🔌 Electrical from 80 LKR. For exact quotes, I can connect you with our admin for detailed pricing!",
        category: "pricing",
        keywords: ["price", "cost", "how much", "pricing", "quote", "expensive"],
        priority: 1
      },
      {
        question: "booking",
        answer: "To book an appointment, I can help you schedule! Please tell me: 1) What service you need, 2) Your preferred date/time, 3) Your contact details. Or say 'admin' to speak directly with our team!",
        category: "booking",
        keywords: ["book", "appointment", "schedule", "reserve", "when can you"],
        priority: 1
      },
      {
        question: "technical",
        answer: "For technical marine issues, I recommend speaking with our expert technician. Let me connect you with our admin who can provide detailed technical assistance!",
        category: "technical",
        keywords: ["technical", "engine problem", "broken", "not working", "fault", "issue"],
        priority: 2
      },
      {
        question: "admin",
        answer: "I'll connect you with our marine service expert right away! They'll be able to provide personalized assistance for your needs.",
        category: "escalation",
        keywords: ["admin", "human", "person", "manager", "expert", "technician"],
        priority: 2
      }
    ];

    // Clear existing knowledge base
    await Chatbot.deleteMany({});
    
    // Insert new knowledge base
    await Chatbot.insertMany(knowledgeBase);
    
    console.log('✅ Bot knowledge base initialized with', knowledgeBase.length, 'responses');

    res.json({
      success: true,
      message: 'Bot knowledge base initialized successfully',
      count: knowledgeBase.length
    });

  } catch (error) {
    console.error('❌ Bot initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize bot',
      error: error.message
    });
  }
});

// Get all bot responses (for admin management)
router.get('/bot/responses', async (req, res) => {
  try {
    const responses = await Chatbot.find({ isActive: true }).sort({ category: 1 });
    
    res.json({
      success: true,
      data: responses
    });
  } catch (error) {
    console.error('❌ Error fetching bot responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bot responses',
      error: error.message
    });
  }
});

export default router;

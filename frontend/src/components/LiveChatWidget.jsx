import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Icon,
  useColorModeValue,
  useToast,
  Image,
  Badge,
  Spinner,
  Divider,
  Flex,
  Avatar,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { 
  FaComment, 
  FaPaperPlane, 
  FaTimes, 
  FaPaperclip, 
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import io from 'socket.io-client';

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [chatId, setChatId] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBotMode, setIsBotMode] = useState(true); // Start with bot mode
  const [isEscalating, setIsEscalating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();
  
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'cyan.400');
  const messageAreaBg = useColorModeValue('gray.50', 'gray.700');

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Initializing Socket.io connection...');
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to chat server:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('🔌 Disconnected from chat server:', reason);
    });

    newSocket.on('receive-message', (data) => {
      console.log('📨 Received message via socket:', data);
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => 
          msg.message === data.message && 
          msg.timestamp === data.timestamp
        );
        if (exists) return prev;
        return [...prev, data];
      });
      
      if (data.sender === 'admin') {
        setUnreadCount(prev => prev + 1);
        // Play notification sound
        playNotificationSound();
      }
      scrollToBottom();
    });

    newSocket.on('user-typing', (data) => {
      if (data.sender === 'admin') {
        setIsTyping(true);
        setTypingUser('Admin');
      }
    });

    newSocket.on('user-stop-typing', () => {
      setIsTyping(false);
      setTypingUser('');
    });

    newSocket.on('admin-status', (data) => {
      console.log('👨‍💼 Admin status update:', data);
      setAdminOnline(data.online);
    });

    newSocket.on('message-error', (data) => {
      console.log('🚫 Message error received:', data);
      setIsBlocked(true);
      toast({
        title: 'Blocked',
        description: data.error || 'You have been blocked from sending messages.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {
      // Fallback: create a simple beep sound
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    });
  };

  // Handle chat initialization
  const initializeChat = async () => {
    if (!userInfo.name || !userInfo.email) {
      toast({
        title: 'Please fill in your details',
        description: 'Name and email are required to start chatting.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chat/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: `${userInfo.email}-${Date.now()}`,
          userName: userInfo.name,
          userEmail: userInfo.email
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChatId(data.data._id);
        socket.emit('join-chat', data.data._id);
        setIsOpen(true);
        setIsMinimized(false);
        onUserModalClose();
        
        // Load existing messages
        loadMessages(data.data._id);
        
        toast({
          title: 'Chat started!',
          description: 'You can now chat with our support team.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to start chat',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing messages
  const loadMessages = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/chat/${chatId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Add welcome message if in bot mode and no messages
        if (isBotMode && data.data.length === 0) {
          const welcomeMessage = {
            _id: 'welcome-' + Date.now(),
            chatId: chatId,
            sender: 'bot',
            message: "Hello! Welcome to Marine Service Center! 🚢 I'm your AI assistant. I can help you with information about our services, hours, pricing, and more. How can I assist you today?",
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
        
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Get bot response
  const getBotResponse = async (message) => {
    try {
      console.log('🤖 Getting bot response for:', message);
      
      const response = await fetch('http://localhost:5000/api/chatbot/bot/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          chatId: chatId
        }),
      });

      const data = await response.json();
      console.log('🤖 Bot response:', data);

      if (response.ok && data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get bot response');
      }
    } catch (error) {
      console.error('❌ Error getting bot response:', error);
      return {
        message: "I'm having trouble understanding. Let me connect you with our admin!",
        sender: 'bot',
        escalate: true,
        chatId: chatId,
        timestamp: new Date()
      };
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    const messageData = {
      chatId,
      sender: 'user',
      message: messageText,
      timestamp: new Date()
    };

    try {
      console.log('📤 Sending message:', messageData);
      
      const response = await fetch(`http://localhost:5000/api/chat/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'user',
          message: messageText
        }),
      });

      const data = await response.json();
      console.log('📨 Message response:', data);

      if (response.ok && data.success) {
        // Add message to local state
        setMessages(prev => [...prev, data.data]);
        
        // Emit socket event for real-time updates
        socket.emit('send-message', data.data);
        
        scrollToBottom();

        // If in bot mode, get bot response
        if (isBotMode) {
          const botResponse = await getBotResponse(messageText);
          
          // Add bot response to messages
          setMessages(prev => [...prev, botResponse]);
          
          // Save bot response to database
          const botSaveResponse = await fetch(`http://localhost:5000/api/chat/chat/${chatId}/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: 'bot',
              message: botResponse.message
            }),
          });

          if (botSaveResponse.ok) {
            socket.emit('send-message', botResponse); // Emit bot message
          }

          // Check if bot wants to escalate
          if (botResponse.escalate) {
            setIsEscalating(true);
            setTimeout(() => {
              setIsBotMode(false);
              setIsEscalating(false);
              toast({
                title: 'Connected to Admin',
                description: 'You are now chatting with our marine service expert!',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            }, 2000);
          }
          
          scrollToBottom();
        }
        
        console.log('✅ Message sent successfully');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
      toast({
        title: 'Failed to send message',
        description: error.message || 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 5MB.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sender', 'user');
    formData.append('message', `📎 ${file.name}`);

    try {
      const response = await fetch(`http://localhost:5000/api/chat/chat/${chatId}/message`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        socket.emit('send-message', data.data);
        scrollToBottom();
      }
    } catch (error) {
      toast({
        title: 'Failed to upload file',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', { chatId, sender: 'user' });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { chatId, sender: 'user' });
    }, 1000);
  };

  const handleChatToggle = () => {
    if (!chatId) {
      onUserModalOpen();
    } else {
      setIsMinimized(!isMinimized);
      if (!isMinimized) {
        setUnreadCount(0);
      }
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={1000}
      >
        <Button
          onClick={handleChatToggle}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: 'xl'
          }}
          transition="all 0.3s ease"
          position="relative"
        >
          <Icon as={FaComment} />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-8px"
              right="-8px"
              colorScheme="red"
              borderRadius="full"
              minW="20px"
              h="20px"
              fontSize="xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </Box>

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <Box
          position="fixed"
          bottom="100px"
          right="20px"
          w="350px"
          h="500px"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="xl"
          zIndex={1000}
          display="flex"
          flexDirection="column"
        >
          {/* Chat Header */}
          <Box
            bg={accentColor}
            color="white"
            p={4}
            borderRadius="lg 0 0 0"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <VStack spacing={1} align="start">
              <Text fontWeight="bold" fontSize="sm">
                Marine Service Center
              </Text>
              <HStack spacing={2}>
                <Box
                  w={2}
                  h={2}
                  bg={isBotMode ? 'blue.400' : (adminOnline ? 'green.400' : 'red.400')}
                  borderRadius="full"
                />
                <Text fontSize="xs">
                  {isEscalating ? 'Connecting to Admin...' : 
                   isBotMode ? 'AI Assistant' : 
                   adminOnline ? 'Admin Online' : 'Admin Offline'}
                </Text>
              </HStack>
            </VStack>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              onClick={() => setIsMinimized(true)}
            >
              <Icon as={FaTimes} />
            </Button>
          </Box>

          {/* Messages Area */}
          <Box
            flex={1}
            p={4}
            overflowY="auto"
            bg={messageAreaBg}
          >
            {messages.length === 0 ? (
              <VStack spacing={4} align="center" justify="center" h="full">
                <Icon as={FaComment} boxSize={8} color="gray.400" />
                <Text color="gray.500" textAlign="center">
                  Start a conversation with our support team!
                </Text>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                    maxW="80%"
                  >
                    <HStack
                      spacing={2}
                      align="start"
                      flexDirection={message.sender === 'user' ? 'row-reverse' : 'row'}
                    >
                      <Avatar
                        size="xs"
                        name={message.sender === 'user' ? userInfo.name : 'Admin'}
                        bg={message.sender === 'user' ? 'blue.500' : 'green.500'}
                      />
                      <Box
                        bg={message.sender === 'user' ? accentColor : 'gray.200'}
                        color={message.sender === 'user' ? 'white' : 'gray.800'}
                        p={3}
                        borderRadius="lg"
                        fontSize="sm"
                      >
                        {message.fileUrl ? (
                          <VStack spacing={2} align="start">
                            <HStack spacing={2}>
                              <Icon as={FaPaperclip} />
                              <Text fontWeight="bold">{message.fileName}</Text>
                            </HStack>
                            {message.fileType.startsWith('image/') ? (
                              <Image
                                src={`http://localhost:5000${message.fileUrl}`}
                                alt={message.fileName}
                                maxW="200px"
                                maxH="150px"
                                borderRadius="md"
                              />
                            ) : (
                              <Button
                                size="sm"
                                leftIcon={<Icon as={FaDownload} />}
                                onClick={() => window.open(`http://localhost:5000${message.fileUrl}`, '_blank')}
                              >
                                Download
                              </Button>
                            )}
                          </VStack>
                        ) : (
                          <Text>{message.message}</Text>
                        )}
                        <Text
                          fontSize="xs"
                          opacity={0.7}
                          mt={1}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
                {isTyping && (
                  <Box alignSelf="flex-start">
                    <HStack spacing={2} align="start">
                      <Avatar size="xs" name="Admin" bg="green.500" />
                      <Box
                        bg="gray.200"
                        p={3}
                        borderRadius="lg"
                        fontSize="sm"
                      >
                        <Text color="gray.600">
                          {typingUser} is typing...
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </VStack>
            )}
          </Box>

          {/* Message Input */}
          <Box p={4} borderTop="1px solid" borderColor={borderColor}>
            {isBlocked && (
              <Alert status="error" mb={3} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Chat Blocked</AlertTitle>
                  <AlertDescription fontSize="sm">
                    You have been blocked from sending messages. Please contact support.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
            <VStack spacing={3}>
              <HStack spacing={2} w="full">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder={isBlocked ? "You are blocked from chatting" : "Type your message..."}
                  size="sm"
                  disabled={isBlocked}
                  opacity={isBlocked ? 0.5 : 1}
                  cursor={isBlocked ? "not-allowed" : "text"}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isBlocked) {
                      sendMessage();
                    }
                  }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept="image/*,application/pdf,.doc,.docx,.txt,.mp4,.avi"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBlocked}
                  opacity={isBlocked ? 0.5 : 1}
                  cursor={isBlocked ? "not-allowed" : "pointer"}
                >
                  <Icon as={FaPaperclip} />
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isBlocked}
                  opacity={isBlocked ? 0.5 : 1}
                  cursor={isBlocked ? "not-allowed" : "pointer"}
                >
                  <Icon as={FaPaperPlane} />
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Press Enter to send • Max file size: 5MB
              </Text>
            </VStack>
          </Box>
        </Box>
      )}

      {/* User Info Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start Live Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Get Instant Help!</AlertTitle>
                  <AlertDescription>
                    Our support team is here to help you with any questions about our marine services.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <FormControl isRequired>
                <FormLabel>Your Name</FormLabel>
                <Input
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <Input
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </FormControl>
              
              <Button
                colorScheme="blue"
                onClick={initializeChat}
                isLoading={isLoading}
                loadingText="Starting Chat..."
                w="full"
                leftIcon={<Icon as={FaComment} />}
              >
                Start Chatting
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LiveChatWidget;



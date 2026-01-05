import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  IconButton,
  useColorModeValue,
  Avatar,
  useToast,
  Icon,
  Flex,
  Badge,
  Divider,
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
  FaPaperPlane, 
  FaTimes, 
  FaPaperclip, 
  FaUser, 
  FaEnvelope, 
  FaPhone,
  FaArrowLeft,
  FaHeadset
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

const CustomerChat = () => {
  console.log('🚀 CustomerChat component loaded');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [employeeOnline, setEmployeeOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();
  
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const messageAreaBgColor = useColorModeValue('gray.50', 'gray.700');
  const customerMessageBgColor = useColorModeValue('blue.500', 'blue.600');
  const employeeMessageBgColor = useColorModeValue('gray.200', 'gray.600');
  const headerBgColor = useColorModeValue('blue.500', 'blue.600');
  const inputBgColor = useColorModeValue('gray.50', 'gray.700');

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Customer initializing Socket.io connection...');
    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Customer connected to chat server:', newSocket.id);
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
      console.log('📨 Customer received message:', data);
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => 
          msg.message === data.message && 
          msg.timestamp === data.timestamp
        );
        if (exists) return prev;
        return [...prev, data];
      });
      scrollToBottom();
      
      // Show toast notification for new messages
      if (data.sender === 'admin') {
        toast({
          title: 'New Message',
          description: `Support team: ${data.message}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    newSocket.on('user-typing', (data) => {
      if (data.sender === 'admin') {
        setIsTyping(true);
        setTypingUser('Support Team');
      }
    });

    newSocket.on('user-stop-typing', () => {
      setIsTyping(false);
      setTypingUser('');
    });

    newSocket.on('admin-status', (data) => {
      console.log('👨‍💼 Employee status update:', data);
      setEmployeeOnline(data.online);
    });

    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  // Initialize chat when component mounts
  useEffect(() => {
    console.log('🔄 Customer useEffect triggered - user:', user, 'isInitialized:', isInitialized);
    if (user && !isInitialized) {
      console.log('✅ Customer conditions met, calling initializeChat');
      initializeChat();
    } else {
      console.log('❌ Customer conditions not met - user:', !!user, 'isInitialized:', isInitialized);
    }
  }, [user, isInitialized]);

  // Mark notifications as read when chat is opened
  useEffect(() => {
    if (chatId && user) {
      markNotificationsAsRead();
    }
  }, [chatId, user]);

  const markNotificationsAsRead = async () => {
    if (!user || !chatId) return;
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/notifications/${user.email}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize chat with user data
  const initializeChat = async () => {
    console.log('🔧 Customer initializeChat called');
    if (!user) {
      toast({
        title: 'Please login first',
        description: 'You need to be logged in to use chat support.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/chat/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.email,
          userName: user.name || user.email,
          userEmail: user.email
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChatId(data.data._id);
        socket?.emit('join-chat', data.data._id);
        setIsInitialized(true);
        
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
      console.log('🔍 Customer loading messages for chatId:', chatId);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/chat/${chatId}/messages`);
      console.log('📡 Customer messages response status:', response.status);
      const data = await response.json();
      console.log('📡 Customer messages response data:', data);
      if (data.success) {
        console.log('✅ Customer loaded messages:', data.data.length, 'messages');
        setMessages(data.data);
        scrollToBottom();
      } else {
        console.error('❌ Customer messages API returned error:', data.message);
      }
    } catch (error) {
      console.error('❌ Customer failed to load messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      console.log('📤 Customer sending message:', { chatId, message: messageText });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/chat/${chatId}/message`, {
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
      console.log('📨 Customer message response:', data);

      if (response.ok && data.success) {
        // Add message to local state
        setMessages(prev => [...prev, data.data]);
        
        // Emit socket event for real-time updates
        socket?.emit('send-message', data.data);
        
        scrollToBottom();
        console.log('✅ Customer message sent successfully');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Customer error sending message:', error);
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

  // Handle typing indicator
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket?.emit('typing', { chatId, sender: 'user' });

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop-typing', { chatId, sender: 'user' });
    }, 1000);
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container maxW="full" p={0} h="100vh">
      <Flex h="100vh" bg={messageAreaBgColor}>
        {/* Chat Interface */}
        <Box flex={1} bg={bgColor} display="flex" flexDirection="column">
          {/* Chat Header */}
          <Box
            p={4}
            borderBottom="1px solid"
            borderColor={borderColor}
            bg={headerBgColor}
            color="white"
          >
            <HStack justify="space-between">
              <HStack spacing={3}>
                <IconButton
                  icon={<FaArrowLeft />}
                  size="sm"
                  variant="ghost"
                  color="white"
                  onClick={() => navigate('/dashboard')}
                />
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="white">
                    Marine Service Center
                  </Heading>
                  <HStack spacing={2}>
                    <Box
                      w={2}
                      h={2}
                      bg={employeeOnline ? 'green.400' : 'red.400'}
                      borderRadius="full"
                    />
                    <Text fontSize="sm" color="blue.100">
                      {employeeOnline ? 'Support Team Online' : 'Support Team Offline'}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaHeadset} />
                <Text fontSize="sm">Live Support</Text>
              </HStack>
            </HStack>
          </Box>

          {/* Messages Area */}
          <Box
            flex={1}
            overflowY="auto"
            p={4}
            bg={messageAreaBgColor}
          >
            {isLoading ? (
              <VStack spacing={4} align="center" justify="center" h="full">
                <Text color={subTextColor}>Connecting to support...</Text>
              </VStack>
            ) : messages.length === 0 ? (
              <VStack spacing={4} align="center" justify="center" h="full">
                <Icon as={FaHeadset} boxSize={12} color="gray.400" />
                <Text color={subTextColor} textAlign="center">
                  Start a conversation with our support team!
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Type your message below and we'll help you right away.
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
                        name={message.sender === 'user' ? (user?.name || 'You') : 'Support Team'}
                        bg={message.sender === 'user' ? 'blue.500' : 'green.500'}
                      />
                      <Box
                        bg={message.sender === 'user' ? customerMessageBgColor : employeeMessageBgColor}
                        color={message.sender === 'user' ? 'white' : textColor}
                        p={3}
                        borderRadius="lg"
                        fontSize="sm"
                      >
                        <Text>{message.message}</Text>
                        <Text
                          fontSize="xs"
                          opacity={0.7}
                          mt={1}
                        >
                          {formatTime(message.timestamp)}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <Box alignSelf="flex-start">
                    <HStack spacing={2} align="start">
                      <Avatar size="xs" name="Support Team" bg="green.500" />
                      <Box
                        bg={employeeMessageBgColor}
                        p={3}
                        borderRadius="lg"
                        fontSize="sm"
                      >
                        <Text color={subTextColor}>
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
          <Box
            p={4}
            borderTop="1px solid"
            borderColor={borderColor}
            bg={bgColor}
          >
            <HStack spacing={2}>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                bg={inputBgColor}
                disabled={!isConnected}
              />
              <IconButton
                icon={<FaPaperclip />}
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected}
              />
              <Button
                colorScheme="blue"
                size="sm"
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                leftIcon={<Icon as={FaPaperPlane} />}
              >
                Send
              </Button>
            </HStack>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              {isConnected ? 'Connected to support team' : 'Connecting...'}
            </Text>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default CustomerChat;

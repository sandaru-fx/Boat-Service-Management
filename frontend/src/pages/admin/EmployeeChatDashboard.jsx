import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Flex, VStack, HStack, Text, Heading, Button, Input, IconButton,
  useColorModeValue, Avatar, Spinner, Badge, Divider, useToast, Progress, Link, Icon,
  Card, CardBody, InputGroup, InputLeftElement, InputRightElement, Tooltip, 
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, useDisclosure, Drawer,
  DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton
} from '@chakra-ui/react';
import { 
  FaPaperPlane, FaUpload, FaFile, FaImage, FaVideo, FaDownload, FaCheckCircle, 
  FaTimes, FaUser, FaClock, FaEnvelope, FaPhone, FaCommentDots, FaSearch,
  FaEllipsisV, FaCheck, FaCheckDouble, FaCircle, FaSync, FaBars, FaMobile,
  FaTrash, FaExclamationTriangle, FaPlus, FaArrowLeft
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const EmployeeChatDashboard = () => {
  console.log('🚀 EmployeeChatDashboard component loaded');
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    resolvedChats: 0,
    totalMessages: 0
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Block/Unblock user functions
  const handleBlockUser = async (userId, userName) => {
    console.log('🚫 Blocking user:', { userId, userName });
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🌐 API URL:', `${process.env.REACT_APP_API_URL}/api/users/${userId}/block`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📡 Block response:', { status: response.status, data });
      
      if (response.ok && data.success) {
        console.log('✅ Block successful, updating state');
        setBlockedUsers(prev => new Set([...prev, userId]));
        toast({
          title: 'User Blocked',
          description: `${userName} has been blocked from chatting`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message || 'Failed to block user');
      }
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      toast({
        title: 'Failed to block user',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUnblockUser = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/unblock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setBlockedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        toast({
          title: 'User Unblocked',
          description: `${userName} can now chat again`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: 'Failed to unblock user',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [chatToDelete, setChatToDelete] = useState(null);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const chatBgColor = useColorModeValue('gray.50', 'gray.700');
  const messageBgColor = useColorModeValue('blue.500', 'blue.600');
  const userMessageBgColor = useColorModeValue('gray.200', 'gray.600');
  const mainBgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('white', 'gray.800');
  const messageAreaBgColor = useColorModeValue('gray.50', 'gray.700');
  const dateSeparatorBgColor = useColorModeValue('white', 'gray.600');
  const inputBgColor = useColorModeValue('gray.50', 'gray.700');

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Employee initializing Socket.io connection...');
    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Employee connected to chat server:', newSocket.id);
      newSocket.emit('admin-online');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Employee socket connection error:', error);
    });

    newSocket.on('receive-message', (data) => {
      console.log('📨 Employee received message:', data);
      if (selectedChat && data.chatId === selectedChat._id) {
        setMessages(prev => {
          const exists = prev.some(msg =>
            msg.message === data.message &&
            msg.timestamp === data.timestamp &&
            msg.sender === data.sender
          );
          if (exists) return prev;
          return [...prev, data];
        });
        scrollToBottom();
      }
      loadChats(); // Update chat list
      
      // Show toast notification for new messages
      if (data.sender === 'user') {
        toast({
          title: 'New Customer Message',
          description: `${data.userName || 'Customer'}: ${data.message}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    });

    newSocket.on('user-typing', (data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setIsTyping(true);
        setTypingUser(data.userName || 'User');
      }
    });

    newSocket.on('user-stop-typing', () => {
      setIsTyping(false);
      setTypingUser('');
    });

    newSocket.on('new-user-online', (userData) => {
      console.log('👤 New user online:', userData);
      loadChats(); // Refresh chat list
    });

    return () => {
      console.log('🔌 Employee cleaning up socket connection');
      newSocket.emit('admin-offline');
      newSocket.close();
    };
  }, [selectedChat]);

  // Load chats on component mount
  useEffect(() => {
    console.log('📋 useEffect triggered - loading chats');
    loadChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
      markMessagesAsRead(selectedChat._id);
      markNotificationsAsRead();
    }
  }, [selectedChat]);

  const markNotificationsAsRead = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/notifications/admin/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: selectedChat?._id }),
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // Load chats
  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      console.log('📋 Loading chats...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/admin/chats`);
      const data = await response.json();
      console.log('📋 Chats response:', data);
      
      if (data.success) {
        setChats(data.data);
        
        // Calculate stats
        const totalChats = data.data.length;
        const activeChats = data.data.filter(chat => chat.status === 'active').length;
        const resolvedChats = data.data.filter(chat => chat.status === 'resolved').length;
        const totalMessages = data.data.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
        
        setStats({
          totalChats,
          activeChats,
          resolvedChats,
          totalMessages
        });
        
        console.log('📊 Stats updated:', { totalChats, activeChats, resolvedChats, totalMessages });
      } else {
        console.error('❌ Failed to load chats:', data.message);
        toast({
          title: 'Failed to load chats',
          description: data.message || 'Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Error loading chats:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server. Please check if backend is running.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Load messages for selected chat
  const loadMessages = async (chatId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/chat/${chatId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/chat/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'admin' }),
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      console.log('📤 Employee sending message:', { chatId: selectedChat._id, message: messageText });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/chat/${selectedChat._id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'admin',
          message: messageText
        }),
      });

      const data = await response.json();
      console.log('📨 Employee message response:', data);

      if (response.ok && data.success) {
        setMessages(prev => [...prev, data.data]);
        socket.emit('send-message', data.data); // Emit socket event
        scrollToBottom();
        loadChats(); // Refresh chat list
        console.log('✅ Employee message sent successfully');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Employee error sending message:', error);
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

  // Handle typing
  const handleTyping = () => {
    if (selectedChat && socket) {
      socket.emit('typing', {
        chatId: selectedChat._id,
        sender: 'admin',
        userName: 'Employee'
      });
    }
  };

  const handleStopTyping = () => {
    if (selectedChat && socket) {
      socket.emit('stop-typing', {
        chatId: selectedChat._id,
        sender: 'admin'
      });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (message) => {
    if (message.sender === 'user') return null;
    
    if (message.status?.read) {
      return <Icon as={FaCheckDouble} color="blue.500" boxSize={3} />;
    } else if (message.status?.delivered) {
      return <Icon as={FaCheckDouble} color="gray.500" boxSize={3} />;
    } else {
      return <Icon as={FaCheck} color="gray.400" boxSize={3} />;
    }
  };

  // Filter chats
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxW="full" p={0} h="100vh">
      <Flex h="100vh" bg={mainBgColor}>
        {/* Left Sidebar - Chat List */}
        <Box
          w={{ base: '100%', md: '400px' }}
          bg={bgColor}
          borderRight="1px solid"
          borderColor={borderColor}
          display={{ base: selectedChat ? 'none' : 'block', md: 'block' }}
        >
          {/* Header */}
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <HStack justify="space-between" mb={4}>
              <HStack spacing={3}>
                <IconButton
                  icon={<FaArrowLeft />}
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  title="Back to Dashboard"
                />
                <Heading size="lg" color={textColor}>
                  Customer Chat Support
                </Heading>
              </HStack>
              <HStack spacing={3}>
                <IconButton
                  icon={<FaSync />}
                  size="sm"
                  variant="ghost"
                  onClick={loadChats}
                  title="Refresh Chat List"
                  isLoading={isLoadingChats}
                />
                <IconButton
                  icon={<FaBars />}
                  size="sm"
                  variant="ghost"
                  display={{ base: 'block', md: 'none' }}
                  onClick={onOpen}
                />
              </HStack>
            </HStack>

            {/* Search */}
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBgColor}
              />
            </InputGroup>
          </Box>

          {/* Chat List */}
          <Box overflowY="auto" h="calc(100vh - 140px)">
            {isLoadingChats ? (
              <VStack spacing={4} align="center" justify="center" h="full">
                <Spinner size="lg" color="blue.500" />
                <Text color={subTextColor}>Loading conversations...</Text>
              </VStack>
            ) : filteredChats.length === 0 ? (
              <VStack spacing={4} align="center" justify="center" h="full">
                <Icon as={FaCommentDots} boxSize={12} color="gray.400" />
                <Text color={subTextColor} textAlign="center">
                  No conversations found
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Customers will appear here when they start chatting'
                  }
                </Text>
              </VStack>
            ) : (
              <VStack spacing={0} align="stretch">
                {filteredChats.map((chat) => (
                  <Box
                    key={chat._id}
                    p={4}
                    cursor="pointer"
                    bg={selectedChat?._id === chat._id ? chatBgColor : 'transparent'}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    _hover={{ bg: chatBgColor }}
                    position="relative"
                    group
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        name={chat.userName}
                        bg="blue.500"
                        color="white"
                      />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                          <HStack justify="space-between" w="full">
                            <HStack spacing={2}>
                              <Text
                                fontWeight="bold"
                                color={textColor}
                                fontSize="sm"
                                noOfLines={1}
                              >
                                {chat.userName}
                              </Text>
                              {blockedUsers.has(chat.userId) && (
                                <Badge colorScheme="red" size="sm">BLOCKED</Badge>
                              )}
                            </HStack>
                            <HStack spacing={1}>
                              {chat.unreadCount > 0 && (
                                <Badge
                                  colorScheme="red"
                                  borderRadius="full"
                                  minW={5}
                                  h={5}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontSize="xs"
                                >
                                  {chat.unreadCount}
                                </Badge>
                              )}
                              <Text fontSize="xs" color={subTextColor}>
                                {formatTime(chat.lastMessageAt)}
                              </Text>
                              <Button
                                size="xs"
                                colorScheme={blockedUsers.has(chat.userId) ? "green" : "red"}
                                variant="outline"
                                position="relative"
                                zIndex={10}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🔘 Button clicked!', { 
                                    userId: chat.userId, 
                                    userName: chat.userName,
                                    isBlocked: blockedUsers.has(chat.userId),
                                    chatObject: chat
                                  });
                                  if (blockedUsers.has(chat.userId)) {
                                    handleUnblockUser(chat.userId, chat.userName);
                                  } else {
                                    handleBlockUser(chat.userId, chat.userName);
                                  }
                                }}
                              >
                                {blockedUsers.has(chat.userId) ? "Unblock" : "Block"}
                              </Button>
                            </HStack>
                          </HStack>
                        <HStack justify="space-between" w="full">
                          <Text
                            fontSize="sm"
                            color={subTextColor}
                            noOfLines={1}
                            fontWeight={chat.unreadCount > 0 ? 'bold' : 'normal'}
                          >
                            {chat.lastMessage || 'No messages yet'}
                          </Text>
                          {chat.unreadCount > 0 && (
                            <Badge
                              colorScheme="blue"
                              borderRadius="full"
                              minW={5}
                              h={5}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                            >
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {chat.userEmail}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    {/* Click area for selecting chat */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      onClick={() => setSelectedChat(chat)}
                    />
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Box>

        {/* Right Side - Chat Area */}
        <Box
          flex={1}
          display={{ base: selectedChat ? 'block' : 'none', md: 'block' }}
          bg={bgColor}
        >
          {selectedChat ? (
            <VStack h="100vh" spacing={0}>
              {/* Chat Header */}
              <Box
                p={4}
                borderBottom="1px solid"
                borderColor={borderColor}
                w="full"
                bg={headerBgColor}
              >
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <IconButton
                      icon={<FaBars />}
                      size="sm"
                      variant="ghost"
                      display={{ base: 'block', md: 'none' }}
                      onClick={() => setSelectedChat(null)}
                    />
                    <Avatar
                      size="md"
                      name={selectedChat.userName}
                      bg="blue.500"
                      color="white"
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color={textColor}>
                        {selectedChat.userName}
                      </Text>
                      <Text fontSize="sm" color={subTextColor}>
                        {selectedChat.userEmail}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack>
                    <Badge
                      colorScheme={selectedChat.status === 'active' ? 'green' : 'gray'}
                      variant="subtle"
                    >
                      {selectedChat.status}
                    </Badge>
                  </HStack>
                </HStack>
              </Box>

              {/* Messages Area */}
              <Box
                flex={1}
                overflowY="auto"
                p={4}
                w="full"
                bg={messageAreaBgColor}
              >
                <VStack spacing={4} align="stretch">
                  {messages.map((message, index) => (
                    <Box key={index}>
                      {/* Date separator */}
                      {index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp) && (
                        <Text
                          textAlign="center"
                          fontSize="xs"
                          color={subTextColor}
                          bg={dateSeparatorBgColor}
                          px={3}
                          py={1}
                          borderRadius="full"
                          mx="auto"
                          mb={4}
                        >
                          {formatDate(message.timestamp)}
                        </Text>
                      )}
                      
                      {/* Message */}
                      <HStack
                        justify={message.sender === 'admin' ? 'flex-end' : 'flex-start'}
                        spacing={2}
                      >
                        {message.sender === 'user' && (
                          <Avatar size="xs" name={selectedChat.userName} />
                        )}
                        <VStack
                          align={message.sender === 'admin' ? 'flex-end' : 'flex-start'}
                          spacing={1}
                          maxW="70%"
                        >
                          <Box
                            bg={message.sender === 'admin' ? messageBgColor : userMessageBgColor}
                            color={message.sender === 'admin' ? 'white' : textColor}
                            px={4}
                            py={2}
                            borderRadius="lg"
                            position="relative"
                          >
                            <Text fontSize="sm">{message.message}</Text>
                          </Box>
                          <HStack spacing={1} fontSize="xs" color={subTextColor}>
                            <Text>{formatTime(message.timestamp)}</Text>
                            {getMessageStatusIcon(message)}
                          </HStack>
                        </VStack>
                        {message.sender === 'admin' && (
                          <Avatar size="xs" name="Employee" bg="green.500" />
                        )}
                      </HStack>
                    </Box>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <HStack spacing={2} align="center">
                      <Avatar size="xs" name={selectedChat.userName} />
                      <Box
                        bg={userMessageBgColor}
                        px={4}
                        py={2}
                        borderRadius="lg"
                      >
                        <Text fontSize="sm" color={subTextColor}>
                          {typingUser} is typing...
                        </Text>
                      </Box>
                    </HStack>
                  )}
                  
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>

              {/* Message Input */}
              <Box
                p={4}
                borderTop="1px solid"
                borderColor={borderColor}
                w="full"
                bg={headerBgColor}
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
                        handleStopTyping();
                      }
                    }}
                    onBlur={handleStopTyping}
                    bg={inputBgColor}
                  />
                  <IconButton
                    icon={<FaUpload />}
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
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
              </Box>
            </VStack>
          ) : (
            <VStack spacing={4} align="center" justify="center" h="full">
              <Icon as={FaCommentDots} boxSize={20} color="gray.400" />
              <Heading size="lg" color={subTextColor}>
                Select a conversation
              </Heading>
              <Text color={subTextColor} textAlign="center">
                Choose a conversation from the sidebar to start chatting with customers
              </Text>
            </VStack>
          )}
        </Box>
      </Flex>
    </Container>
  );
};

export default EmployeeChatDashboard;

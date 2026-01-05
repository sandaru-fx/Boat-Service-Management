/* eslint-disable react-hooks/rules-of-hooks */
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
  FaEllipsisV, FaCheck, FaCheckDouble, FaCircle, FaArrowUp, FaBars, FaMobile,
  FaTrash, FaExclamationTriangle, FaPlus
} from 'react-icons/fa';
import { io } from 'socket.io-client';

const AdminChatDashboard = () => {
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
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    resolvedChats: 0,
    totalMessages: 0
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();
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

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Admin initializing Socket.io connection...');
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Admin connected to chat server:', newSocket.id);
      newSocket.emit('admin-online');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Admin socket connection error:', error);
    });

    newSocket.on('receive-message', (data) => {
      console.log('📨 Admin received message:', data);
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
      console.log('🔌 Admin cleaning up socket connection');
      newSocket.emit('admin-offline');
      newSocket.close();
    };
  }, [selectedChat]);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat._id);
      markMessagesAsRead(selectedChat._id);
    }
  }, [selectedChat]);

  // Load chats
  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      console.log('📋 Loading chats...');
      const response = await fetch('http://localhost:5000/api/chat/admin/chats');
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
      const response = await fetch(`http://localhost:5000/api/chat/chat/${chatId}/messages`);
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
      await fetch(`http://localhost:5000/api/chat/chat/${chatId}/read`, {
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
      console.log('📤 Admin sending message:', { chatId: selectedChat._id, message: messageText });

      const response = await fetch(`http://localhost:5000/api/chat/chat/${selectedChat._id}/message`, {
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
      console.log('📨 Admin message response:', data);

      if (response.ok && data.success) {
        setMessages(prev => [...prev, data.data]);
        socket.emit('send-message', data.data); // Emit socket event
        scrollToBottom();
        loadChats(); // Refresh chat list
        console.log('✅ Admin message sent successfully');
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Admin error sending message:', error);
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
        userName: 'Admin'
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

  // Delete chat
  const deleteChat = async (chatId) => {
    try {
      console.log('🗑️ Deleting chat:', chatId);
      
      const response = await fetch(`http://localhost:5000/api/chat/chat/${chatId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('🗑️ Delete response:', data);

      if (response.ok && data.success) {
        // Remove chat from local state
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        
        // If deleted chat was selected, clear selection
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(null);
          setMessages([]);
        }

        toast({
          title: 'Chat Deleted',
          description: `Chat and ${data.deletedMessages} messages deleted successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Update stats
        loadChats();
      } else {
        throw new Error(data.message || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteChat = (chat) => {
    setChatToDelete(chat);
    onDeleteOpen();
  };

  // Confirm delete
  const confirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete._id);
      onDeleteClose();
      setChatToDelete(null);
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
      <Flex h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
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
              <Heading size="lg" color={textColor}>
                💬 Live Chat
              </Heading>
              <HStack spacing={3}>
                <Button 
                  as={Link}
                  to="/admin/create"
                  colorScheme="blue" 
                  size="sm"
                  leftIcon={<Icon as={FaPlus} />}
                  bgGradient="linear(to-r, blue.500, cyan.400)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.600, cyan.500)",
                    transform: "translateY(-1px)",
                    shadow: "md"
                  }}
                  transition="all 0.2s ease"
                >
                  Add Category
                </Button>
                <Button
                  size="sm"
                  onClick={loadChats}
                  isLoading={isLoadingChats}
                  leftIcon={<Icon as={FaArrowUp} />}
                >
                  Refresh
                </Button>
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
                bg={useColorModeValue('gray.50', 'gray.700')}
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
                    : 'Users will appear here when they start chatting'
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
                          <Text
                            fontWeight="bold"
                            color={textColor}
                            fontSize="sm"
                            noOfLines={1}
                          >
                            {chat.userName}
                          </Text>
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
                          </HStack>
                        </HStack>
                        <Text
                          fontSize="sm"
                          color={subTextColor}
                          noOfLines={1}
                          fontWeight={chat.unreadCount > 0 ? 'bold' : 'normal'}
                        >
                          {chat.lastMessage || 'No messages yet'}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {chat.userEmail}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    {/* Delete button - appears on hover */}
                    <IconButton
                      icon={<FaTrash />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      position="absolute"
                      top={2}
                      right={2}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat);
                      }}
                      aria-label="Delete chat"
                    />
                    
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
                bg={useColorModeValue('white', 'gray.800')}
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
                    <Menu>
                      <MenuButton as={IconButton} icon={<FaEllipsisV />} size="sm" variant="ghost" />
                      <MenuList>
                        <MenuItem icon={<FaUser />}>View Profile</MenuItem>
                        <MenuItem icon={<FaCheckCircle />}>Mark as Resolved</MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<FaTrash />} 
                          color="red.500"
                          onClick={() => handleDeleteChat(selectedChat)}
                        >
                          Delete Chat
                        </MenuItem>
                        <MenuItem color="red.500" icon={<FaExclamationTriangle />}>Block User</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </HStack>
              </Box>

              {/* Messages Area */}
              <Box
                flex={1}
                overflowY="auto"
                p={4}
                w="full"
                bg={useColorModeValue('gray.50', 'gray.700')}
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
                          bg={useColorModeValue('white', 'gray.600')}
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
                          <Avatar size="xs" name="Admin" bg="green.500" />
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
                bg={useColorModeValue('white', 'gray.800')}
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
                    bg={useColorModeValue('gray.50', 'gray.700')}
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
                Choose a conversation from the sidebar to start chatting
              </Text>
            </VStack>
          )}
        </Box>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <Drawer isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={3}>
              <Icon as={FaExclamationTriangle} color="red.500" boxSize={6} />
              <Text>Delete Chat</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Text color={subTextColor}>
                Are you sure you want to delete this chat? This action cannot be undone.
              </Text>
              
              {chatToDelete && (
                <Box p={4} bg={chatBgColor} borderRadius="md">
                  <HStack spacing={3}>
                    <Avatar
                      size="md"
                      name={chatToDelete.userName}
                      bg="blue.500"
                      color="white"
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color={textColor}>
                        {chatToDelete.userName}
                      </Text>
                      <Text fontSize="sm" color={subTextColor}>
                        {chatToDelete.userEmail}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {chatToDelete.messages?.length || 0} messages
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              <Text fontSize="sm" color="red.500" fontWeight="bold">
                ⚠️ This will permanently delete:
              </Text>
              <VStack align="start" spacing={1} pl={4}>
                <Text fontSize="sm" color={subTextColor}>• All messages in this chat</Text>
                <Text fontSize="sm" color={subTextColor}>• Chat history and data</Text>
                <Text fontSize="sm" color={subTextColor}>• User conversation record</Text>
              </VStack>

              <HStack spacing={3} pt={4}>
                <Button
                  variant="outline"
                  onClick={onDeleteClose}
                  flex={1}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmDelete}
                  flex={1}
                  leftIcon={<Icon as={FaTrash} />}
                >
                  Delete Chat
                </Button>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default AdminChatDashboard;
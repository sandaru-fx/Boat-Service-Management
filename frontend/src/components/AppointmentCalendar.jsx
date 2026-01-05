import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
  Tooltip,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

const AppointmentCalendar = ({ onDateSelect, selectedDate, disabled = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch booked dates for current month
  const fetchBookedDates = async (year, month) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/calendar/${year}/${month + 1}`);
      const data = await response.json();
      if (data.success) {
        setBookedDates(data.data.bookedDates || []);
        setFullyBookedDates(data.data.fullyBookedDates || []);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedDates(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in the past
  const isPastDate = (day) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < today.setHours(0, 0, 0, 0);
  };

  // Check if date is booked
  const isBooked = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedDates.includes(dateStr);
  };

  // Check if date is fully booked
  const isFullyBooked = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return fullyBookedDates.includes(dateStr);
  };

  // Check if date is selected
  const isSelected = (day) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return (
      day === selected.getDate() &&
      currentDate.getMonth() === selected.getMonth() &&
      currentDate.getFullYear() === selected.getFullYear()
    );
  };

  // Get date status
  const getDateStatus = (day) => {
    if (isPastDate(day)) return 'past';
    if (isFullyBooked(day)) return 'fully-booked';
    if (isBooked(day)) return 'partially-booked';
    return 'available';
  };

  // Handle date click
  const handleDateClick = (day) => {
    if (disabled || isPastDate(day) || isFullyBooked(day)) return;
    
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(selectedDate.toISOString().split('T')[0]);
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Box key={`empty-${i}`} h="60px" />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatus(day);
      const isSelectedDay = isSelected(day);
      const isTodayDay = isToday(day);

      days.push(
        <Box
          key={day}
          h="60px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor={status === 'available' || status === 'partially-booked' ? 'pointer' : 'not-allowed'}
          onClick={() => handleDateClick(day)}
          position="relative"
          borderRadius="lg"
          transition="all 0.2s ease"
          _hover={
            status === 'available' || status === 'partially-booked'
              ? {
                  transform: 'scale(1.05)',
                  shadow: 'lg',
                  zIndex: 10,
                }
              : {}
          }
          bg={
            isSelectedDay
              ? 'blue.500'
              : status === 'fully-booked'
              ? 'red.100'
              : status === 'partially-booked'
              ? 'yellow.100'
              : status === 'available'
              ? 'green.100'
              : 'gray.100'
          }
          border={
            isTodayDay
              ? '2px solid'
              : isSelectedDay
              ? '2px solid'
              : '1px solid'
          }
          borderColor={
            isTodayDay
              ? 'blue.500'
              : isSelectedDay
              ? 'blue.600'
              : status === 'fully-booked'
              ? 'red.300'
              : status === 'partially-booked'
              ? 'yellow.300'
              : status === 'available'
              ? 'green.300'
              : 'gray.300'
          }
          color={
            isSelectedDay
              ? 'white'
              : status === 'fully-booked'
              ? 'red.700'
              : status === 'partially-booked'
              ? 'yellow.700'
              : status === 'available'
              ? 'green.700'
              : 'gray.500'
          }
          fontWeight={isTodayDay || isSelectedDay ? 'bold' : 'normal'}
        >
          <VStack spacing={0}>
            <Text fontSize="sm" fontWeight="inherit">
              {day}
            </Text>
            {status === 'fully-booked' && (
              <Icon as={FaTimes} boxSize={2} color="red.500" />
            )}
            {status === 'partially-booked' && (
              <Icon as={FaClock} boxSize={2} color="yellow.500" />
            )}
            {status === 'available' && (
              <Icon as={FaCheck} boxSize={2} color="green.500" />
            )}
          </VStack>
        </Box>
      );
    }

    return days;
  };

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      shadow="lg"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        bgGradient: 'linear(to-r, blue.500, cyan.400)',
      }}
    >
      {/* Header */}
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={FaCalendarAlt} boxSize={5} color="blue.500" />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Select Appointment Date
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={FaChevronLeft} />}
              onClick={() => navigateMonth(-1)}
              disabled={loading}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              rightIcon={<Icon as={FaChevronRight} />}
              onClick={() => navigateMonth(1)}
              disabled={loading}
            >
              Next
            </Button>
          </HStack>
        </HStack>

        {/* Month/Year Display */}
        <Text fontSize="2xl" fontWeight="black" textAlign="center" color={textColor}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>

        {/* Loading State */}
        {loading && (
          <Flex justify="center" py={4}>
            <Spinner size="lg" color="blue.500" />
          </Flex>
        )}

        {/* Error State */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Calendar Grid */}
        {!loading && !error && (
          <>
            {/* Day Headers */}
            <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
              {dayNames.map((day) => (
                <Text
                  key={day}
                  textAlign="center"
                  fontWeight="bold"
                  color={mutedColor}
                  fontSize="sm"
                  py={2}
                >
                  {day}
                </Text>
              ))}
            </Grid>

            {/* Calendar Days */}
            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
              {generateCalendarDays()}
            </Grid>
          </>
        )}

        {/* Legend */}
        <VStack spacing={2} align="stretch" mt={6}>
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            Date Availability:
          </Text>
          <HStack spacing={4} justify="center" flexWrap="wrap">
            <HStack spacing={2}>
              <Box w={4} h={4} bg="green.100" border="1px solid" borderColor="green.300" borderRadius="sm" />
              <Text fontSize="sm" color={mutedColor}>Available</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={4} h={4} bg="yellow.100" border="1px solid" borderColor="yellow.300" borderRadius="sm" />
              <Text fontSize="sm" color={mutedColor}>Limited Slots</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={4} h={4} bg="red.100" border="1px solid" borderColor="red.300" borderRadius="sm" />
              <Text fontSize="sm" color={mutedColor}>Fully Booked</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w={4} h={4} bg="gray.100" border="1px solid" borderColor="gray.300" borderRadius="sm" />
              <Text fontSize="sm" color={mutedColor}>Past Date</Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Selected Date Info */}
        {selectedDate && (
          <Box
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            borderRadius="md"
            p={3}
            textAlign="center"
          >
            <Text fontSize="sm" color="blue.700">
              <strong>Selected Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AppointmentCalendar;















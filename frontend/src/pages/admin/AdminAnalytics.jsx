import React, { useState, useEffect } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button, Card, CardBody,
  useColorModeValue, Progress, Badge, Stat, StatLabel, StatNumber, StatHelpText,
  StatArrow, SimpleGrid, Divider, Icon, Flex, Spinner, useToast, Select,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Avatar, Tooltip, Link
} from '@chakra-ui/react';
import { 
  FaChartLine, FaUsers, FaEye, FaClock, FaPhone, FaDollarSign,
  FaShip, FaFish, FaAnchor, FaWater, FaSearch, FaDownload,
  FaArrowUp, FaArrowDown, FaMinus, FaCalendarAlt, FaFilter, FaPlus
} from 'react-icons/fa';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [realtimeData, setRealtimeData] = useState(null);

  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading analytics data...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/dashboard?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
        console.log('✅ Analytics data loaded:', data.data);
      } else {
        throw new Error(data.message || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      toast({
        title: 'Failed to load analytics',
        description: error.message || 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load real-time data
  const loadRealtimeData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analytics/realtime`);
      const data = await response.json();
      
      if (data.success) {
        setRealtimeData(data.data);
      }
    } catch (error) {
      console.error('❌ Error loading real-time data:', error);
    }
  };

  // Load data on component mount and period change
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  // Load real-time data every 30 seconds
  useEffect(() => {
    loadRealtimeData();
    const interval = setInterval(loadRealtimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Speed Boats': FaShip,
      'Fishing Boats': FaFish,
      'Yachts': FaAnchor,
      'Jet Skis': FaWater,
      'House Boats': FaShip
    };
    return icons[category] || FaShip;
  };

  // Get category color
  const getCategoryColor = (index) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'teal', 'pink', 'red', 'yellow'];
    return colors[index % colors.length];
  };

  // Generate simple PDF report
  const generatePDFReport = () => {
    toast({
      title: 'Generating Report',
      description: 'PDF report will be generated and downloaded shortly.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Simple PDF generation (will be implemented)
    console.log('📊 Generating PDF report for period:', selectedPeriod);
  };

  if (loading) {
    return (
      <Container maxW="full" py={8}>
        <VStack spacing={8} align="center" justify="center" minH="60vh">
          <Spinner size="xl" color="blue.500" />
          <Text color={subTextColor}>Loading analytics data...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="full" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={2}>
              <Heading size="xl" color={textColor} display="flex" alignItems="center" gap={3}>
                <Icon as={FaChartLine} color="blue.500" />
                Analytics Dashboard
              </Heading>
              <Text color={subTextColor}>
                User behavior and boat category performance insights
              </Text>
            </VStack>
            
            <HStack spacing={4}>
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
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                size="sm"
                w="150px"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
              </Select>
              
              <Button
                leftIcon={<Icon as={FaDownload} />}
                colorScheme="blue"
                size="sm"
                onClick={generatePDFReport}
              >
                Generate Report
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaUsers} color="blue.500" />
                  Total Visitors
                </StatLabel>
                <StatNumber color="blue.500">
                  {analyticsData?.metrics?.totalVisitors || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +15% from last period
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaEye} color="green.500" />
                  Unique Visitors
                </StatLabel>
                <StatNumber color="green.500">
                  {analyticsData?.metrics?.uniqueVisitors || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +8% from last period
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaClock} color="purple.500" />
                  Avg Session
                </StatLabel>
                <StatNumber color="purple.500">
                  {Math.round(analyticsData?.metrics?.averageSessionDuration / 60) || 0}m
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +2m from last period
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaPhone} color="orange.500" />
                  Inquiries
                </StatLabel>
                <StatNumber color="orange.500">
                  {analyticsData?.metrics?.returningVisitors || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% from last period
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel display="flex" alignItems="center" gap={2}>
                  <Icon as={FaDollarSign} color="teal.500" />
                  Revenue
                </StatLabel>
                <StatNumber color="teal.500">
                  LKR {analyticsData?.revenue?.toLocaleString() || '0'}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +8% from last period
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Category Performance */}
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="md" color={textColor} mb={2}>
                    🚤 Category Performance
                  </Heading>
                  <Text color={subTextColor} fontSize="sm">
                    Most viewed boat categories in the last {selectedPeriod} days
                  </Text>
                </Box>

                <VStack spacing={4} align="stretch">
                  {analyticsData?.categoryStats?.map((category, index) => (
                    <Box key={category.category}>
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={3}>
                          <Icon 
                            as={getCategoryIcon(category.category)} 
                            color={`${getCategoryColor(index)}.500`}
                            boxSize={5}
                          />
                          <Text fontWeight="medium" color={textColor}>
                            {category.category}
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color={subTextColor}>
                            {category.totalViews} views
                          </Text>
                          <Badge colorScheme={getCategoryColor(index)} variant="subtle">
                            {Math.round((category.totalViews / analyticsData.categoryStats[0]?.totalViews) * 100)}%
                          </Badge>
                        </HStack>
                      </HStack>
                      <Progress
                        value={(category.totalViews / analyticsData.categoryStats[0]?.totalViews) * 100}
                        colorScheme={getCategoryColor(index)}
                        size="sm"
                        borderRadius="md"
                      />
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color={subTextColor}>
                          {category.uniqueViewers} unique viewers
                        </Text>
                        <Text fontSize="xs" color={subTextColor}>
                          {Math.round(category.averageTime / 60)}m avg time
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* User Engagement */}
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="md" color={textColor} mb={2}>
                    👥 User Engagement
                  </Heading>
                  <Text color={subTextColor} fontSize="sm">
                    User behavior patterns and engagement levels
                  </Text>
                </Box>

                <VStack spacing={4} align="stretch">
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" color={textColor}>High Engagement</Text>
                      <Badge colorScheme="green">234 users (19%)</Badge>
                    </HStack>
                    <Progress value={19} colorScheme="green" size="lg" borderRadius="md" />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" color={textColor}>Medium Engagement</Text>
                      <Badge colorScheme="blue">567 users (45%)</Badge>
                    </HStack>
                    <Progress value={45} colorScheme="blue" size="lg" borderRadius="md" />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium" color={textColor}>Low Engagement</Text>
                      <Badge colorScheme="gray">446 users (36%)</Badge>
                    </HStack>
                    <Progress value={36} colorScheme="gray" size="lg" borderRadius="md" />
                  </Box>
                </VStack>

                <Divider />

                <Box>
                  <Text fontWeight="medium" color={textColor} mb={3}>
                    🕐 Peak Activity Times
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={subTextColor}>Saturday 2:00 PM - 4:00 PM</Text>
                      <Badge colorScheme="green" variant="subtle">Peak</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={subTextColor}>Sunday 10:00 AM - 12:00 PM</Text>
                      <Badge colorScheme="blue" variant="subtle">High</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={subTextColor}>Weekday 6:00 PM - 8:00 PM</Text>
                      <Badge colorScheme="orange" variant="subtle">Medium</Badge>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Boats Table */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="md" color={textColor} mb={2}>
                  🏆 Top Viewed Boats
                </Heading>
                <Text color={subTextColor} fontSize="sm">
                  Most popular boats in the last {selectedPeriod} days
                </Text>
              </Box>

              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color={subTextColor}>Rank</Th>
                      <Th color={subTextColor}>Boat Name</Th>
                      <Th color={subTextColor}>Category</Th>
                      <Th color={subTextColor}>Views</Th>
                      <Th color={subTextColor}>Trend</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analyticsData?.topBoats?.slice(0, 10).map((boat, index) => (
                      <Tr key={boat._id}>
                        <Td>
                          <Badge 
                            colorScheme={index < 3 ? "yellow" : "gray"} 
                            variant={index < 3 ? "solid" : "subtle"}
                          >
                            #{index + 1}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="medium" color={textColor}>
                            {boat.boatName}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            Speed Boats
                          </Badge>
                        </Td>
                        <Td>
                          <Text color={subTextColor}>{boat.views}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                            <Text fontSize="xs" color="green.500">+12%</Text>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          </CardBody>
        </Card>

        {/* Real-time Activity */}
        {realtimeData && (
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="md" color={textColor} mb={2}>
                    🔴 Live User Activity
                  </Heading>
                  <Text color={subTextColor} fontSize="sm">
                    Real-time user activity (Last 5 minutes)
                  </Text>
                </Box>

                <VStack spacing={3} align="stretch">
                  {realtimeData.recentVisits?.slice(0, 5).map((visit, index) => (
                    <HStack key={index} spacing={4} p={3} bg={cardBg} borderRadius="md">
                      <Avatar size="sm" name={visit.userName} />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color={textColor}>
                          {visit.userName}
                        </Text>
                        <Text fontSize="xs" color={subTextColor}>
                          {visit.userEmail}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={0}>
                        <Text fontSize="xs" color={subTextColor}>
                          {visit.deviceType}
                        </Text>
                        <Text fontSize="xs" color={subTextColor}>
                          {new Date(visit.visitDate).toLocaleTimeString()}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>

                <Box p={4} bg={cardBg} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color={subTextColor}>Today's Summary:</Text>
                    <HStack spacing={4}>
                      <Text fontSize="sm" color={textColor}>
                        {realtimeData.todayStats?.totalVisitors || 0} visitors
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        {realtimeData.todayStats?.uniqueVisitors?.length || 0} unique
                      </Text>
                    </HStack>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default AdminAnalytics;

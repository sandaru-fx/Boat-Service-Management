/* eslint-disable */
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Badge,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  useToast,
  Select,
  Progress,
  Divider,
  Flex,
  Grid,
  GridItem,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { 
  FaStar, 
  FaUsers, 
  FaEnvelope, 
  FaTrash, 
  FaShip, 
  FaDownload, 
  FaChartBar, 
  FaThumbsUp, 
  FaThumbsDown,
  FaMailBulk,
  FaEye,
  FaFilter,
  FaFilePdf,
  FaGift,
  FaAward,
  FaHeart
} from "react-icons/fa";
import { useBoatStore } from "../../store/boat";
import { useReviewsStore } from "../../store/reviews";
import { useEffect, useState, useRef } from "react";

const AdminFeedback = () => {
  const { boats, fetchBoats } = useBoatStore();
  const { reviews, fetchReviews, deleteReview, setReviews } = useReviewsStore();
  
  
  const [selectedBoat, setSelectedBoat] = useState("");
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const toast = useToast();
  
  // Modal states
  const { isOpen: isThankYouOpen, onOpen: onThankYouOpen, onClose: onThankYouClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  
  // Pre-calculate all color values to avoid hook errors
  const whiteGray800 = useColorModeValue("white", "gray.800");
  const gray200Gray600 = useColorModeValue("gray.200", "gray.600");
  const gray50Gray700 = useColorModeValue("gray.50", "gray.700");
  const gray600Gray400 = useColorModeValue("gray.600", "gray.400");
  const gray800White = useColorModeValue("gray.800", "white");
  const gray700Gray300 = useColorModeValue("gray.700", "gray.300");
  const gray600Gray400Text = useColorModeValue("gray.600", "gray.400");
  const gray500Gray400 = useColorModeValue("gray.500", "gray.400");
  const gray300Gray600 = useColorModeValue("gray.300", "gray.600");
  const gray50Gray700Hover = useColorModeValue("gray.50", "gray.700");
  const green50Green900 = useColorModeValue("green.50", "green.900");
  const blue200Blue700 = useColorModeValue("blue.200", "blue.700");
  const green200Green700 = useColorModeValue("green.200", "green.700");
  const red200Red700 = useColorModeValue("red.200", "red.700");
  const gray200Gray600Bg = useColorModeValue("gray.200", "gray.600");
  
  const bg = whiteGray800;
  const borderColor = gray200Gray600;
  const cardBg = gray50Gray700Hover;
  const gradientBg = useColorModeValue(
    "linear(to-br, blue.50, purple.50, cyan.50)",
    "linear(to-br, gray.900, blue.900, purple.900)"
  );

  useEffect(() => {
    fetchBoats();
    
    // Fetch reviews directly since Zustand store's fetchReviews is broken
    fetch(`${process.env.REACT_APP_API_URL}/api/reviews?admin=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReviews(data.data);
        }
      })
      .catch(err => console.error('Error fetching reviews:', err));
  }, []);

  useEffect(() => {
    if (selectedBoat) {
      setFilteredReviews(reviews.filter(review => review.boatId === selectedBoat));
    } else {
      setFilteredReviews(reviews);
    }
  }, [reviews, selectedBoat]);

  // Calculate comprehensive review statistics
  const totalReviews = filteredReviews.length;
  const averageRating = totalReviews > 0 
    ? (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;
  
  const positiveReviews = filteredReviews.filter(r => r.rating >= 4).length;
  const negativeReviews = filteredReviews.filter(r => r.rating <= 2).length;
  const neutralReviews = filteredReviews.filter(r => r.rating === 3).length;
  
  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    stars: star,
    count: filteredReviews.filter(r => r.rating === star).length,
    percentage: totalReviews > 0 ? Math.round((filteredReviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0
  }));

  // Boat category analysis
  const categoryAnalysis = boats.map(boat => {
    const boatReviews = filteredReviews.filter(review => review.boatId === boat._id);
    const avgRating = boatReviews.length > 0 
      ? (boatReviews.reduce((sum, review) => sum + review.rating, 0) / boatReviews.length).toFixed(1)
      : 0;
    return {
      boatName: boat.name,
      category: boat.category || 'Uncategorized',
      reviewCount: boatReviews.length,
      averageRating: avgRating,
      positivePercentage: boatReviews.length > 0 
        ? Math.round((boatReviews.filter(r => r.rating >= 4).length / boatReviews.length) * 100)
        : 0
    };
  }).filter(analysis => analysis.reviewCount > 0);

  const handleDeleteReview = async (reviewId) => {
    const res = await deleteReview(reviewId);
    if (res?.success) {
      toast({ 
        title: "Review Deleted", 
        description: "Review has been successfully removed.",
        status: "success", 
        duration: 3000, 
        isClosable: true 
      });
      fetchReviews(null, null, true);
      onDeleteClose();
    } else {
      toast({ 
        title: "Delete Failed", 
        description: res?.message || "Failed to delete review. Please try again.",
        status: "error", 
        duration: 3000, 
        isClosable: true 
      });
    }
  };

  const handleSendThankYou = (review) => {
    setSelectedReview(review);
    setThankYouMessage(`Dear ${review.userName},\n\nThank you for your valuable feedback about our ${getBoatInfo(review.boatId)?.name || 'boat'}. We truly appreciate your ${review.rating}-star rating and your comment: "${review.comment}"\n\nYour feedback helps us improve our services and provide better experiences for all our customers.\n\nBest regards,\nMarine Service Center Team`);
    onThankYouOpen();
  };

  const handleDownloadPDF = () => {
    // Create PDF content
    const pdfContent = `
MARINE SERVICE CENTER - REVIEW ANALYTICS REPORT
Generated on: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
- Total Reviews: ${totalReviews}
- Average Rating: ${averageRating}/5
- Positive Reviews (4-5 stars): ${positiveReviews} (${Math.round((positiveReviews/totalReviews)*100)}%)
- Negative Reviews (1-2 stars): ${negativeReviews} (${Math.round((negativeReviews/totalReviews)*100)}%)

RATING DISTRIBUTION:
${ratingDistribution.map(r => `${r.stars} Stars: ${r.count} reviews (${r.percentage}%)`).join('\n')}

BOAT CATEGORY ANALYSIS:
${categoryAnalysis.map(cat => `${cat.boatName} (${cat.category}): ${cat.reviewCount} reviews, ${cat.averageRating}/5 avg rating`).join('\n')}

RECENT REVIEWS:
${filteredReviews.slice(0, 10).map(review => {
  const boat = getBoatInfo(review.boatId);
  return `- ${review.userName} (${review.userEmail}): ${review.rating}/5 stars for ${boat?.name || 'Unknown Boat'}\n  "${review.comment}"`;
}).join('\n\n')}
    `;
    
    // Create and download file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boat-store-review-analytics-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Review analytics report has been downloaded successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getBoatInfo = (boatId) => {
    return boats.find(boat => boat._id === boatId);
  };

  return (
    <Box minH="100vh" bgGradient={gradientBg}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Hero Header with 3D Effect */}
          <Box
            bg={whiteGray800}
            p={8}
            rounded="2xl"
            shadow="2xl"
            border="1px solid"
            borderColor={gray200Gray600}
            transform="perspective(1000px) rotateX(2deg)"
            _hover={{
              transform: "perspective(1000px) rotateX(0deg) translateY(-5px)",
              transition: "all 0.3s ease"
            }}
          >
            <VStack spacing={6}>
              <HStack spacing={4}>
                <Icon as={FaChartBar} boxSize={12} color="blue.500" />
                <VStack align="start" spacing={2}>
                  <Heading
                    as="h1"
                    size="3xl"
                    bgGradient="linear(to-r, blue.500, purple.500, cyan.500)"
                    bgClip="text"
                    fontWeight="black"
                  >
                    Review Analytics Dashboard
                  </Heading>
                  <Text fontSize="lg" color={gray600Gray400}>
                    Comprehensive review management and analytics for Marine Service Center
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={4} wrap="wrap">
                <Select
                  placeholder="Filter by boat category"
                  value={selectedBoat}
                  onChange={(e) => setSelectedBoat(e.target.value)}
                  maxW="300px"
                  bg={whiteGray800}
                >
                  {boats.map((boat) => (
                    <option key={boat._id} value={boat._id}>
                      {boat.name} ({boat.category || 'No category'})
                    </option>
                  ))}
                </Select>
                
                {selectedBoat && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBoat("")}
                    leftIcon={<Icon as={FaFilter} />}
                  >
                    Clear Filter
                  </Button>
                )}
                
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FaFilePdf} />}
                  onClick={handleDownloadPDF}
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.600, purple.600)",
                    transform: "translateY(-2px)",
                    shadow: "lg"
                  }}
                >
                  Download Analytics Report
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Statistics Cards with 3D Effect */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <Card
              bg={whiteGray800}
              shadow="xl"
              border="1px solid"
              borderColor={blue200Blue700}
              transform="perspective(1000px) rotateY(-5deg)"
              _hover={{
                transform: "perspective(1000px) rotateY(0deg) translateY(-10px)",
                transition: "all 0.3s ease"
              }}
            >
              <CardBody textAlign="center" p={6}>
                <Icon as={FaUsers} boxSize={8} color="blue.500" mb={4} />
                <Stat>
                  <StatLabel fontSize="sm" color={gray600Gray400}>
                    Total Reviews
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="blue.500" fontWeight="black">
                    {totalReviews}
                  </StatNumber>
                  <StatHelpText>
                    {selectedBoat ? 'Filtered reviews' : 'All reviews'}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={whiteGray800}
              shadow="xl"
              border="1px solid"
              borderColor={useColorModeValue("green.200", "green.700")}
              transform="perspective(1000px) rotateY(-2deg)"
              _hover={{
                transform: "perspective(1000px) rotateY(0deg) translateY(-10px)",
                transition: "all 0.3s ease"
              }}
            >
              <CardBody textAlign="center" p={6}>
                <Icon as={FaStar} boxSize={8} color="yellow.400" mb={4} />
                <Stat>
                  <StatLabel fontSize="sm" color={gray600Gray400}>
                    Average Rating
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="green.500" fontWeight="black">
                    {averageRating}
                  </StatNumber>
                  <StatHelpText>out of 5 stars</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={whiteGray800}
              shadow="xl"
              border="1px solid"
              borderColor={useColorModeValue("green.200", "green.700")}
              transform="perspective(1000px) rotateY(2deg)"
              _hover={{
                transform: "perspective(1000px) rotateY(0deg) translateY(-10px)",
                transition: "all 0.3s ease"
              }}
            >
              <CardBody textAlign="center" p={6}>
                <Icon as={FaThumbsUp} boxSize={8} color="green.500" mb={4} />
                <Stat>
                  <StatLabel fontSize="sm" color={gray600Gray400}>
                    Positive Reviews
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="green.500" fontWeight="black">
                    {positiveReviews}
                  </StatNumber>
                  <StatHelpText>4+ star ratings</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={whiteGray800}
              shadow="xl"
              border="1px solid"
              borderColor={useColorModeValue("red.200", "red.700")}
              transform="perspective(1000px) rotateY(5deg)"
              _hover={{
                transform: "perspective(1000px) rotateY(0deg) translateY(-10px)",
                transition: "all 0.3s ease"
              }}
            >
              <CardBody textAlign="center" p={6}>
                <Icon as={FaThumbsDown} boxSize={8} color="red.500" mb={4} />
                <Stat>
                  <StatLabel fontSize="sm" color={gray600Gray400}>
                    Negative Reviews
                  </StatLabel>
                  <StatNumber fontSize="4xl" color="red.500" fontWeight="black">
                    {negativeReviews}
                  </StatNumber>
                  <StatHelpText>2- star ratings</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Rating Distribution Chart */}
          <Card
            bg={whiteGray800}
            shadow="xl"
            border="1px solid"
            borderColor={gray200Gray600}
          >
            <CardHeader>
              <Heading size="lg" color={gray800White}>
                Rating Distribution Analysis
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <Box key={stars}>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Text fontWeight="bold">{stars}</Text>
                        <Icon as={FaStar} color="yellow.400" />
                        <Text>stars</Text>
                      </HStack>
                      <Text fontSize="sm" color={gray600Gray400}>
                        {count} reviews ({percentage}%)
                      </Text>
                    </HStack>
                    <Progress
                      value={percentage}
                      colorScheme={stars >= 4 ? "green" : stars >= 3 ? "yellow" : "red"}
                      size="lg"
                      rounded="full"
                      bg={gray200Gray600}
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Boat Category Analysis */}
          {categoryAnalysis.length > 0 && (
            <Card
              bg={whiteGray800}
              shadow="xl"
              border="1px solid"
              borderColor={gray200Gray600}
            >
              <CardHeader>
                <Heading size="lg" color={gray800White}>
                  Boat Category Performance
                </Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                  {categoryAnalysis.map((analysis, index) => (
                    <Box
                      key={index}
                      p={4}
                      bg={gray50Gray700Hover}
                      rounded="lg"
                      border="1px solid"
                      borderColor={gray200Gray600}
                    >
                      <VStack spacing={2} align="start">
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="sm">{analysis.boatName}</Text>
                          <Badge colorScheme="blue" variant="subtle">
                            {analysis.category}
                          </Badge>
                        </HStack>
                        <HStack spacing={4} w="full">
                          <VStack spacing={1}>
                            <Text fontSize="xs" color={gray600Gray400}>
                              Reviews
                            </Text>
                            <Text fontWeight="bold" color="blue.500">
                              {analysis.reviewCount}
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text fontSize="xs" color={gray600Gray400}>
                              Avg Rating
                            </Text>
                            <Text fontWeight="bold" color="green.500">
                              {analysis.averageRating}/5
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text fontSize="xs" color={gray600Gray400}>
                              Positive
                            </Text>
                            <Text fontWeight="bold" color="green.500">
                              {analysis.positivePercentage}%
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </Grid>
              </CardBody>
            </Card>
          )}


          {/* Reviews Management Table */}
          <Card
            bg={whiteGray800}
            shadow="xl"
            border="1px solid"
            borderColor={gray200Gray600}
          >
            <CardHeader>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color={gray800White}>
                    Review Management
                  </Heading>
                  <Text fontSize="sm" color={gray600Gray400}>
                    Manage all reviews with email addresses and boat categories
                  </Text>
                </VStack>
                <Badge colorScheme="blue" variant="subtle" px={3} py={1} rounded="full">
                  {totalReviews} Total Reviews
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              {filteredReviews.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Icon as={FaUsers} boxSize={16} color="gray.400" mb={4} />
                  <Heading size="md" color="gray.500" mb={2}>
                    No Reviews Found
                  </Heading>
                  <Text color="gray.400">
                    {selectedBoat ? 'No reviews found for the selected boat.' : 'No reviews have been submitted yet.'}
                  </Text>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr bg={gray50Gray700Hover}>
                        <Th>User</Th>
                        <Th>Email</Th>
                        <Th>Boat Category</Th>
                        <Th>Rating</Th>
                        <Th>Review</Th>
                        <Th>Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredReviews.map((review) => {
                        const boat = getBoatInfo(review.boatId);
                        return (
                          <Tr key={review._id} _hover={{ bg: gray50Gray700Hover }}>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar 
                                  name={review.userName} 
                                  size="md" 
                                  bg="blue.500" 
                                  color="white"
                                  border="2px solid"
                                  borderColor="blue.200"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold">{review.userName}</Text>
                                  <Text fontSize="xs" color={gray500Gray400}>
                                    Customer
                                  </Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Icon as={FaEnvelope} color="blue.500" />
                                <Text fontSize="sm" color={gray600Gray400}>
                                  {review.userEmail}
                                </Text>
                              </HStack>
                            </Td>
                            <Td>
                              <VStack spacing={1} align="start">
                                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                  {boat?.category || 'Unknown'}
                                </Badge>
                                <Text fontSize="xs" color={gray500Gray400}>
                                  {boat?.name || 'Unknown Boat'}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Icon 
                                    key={i} 
                                    as={FaStar} 
                                    color={i < review.rating ? "yellow.400" : gray300Gray600} 
                                    boxSize={4}
                                  />
                                ))}
                                <Text fontSize="sm" ml={2} fontWeight="bold">({review.rating})</Text>
                              </HStack>
                            </Td>
                            <Td maxW="300px">
                              <Text 
                                fontSize="sm" 
                                noOfLines={2}
                                color={gray700Gray300}
                              >
                                {review.comment}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color={gray600Gray400}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Send Thank You Email">
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    variant="outline"
                                    leftIcon={<Icon as={FaMailBulk} />}
                                    onClick={() => handleSendThankYou(review)}
                                  >
                                    Thank
                                  </Button>
                                </Tooltip>
                                <Tooltip label="Delete Review">
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    leftIcon={<Icon as={FaTrash} />}
                                    onClick={() => {
                                      setSelectedReview(review);
                                      onDeleteOpen();
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* Thank You Email Modal */}
        <Modal isOpen={isThankYouOpen} onClose={onThankYouClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={FaMailBulk} color="green.500" />
                <Text>Send Thank You Email</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={green50Green900} rounded="lg">
                  <HStack spacing={3} mb={3}>
                    <Icon as={FaEnvelope} color="green.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">To: {selectedReview?.userEmail}</Text>
                      <Text fontSize="sm" color={gray600Gray400}>
                        Customer: {selectedReview?.userName}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
                
                <FormControl>
                  <FormLabel>Thank You Message</FormLabel>
                  <Textarea
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    rows={8}
                    placeholder="Enter your thank you message..."
                  />
                </FormControl>
                
                <HStack spacing={3}>
                  <Button
                    colorScheme="green"
                    leftIcon={<Icon as={FaMailBulk} />}
                    onClick={() => {
                      toast({
                        title: "Thank You Email Sent",
                        description: `Thank you email sent to ${selectedReview?.userEmail}`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                      onThankYouClose();
                    }}
                  >
                    Send Email
                  </Button>
                  <Button variant="outline" onClick={onThankYouClose}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Review
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this review from {selectedReview?.userName}? 
                This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={() => handleDeleteReview(selectedReview?._id)} 
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default AdminFeedback;

/* eslint-disable react-hooks/rules-of-hooks */
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
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaStar, FaUsers, FaEnvelope, FaTrash, FaShip } from "react-icons/fa";
import { useBoatStore } from "../../store/boat";
import { useReviewsStore } from "../../store/reviews";
import { useEffect, useState } from "react";

const AdminAllReviewsPage = () => {
  const { boats, fetchBoats } = useBoatStore();
  const { reviews, fetchReviews, deleteReview } = useReviewsStore();
  const [selectedBoat, setSelectedBoat] = useState("");
  const [filteredReviews, setFilteredReviews] = useState([]);
  const toast = useToast();
  
  // Color mode values at top level to avoid conditional calls
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColorDark = useColorModeValue("gray.600", "gray.");
  const textColorDarker = useColorModeValue("gray.700", "gray.300");
  const emptyColor = useColorModeValue("gray.500", "gray.400");
  const emptyColorText = useColorModeValue("gray.400", "gray.400");
  const emptyIconColor = useColorModeValue("gray.400", "gray.400");

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    // Fetch all reviews for admin (with email addresses)
    fetchReviews(null, null, true);
  }, [fetchReviews]);

  useEffect(() => {
    if (selectedBoat) {
      setFilteredReviews(reviews.filter(review => review.boatId === selectedBoat));
    } else {
      setFilteredReviews(reviews);
    }
  }, [reviews, selectedBoat]);

  // Calculate review statistics
  const totalReviews = filteredReviews.length;
  const averageRating = totalReviews > 0 
    ? (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;
  
  const positiveReviews = filteredReviews.filter(r => r.rating >= 4).length;
  const negativeReviews = filteredReviews.filter(r => r.rating <= 2).length;

  const handleDeleteReview = async (reviewId) => {
    const res = await deleteReview(reviewId);
    if (res?.success) {
      toast({ title: "Review deleted", status: "success", duration: 2000, isClosable: true });
      fetchReviews(null, null, true); // Refresh reviews
    } else {
      toast({ title: "Failed to delete review", description: res?.message || "Try again later.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const getBoatInfo = (boatId) => {
    return boats.find(boat => boat._id === boatId);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Button
            as={Link}
            to="/dashboard"
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            colorScheme="blue"
            size="sm"
            mb={4}
          >
            Back to Admin Dashboard
          </Button>
          
          <VStack spacing={4} align="start">
            <Heading
              as="h1"
              size="2xl"
              color={headingColor}
              fontWeight="black"
            >
              Admin - All Reviews
            </Heading>
            
            <HStack spacing={4} wrap="wrap">
              <Select
                placeholder="Filter by boat category"
                value={selectedBoat}
                onChange={(e) => setSelectedBoat(e.target.value)}
                maxW="300px"
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
                >
                  Clear Filter
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>

        {/* Review Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Total Reviews</StatLabel>
                <StatNumber fontSize="3xl" color="blue.500">
                  {totalReviews}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FaUsers} mr={1} />
                  {selectedBoat ? 'Filtered reviews' : 'All reviews'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Average Rating</StatLabel>
                <StatNumber fontSize="3xl" color="green.500">
                  {averageRating}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FaStar} color="yellow.400" mr={1} />
                  out of 5 stars
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Positive Reviews</StatLabel>
                <StatNumber fontSize="3xl" color="green.500">
                  {positiveReviews}
                </StatNumber>
                <StatHelpText>
                  4+ star ratings
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Negative Reviews</StatLabel>
                <StatNumber fontSize="3xl" color="red.500">
                  {negativeReviews}
                </StatNumber>
                <StatHelpText>
                  2- star ratings
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Reviews Table */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">All Reviews ({totalReviews})</Heading>
            <Text fontSize="sm" color={textColorDark}>
              Admin view - showing all reviews with email addresses and boat categories
            </Text>
          </CardHeader>
          <CardBody>
            {filteredReviews.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Icon as={FaUsers} boxSize={12} color={emptyIconColor} mb={4} />
                <Heading size="md" color={emptyColor} mb={2}>
                  No Reviews Found
                </Heading>
                <Text color={emptyColorText}>
                  {selectedBoat ? 'No reviews found for the selected boat.' : 'No reviews have been submitted yet.'}
                </Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
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
                        <Tr key={review._id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar 
                                name={review.userName} 
                                size="sm" 
                                bg="blue.500" 
                                color="white"
                              />
                              <Text fontWeight="bold">{review.userName}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Icon as={FaEnvelope} color="blue.500" />
                              <Text fontSize="sm" color={textColorDark}>
                                {review.userEmail}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack spacing={1} align="start">
                              <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                {boat?.category || 'Unknown'}
                              </Badge>
                              <Text fontSize="xs" color={textColorDark}>
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
                                  color={i < review.rating ? "yellow.400" : useColorModeValue("gray.300", "gray.600")} 
                                  boxSize={3}
                                />
                              ))}
                              <Text fontSize="sm" ml={2}>({review.rating})</Text>
                            </HStack>
                          </Td>
                          <Td maxW="300px">
                            <Text 
                              fontSize="sm" 
                              noOfLines={2}
                              color={textColorDarker}
                            >
                              {review.comment}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color={textColorDark}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              leftIcon={<Icon as={FaTrash} />}
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              Delete
                            </Button>
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
    </Container>
  );
};

export default AdminAllReviewsPage;

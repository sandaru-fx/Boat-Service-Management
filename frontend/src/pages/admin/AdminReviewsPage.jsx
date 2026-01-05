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
} from "@chakra-ui/react";
/* eslint-disable react-hooks/rules-of-hooks */
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaStar, FaUsers, FaEnvelope, FaTrash } from "react-icons/fa";
import { useBoatStore } from "../../store/boat";
import { useReviewsStore } from "../../store/reviews";
import { useEffect, useState } from "react";

const AdminReviewsPage = () => {
  const { id } = useParams();
  const { boats, fetchBoats } = useBoatStore();
  const { reviews, fetchReviews, deleteReview } = useReviewsStore();
  const [boat, setBoat] = useState(null);
  const toast = useToast();
  
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    if (boats.length > 0) {
      const foundBoat = boats.find(b => b._id === id);
      setBoat(foundBoat);
    }
  }, [boats, id]);

  useEffect(() => {
    if (id) {
      // Fetch all reviews for admin (with email addresses)
      fetchReviews(id, null, true);
    }
  }, [id, fetchReviews]);

  if (!boat) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Text fontSize="xl">Loading boat details...</Text>
          <Button as={Link} to="/admin" leftIcon={<Icon as={FaArrowLeft} />}>
            Back to Admin
          </Button>
        </VStack>
      </Container>
    );
  }

  // Calculate review statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;
  
  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const negativeReviews = reviews.filter(r => r.rating <= 2).length;

  const handleDeleteReview = async (reviewId) => {
    const res = await deleteReview(reviewId);
    if (res?.success) {
      toast({ title: "Review deleted", status: "success", duration: 2000, isClosable: true });
      fetchReviews(id, null, true); // Refresh reviews
    } else {
      toast({ title: "Failed to delete review", description: res?.message || "Try again later.", status: "error", duration: 3000, isClosable: true });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Button
            as={Link}
            to="/admin"
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
              color={useColorModeValue("gray.800", "white")}
              fontWeight="black"
            >
              Admin - Reviews for {boat.name}
            </Heading>
            
            <VStack spacing={2} align="start">
              <HStack spacing={4}>
                <Badge colorScheme="blue" px={3} py={1} rounded="full" fontSize="md">
                  Category: {boat.category || 'Not specified'}
                </Badge>
                <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.400")}>
                  Price: LKR {boat.price?.toLocaleString()}
                </Text>
              </HStack>
              {boat.model && (
                <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")}>
                  Model: {boat.model}
                </Text>
              )}
            </VStack>
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
                  All reviews
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
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              Admin view - showing all reviews with email addresses
            </Text>
          </CardHeader>
          <CardBody>
            {reviews.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Icon as={FaUsers} boxSize={12} color="gray.400" mb={4} />
                <Heading size="md" color="gray.500" mb={2}>
                  No Reviews Yet
                </Heading>
                <Text color="gray.400">
                  No reviews have been submitted for this boat yet.
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
                    {reviews.map((review) => (
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
                            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                              {review.userEmail}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="green" variant="subtle" fontSize="xs">
                            {boat.category || 'Not specified'}
                          </Badge>
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
                            color={useColorModeValue("gray.700", "gray.300")}
                          >
                            {review.comment}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
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
                    ))}
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

export default AdminReviewsPage;

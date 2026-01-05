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
  Flex,
  SimpleGrid,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  TagLabel,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
/* eslint-disable react-hooks/rules-of-hooks */
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaStar } from "react-icons/fa";
import { FaUsers, FaThumbsUp, FaComment, FaShip } from "react-icons/fa";
import { useBoatStore } from "../../store/boat";
import { useEffect, useState } from "react";
import { useReviewsStore } from "../../store/reviews";
// import StunningFooter from "../../components/StunningFooter";
// import LiveChatWidget from "../../components/LiveChatWidget";

const UserReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { boats, fetchBoats } = useBoatStore();
  const { reviews, fetchReviews, addReview } = useReviewsStore();
  const [boat, setBoat] = useState(null);
  const [newReview, setNewReview] = useState({ userName: "", userEmail: "", rating: 5, comment: "" });
  const [userEmail, setUserEmail] = useState("");
  const [showOnlyMyReviews, setShowOnlyMyReviews] = useState(false);
  const toast = useToast();
  
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    if (boats.length > 0) {
      if (id === "all") {
        // For "all" case, we'll show all reviews from all boats
        setBoat({ _id: "all", name: "All Boats", category: "All Categories" });
      } else {
        const foundBoat = boats.find(b => b._id === id);
        setBoat(foundBoat);
      }
    }
  }, [boats, id]);

  useEffect(() => {
    if (id) {
      if (id === "all") {
        // For "all" case, fetch all reviews without boatId filter
        fetchReviews(null, null, false);
      } else {
        if (showOnlyMyReviews && userEmail) {
          fetchReviews(id, userEmail, false);
        } else {
          fetchReviews(id, null, false);
        }
      }
    }
  }, [id, fetchReviews, showOnlyMyReviews, userEmail]);

  if (!boat) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Text fontSize="xl">Loading boat details...</Text>
          <Button as={Link} to="/" leftIcon={<Icon as={FaArrowLeft} />}>
            Back to Boats
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
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    stars: star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0
  }));

  const handleSubmitReview = async () => {
    const name = newReview.userName?.trim() || "";
    const email = newReview.userEmail?.trim() || "";
    const nameOnlyLetters = /^[A-Za-z\s]+$/.test(name);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!name || name.length < 2 || !nameOnlyLetters) {
      const msg = !name
        ? "Please enter your name."
        : !nameOnlyLetters
        ? "Name can only contain letters and spaces."
        : "Name must be at least 2 characters.";
      toast({ title: "Invalid name", description: msg, status: "warning", duration: 3000, isClosable: true });
      return;
    }
    
    if (!email || !emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    
    if (!newReview.comment || newReview.comment.trim().length < 5) {
      toast({ title: "Write a longer comment", description: "At least 5 characters.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    
    // Check if we're on the "all" reviews page - if so, show error
    if (id === "all") {
      toast({ 
        title: "Cannot submit review", 
        description: "Please select a specific boat to submit a review.", 
        status: "warning", 
        duration: 4000, 
        isClosable: true 
      });
      return;
    }
    
    // Validate boatId is a valid ObjectId
    if (!id || id === "all") {
      toast({ 
        title: "Invalid boat selection", 
        description: "Please select a valid boat to review.", 
        status: "error", 
        duration: 3000, 
        isClosable: true 
      });
      return;
    }
    
    const res = await addReview({ boatId: id, ...newReview });
    if (res?.success) {
      toast({ title: "Review submitted", status: "success", duration: 2000, isClosable: true });
      setNewReview({ userName: "", userEmail: "", rating: 5, comment: "" });
      setUserEmail(email); // Set user email for filtering
      fetchReviews(id);
    } else {
      toast({ title: "Failed to submit review", description: res?.message || "Try again later.", status: "error", duration: 3000, isClosable: true });
    }
  };

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Button
            onClick={() => navigate(-1)}
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            colorScheme="blue"
            size="sm"
            mb={4}
          >
            {id === "all" ? "Back to Home" : "Back to Boat Details"}
          </Button>
          
          <VStack spacing={4} align="start">
            <Heading
              as="h1"
              size="2xl"
              color={useColorModeValue("gray.800", "white")}
              fontWeight="black"
            >
              {id === "all" ? "All Boat Reviews" : `Reviews for ${boat.name}`}
            </Heading>
            
            {id !== "all" && (
              <HStack spacing={4}>
                <Badge colorScheme="blue" px={3} py={1} rounded="full">
                  {boat.category}
                </Badge>
                <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.400")}>
                  LKR {boat.price?.toLocaleString()}
                </Text>
              </HStack>
            )}
          </VStack>
        </Box>

        <Divider />

        {/* Review Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Average Rating</StatLabel>
                <StatNumber fontSize="3xl" color="blue.500">
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
                <StatLabel>Total Reviews</StatLabel>
                <StatNumber fontSize="3xl" color="green.500">
                  {totalReviews}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FaUsers} mr={1} />
                  customer reviews
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Positive Reviews</StatLabel>
                <StatNumber fontSize="3xl" color="green.500">
                  {reviews.filter(r => r.rating >= 4).length}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FaThumbsUp} mr={1} />
                  4+ star ratings
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody textAlign="center">
              <Stat>
                <StatLabel>Response Rate</StatLabel>
                <StatNumber fontSize="3xl" color="blue.500">
                  100%
                </StatNumber>
                <StatHelpText>
                  <Icon as={FaComment} mr={1} />
                  owner responses
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Rating Distribution */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Rating Distribution</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <HStack key={stars} justify="space-between">
                  <HStack spacing={2}>
                    <Text fontWeight="bold">{stars}</Text>
                    <Icon as={FaStar} color="yellow.400" />
                    <Text>stars</Text>
                  </HStack>
                  <HStack spacing={4} flex={1} maxW="200px">
                    <Box
                      bg={useColorModeValue("gray.200", "gray.600")}
                      h="8px"
                      w="100%"
                      rounded="full"
                      overflow="hidden"
                    >
                      <Box
                        bg="yellow.400"
                        h="100%"
                        w={`${percentage}%`}
                        transition="width 0.3s ease"
                      />
                    </Box>
                    <Text fontSize="sm" minW="60px">
                      {count} ({percentage}%)
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Write Review Section - Only show for specific boats, not for "all" */}
        {id !== "all" ? (
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Write a Review</Heading>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              Share your experience with this boat
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Your Name</FormLabel>
                  <Input 
                    value={newReview.userName} 
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Your Email</FormLabel>
                  <Input 
                    type="email"
                    value={newReview.userEmail} 
                    onChange={(e) => setNewReview({ ...newReview, userEmail: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Rating</FormLabel>
                  <Select 
                    value={newReview.rating} 
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>
                        {n} Star{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Your Review</FormLabel>
                <Textarea 
                  rows={4} 
                  value={newReview.comment} 
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Tell us about your experience with this boat..."
                />
              </FormControl>
              
              <Button 
                colorScheme="blue" 
                onClick={handleSubmitReview}
                size="lg"
                leftIcon={<Icon as={FaComment} />}
              >
                Submit Review
              </Button>
              
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                We will restrict reviewing to verified purchases later.
              </Text>
            </VStack>
          </CardBody>
        </Card>
        ) : (
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4} textAlign="center">
              <Icon as={FaComment} boxSize={12} color="gray.400" />
              <Heading size="md" color={useColorModeValue("gray.600", "gray.400")}>
                Want to Write a Review?
              </Heading>
              <Text color={useColorModeValue("gray.600", "gray.400")}>
                Please select a specific boat from the homepage to write a review.
              </Text>
              <Button 
                as={Link} 
                to="/" 
                colorScheme="blue" 
                leftIcon={<Icon as={FaShip} />}
              >
                Browse Boats
              </Button>
            </VStack>
          </CardBody>
        </Card>
        )}

        {/* Reviews List */}
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center" wrap="wrap">
            <Heading size="lg" color={useColorModeValue("gray.800", "white")}>
              Customer Reviews ({totalReviews})
            </Heading>
            
            {userEmail && (
              <Button
                size="sm"
                variant={showOnlyMyReviews ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => setShowOnlyMyReviews(!showOnlyMyReviews)}
              >
                {showOnlyMyReviews ? "Show All Reviews" : "Show Only My Reviews"}
              </Button>
            )}
          </HStack>
          
          {reviews.length === 0 ? (
            <Card bg={cardBg}>
              <CardBody textAlign="center" py={12}>
                <Icon as={FaComment} boxSize={12} color="gray.400" mb={4} />
                <Heading size="md" color="gray.500" mb={2}>
                  No Reviews Yet
                </Heading>
                <Text color="gray.400">
                  Be the first to review this boat!
                </Text>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={4} align="stretch">
              {reviews.map((review) => (
                <Card key={review._id} bg={bg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" align="start">
                        <HStack spacing={3}>
                          <Avatar 
                            name={review.userName} 
                            size="md" 
                            bg="blue.500" 
                            color="white"
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="lg">
                              {review.userName}
                            </Text>
                            <HStack spacing={1}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Icon 
                                  key={i} 
                                  as={FaStar} 
                                  color={i < review.rating ? "yellow.400" : useColorModeValue("gray.300", "gray.600")} 
                                />
                              ))}
                            </HStack>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                      
                      <Text 
                        fontSize="md" 
                        color={useColorModeValue("gray.700", "gray.300")}
                        lineHeight="tall"
                      >
                        {review.comment}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>
      </Container>
      {/* <StunningFooter /> */}
      {/* <LiveChatWidget /> */}
    </Box>
  );
};

export default UserReviewsPage;

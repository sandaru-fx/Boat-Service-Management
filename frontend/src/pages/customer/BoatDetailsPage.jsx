import {
  Container,
  Box,
  Heading,
  Text,
  Image,
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
} from "@chakra-ui/react";
import { useParams, Link, useLocation } from "react-router-dom";
/* eslint-disable react-hooks/rules-of-hooks */
import { FaShip, FaArrowLeft, FaPhone, FaEnvelope, FaStar, FaRuler, FaUsers, FaCog, FaGasPump, FaCalendarAlt } from "react-icons/fa";
// import { useBoatStore } from "../store/boat";
import { useEffect, useState } from "react";
// import StunningFooter from "../../components/StunningFooter";
// import LiveChatWidget from "../../components/LiveChatWidget";

const BoatDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  // const { boats, fetchBoats } = useBoatStore();
  const [boat, setBoat] = useState(null);
  
  // Detect if user came from admin context
  const isFromAdmin = location.state?.fromAdmin || false;
  // Get all color values at component level to avoid hooks rules violations
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColorLight = useColorModeValue("gray.900", "white");
  const textColorDark = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.800");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const tagBg = useColorModeValue("blue.100", "blue.900");
  const buttonBg = useColorModeValue("blue.500", "blue.600");
  const accentColor = useColorModeValue("blue.500", "blue.400");
  const dividerBg = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    // Fetch the specific boat by ID from the backend
    const fetchBoatDetails = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/boats/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (data.success) {
          setBoat(data.data);
        } else {
          console.error("Failed to fetch boat:", data.message);
        }
      } catch (error) {
        console.error("Error fetching boat details:", error);
        // Keep boat as null to show loading state
      }
    };

    if (id) {
      fetchBoatDetails();
    }
  }, [id]);


  if (!boat) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Text fontSize="xl">Loading boat details...</Text>
          <Button 
            as={Link} 
            to={isFromAdmin ? "/admin/boat-management" : "/boat-catalog"} 
            leftIcon={<Icon as={FaArrowLeft} />}
          >
            Back to {isFromAdmin ? "Fleet Management" : "Boat Catalog"}
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Back Button */}
        <Box>
          <Button
            as={Link}
            to={isFromAdmin ? "/admin/boat-management" : "/boat-catalog"}
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            colorScheme="blue"
            size="sm"
          >
            Back to {isFromAdmin ? "Fleet Management" : "Boat Catalog"}
          </Button>
        </Box>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
          {/* Image Section */}
          <Box>
            <Box
              rounded="2xl"
              overflow="hidden"
              shadow="2xl"
              position="relative"
            >
              <Image
                src={boat.image}
                alt={boat.name}
                w="full"
                h="500px"
                objectFit="cover"
              />
              <Badge
                position="absolute"
                top={4}
                right={4}
                bg="blue.500"
                color="white"
                px={3}
                py={1}
                rounded="full"
                fontSize="sm"
                fontWeight="bold"
              >
                <Icon as={FaShip} mr={1} />
                PREMIUM
              </Badge>
            </Box>
          </Box>

          {/* Details Section */}
          <VStack spacing={6} align="stretch">
            <VStack spacing={4} align="start">
              <HStack spacing={4} align="center">
                <Heading
                  as="h1"
                  size="2xl"
                  color={textColorLight}
                  fontWeight="black"
                >
                  {boat.name}
                </Heading>
                {boat.category && (
                  <Badge colorScheme="blue" px={3} py={1} rounded="full">
                    {boat.category}
                  </Badge>
                )}
              </HStack>
              
              {boat.model && (
                <Text fontSize="lg" color={subTextColor} fontWeight="medium">
                  Model: {boat.model}
                </Text>
              )}
              
              <HStack spacing={4}>
                <Text
                  fontSize="4xl"
                  fontWeight="black"
                  bgGradient="linear(to-r, blue.500, cyan.400)"
                  bgClip="text"
                >
                  LKR {boat.price?.toLocaleString()}
                </Text>
                <Text
                  fontSize="sm"
                  color={subTextColor}
                  fontWeight="medium"
                >
                  starting from
                </Text>
              </HStack>

              {boat.description && (
                <Text
                  fontSize="lg"
                  color={textColorDark}
                  lineHeight="tall"
                >
                  {boat.description}
                </Text>
              )}
            </VStack>

            <Divider />

            {/* Technical Specifications */}
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={textColorLight}>
                Technical Specifications
              </Heading>
              
              <Box
                bg={cardBg}
                p={6}
                rounded="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <Table variant="simple" size="sm">
                  <Tbody>
                    {boat.length && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">
                          <Icon as={FaRuler} mr={2} />
                          Length
                        </Td>
                        <Td>{boat.length} {boat.lengthUnit || 'ft'}</Td>
                      </Tr>
                    )}
                    
                    {boat.yearOfManufacture && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">Year Built</Td>
                        <Td>{boat.yearOfManufacture}</Td>
                      </Tr>
                    )}
                    
                    {boat.hullMaterial && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">Hull Material</Td>
                        <Td>{boat.hullMaterial}</Td>
                      </Tr>
                    )}
                    
                    {boat.engineType && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">
                          <Icon as={FaCog} mr={2} />
                          Engine Type
                        </Td>
                        <Td>{boat.engineType}</Td>
                      </Tr>
                    )}
                    
                    {boat.enginePower && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">Engine Power</Td>
                        <Td>{boat.enginePower} {boat.powerUnit || 'HP'}</Td>
                      </Tr>
                    )}
                    
                    {boat.fuelCapacity && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">
                          <Icon as={FaGasPump} mr={2} />
                          Fuel Capacity
                        </Td>
                        <Td>{boat.fuelCapacity} {boat.fuelUnit || 'liters'}</Td>
                      </Tr>
                    )}
                    
                    {boat.passengerCapacity && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">
                          <Icon as={FaUsers} mr={2} />
                          Passenger Capacity
                        </Td>
                        <Td>{boat.passengerCapacity} people</Td>
                      </Tr>
                    )}
                    
                    {boat.crewCapacity && (
                      <Tr>
                        <Td fontWeight="bold" color="blue.500">Crew Capacity</Td>
                        <Td>{boat.crewCapacity} people</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </VStack>

            {/* Features */}
            {boat.features && boat.features.length > 0 && (
              <>
                <Divider />
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColorLight}>
                    Features & Equipment
                  </Heading>
                  <HStack spacing={2} wrap="wrap">
                    {boat.features.map((feature, index) => (
                      <Tag key={index} size="md" colorScheme="blue" borderRadius="full">
                        <TagLabel>
                          <Icon as={FaStar} mr={1} />
                          {feature}
                        </TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </VStack>
              </>
            )}

            {/* Additional Specifications */}
            {boat.specifications && (
              <>
                <Divider />
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={textColorLight}>
                    Additional Specifications
                  </Heading>
                  {typeof boat.specifications === 'object' ? (
                    <Box>
                      {Object.entries(boat.specifications).map(([key, value]) => (
                        <Flex key={key} justify="space-between" py={2} borderBottom="1px solid" borderColor={borderColor}>
                          <Text fontWeight="bold" color={textColorLight}>
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                          </Text>
                          <Text color={textColorDark}>{value}</Text>
                        </Flex>
                      ))}
                    </Box>
                  ) : (
                    <Text
                      fontSize="md"
                      color={textColorDark}
                      lineHeight="tall"
                      whiteSpace="pre-line"
                    >
                      {boat.specifications}
                    </Text>
                  )}
                </VStack>
              </>
            )}

            <Divider />

            {/* Action Buttons - Hide for admin context */}
            {!isFromAdmin && boat && (
              <VStack spacing={4} align="stretch">
              <Button
                colorScheme="blue"
                size="lg"
                bgGradient="linear(to-r, blue.500, cyan.400)"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, cyan.500)",
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
                leftIcon={<Icon as={FaPhone} />}
                fontWeight="bold"
                py={6}
                onClick={() => window.open("tel:+15551234567", "_self")}
              >
                Call for More Information
              </Button>
              
              <Button
                variant="outline"
                colorScheme="blue"
                size="lg"
                leftIcon={<Icon as={FaEnvelope} />}
                py={6}
                onClick={() => {
                  if (!boat) return;
                  const subject = `Quote Request for ${boat.name}`;
                  const body = `Dear Boat Service Team,

I am interested in getting a quote for the ${boat.name} (${boat.category}).

Boat Details:
- Name: ${boat.name}
- Category: ${boat.category}
- Price: LKR {boat.price?.toLocaleString()}

Please provide me with:
- Detailed pricing breakdown
- Available financing options
- Delivery/timeline information
- Any current promotions or discounts

Thank you for your time.

Best regards,
[Your Name]`;

                  const mailtoLink = `mailto:info@boatmaster.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  window.open(mailtoLink, "_blank");
                }}
              >
                Request Quote
              </Button>
              
              {/* Buy This Boat Button */}
              <Button
                as={Link}
                to={boat ? `/book-appointment?boatId=${boat._id}&boatName=${encodeURIComponent(boat.name)}&boatCategory=${encodeURIComponent(boat.category)}` : '/book-appointment'}
                colorScheme="green"
                size="lg"
                bgGradient="linear(to-r, green.500, teal.400)"
                _hover={{
                  bgGradient: "linear(to-r, green.600, teal.500)",
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
                leftIcon={<Icon as={FaCalendarAlt} />}
                fontWeight="bold"
                py={6}
              >
               Book an Appointment to explore this Boat
              </Button>
              </VStack>
            )}

            {/* Contact Info */}
            <Box
              bg={tagBg}
              p={6}
              rounded="xl"
              border="1px solid"
              borderColor={accentColor}
            >
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold" color="blue.600" fontSize="sm">
                  Need Help Choosing?
                </Text>
                <Text fontSize="sm" color={textColorDark}>
                  Our expert team is available 24/7 to help you find the perfect boat for your needs.
                </Text>
                <HStack spacing={4}>
                  <Text fontSize="sm" fontWeight="medium">
                    📞 +1 (555) 123-4567
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    ✉️ info@boatmaster.com
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Reviews Section - Full Width at Bottom */}
        <Box 
          textAlign="center" 
          py={12}
          w="full"
          bg={cardBg}
          rounded="2xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={6} maxW="2xl" mx="auto" px={8}>
            <Heading size="xl" color={textColorLight}>
              Want to see what others think?
            </Heading>
            <Text fontSize="lg" color={subTextColor} textAlign="center">
              Read customer reviews, ratings, and experiences with this boat
            </Text>
            <Button
              as={Link}
              to={`/boat-reviews/${id}`}
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FaStar} />}
              bgGradient="linear(to-r, blue.500, cyan.400)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, cyan.500)",
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              px={12}
              py={6}
              fontSize="lg"
              fontWeight="bold"
            >
              Show Reviews
            </Button>
          </VStack>
        </Box>
      </VStack>
      </Container>
      {/* <StunningFooter /> */}
      {/* <LiveChatWidget /> */}
    </Box>
  );
};

export default BoatDetailsPage;

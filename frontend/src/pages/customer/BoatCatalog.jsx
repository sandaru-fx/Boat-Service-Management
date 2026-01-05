import { 
  Container, 
  SimpleGrid, 
  Text, 
  VStack, 
  Box,
  Heading,
  useColorModeValue,
  Flex,
  Icon,
  Badge,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Card,
  CardBody,
  Image,
  Stack,
  Divider,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBoatStore } from "../../store/boat";
import UserBoatCard from "../../components/UserBoatCard";
import StunningFooter from "../../components/StunningFooter";
import LiveChatWidget from "../../components/LiveChatWidget";
import { FaShip, FaWater, FaAnchor, FaSearch, FaTimes, FaChevronRight, FaArrowLeft } from "react-icons/fa";

const BoatCatalog = () => {
  const { fetchBoats, boats } = useBoatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBoats, setFilteredBoats] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [groupedBoats, setGroupedBoats] = useState({});
  
  // Color mode values at top level
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, cyan.50, teal.50)",
    "linear(to-br, gray.900, blue.900, cyan.900)"
  );
  const textGray600 = useColorModeValue("gray.600", "gray.300");
  const textGray800 = useColorModeValue("gray.800", "white");
  const bgWhite = useColorModeValue("white", "gray.700");
  const borderGray200 = useColorModeValue("gray.200", "gray.600");
  const borderGray100 = useColorModeValue("gray.100", "gray.600");
  const hoverBlue = useColorModeValue("blue.50", "blue.900");
  const textGray400 = useColorModeValue("gray.600", "gray.400");
  const bgBox = useColorModeValue("white", "gray.800");
  const bgCallToAction = useColorModeValue("gray.50", "gray.800");

  // Function to group boats by their assigned category with professional structure
  const groupBoatsByCategory = (boatsList) => {
    const grouped = {};
    const mainCategories = ['Speed Boats', 'Yachts', 'Fishing Boats'];
    
    boatsList.forEach(boat => {
      const category = boat.category || 'Other Boats';
      
      // Debug: Log the boat name and category
      console.log(`Boat: ${boat.name}, Category: "${category}"`);
      
      // If it's a main category, add it directly to its own section
      if (mainCategories.includes(category)) {
        console.log(`Adding ${boat.name} to ${category} section`);
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(boat);
      } 
      // All other categories go under "Other Boats"
      else {
        console.log(`Adding ${boat.name} to Other Boats section`);
        if (!grouped['Other Boats']) {
          grouped['Other Boats'] = [];
        }
        grouped['Other Boats'].push(boat);
      }
    });
    
    console.log('Final grouped result:', grouped);
    return grouped;
  };

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBoats(boats);
      setSuggestions([]);
      setGroupedBoats(groupBoatsByCategory(boats));
    } else {
      // Filter boats based on search term
      const filtered = boats.filter(boat => 
        boat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (boat.category && boat.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBoats(filtered);
      setGroupedBoats(groupBoatsByCategory(filtered));

      // Generate suggestions based on boat names and categories
      const boatNames = boats.map(boat => boat.name);
      const categories = boats.map(boat => boat.category).filter(Boolean);
      const allSuggestions = [...new Set([...boatNames, ...categories])];
      
      const matchingSuggestions = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(matchingSuggestions.slice(0, 5)); // Limit to 5 suggestions
    }
  }, [searchTerm, boats]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Back Button */}
      <Box py={4} px={4}>
        <Container maxW="container.xl">
          <Box alignSelf="flex-start" mb={4}>
            <Button
              as={Link}
              to="/dashboard"
              leftIcon={<Icon as={FaArrowLeft} />}
              variant="ghost"
              colorScheme="blue"
              size="sm"
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box py={20} textAlign="center">
        <Container maxW="container.xl">
          <VStack spacing={8}>
            {/* Main Title */}
            <VStack spacing={4}>
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={4}
                py={2}
                rounded="full"
                fontSize="sm"
                fontWeight="bold"
              >
                <Icon as={FaShip} mr={2} />
                PREMIUM BOAT MANAGEMENT
              </Badge>
              
              <Heading
                as="h1"
                size="4xl"
                fontWeight="black"
                bgGradient="linear(to-r, blue.600, cyan.500, teal.400)"
                bgClip="text"
                lineHeight="shorter"
              >
                Discover Your Perfect Boat
              </Heading>
              
              <Text
                fontSize="xl"
                color={textGray600}
                maxW="2xl"
                lineHeight="tall"
              >
                Explore our premium collection of boats. From luxury yachts to fishing boats, 
                find the perfect vessel for your next adventure on the water.
              </Text>
            </VStack>

            {/* Search Bar */}
            <Box w="full" maxW="600px" position="relative">
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search boat categories..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  bg={bgWhite}
                  border="2px solid"
                  borderColor={borderGray200}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  _hover={{
                    borderColor: "blue.300",
                  }}
                />
                {searchTerm && (
                  <InputRightElement>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSearch}
                      color="gray.400"
                      _hover={{ color: "gray.600" }}
                    >
                      <Icon as={FaTimes} />
                    </Button>
                  </InputRightElement>
                )}
              </InputGroup>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  zIndex={10}
                  mt={1}
                  bg={bgWhite}
                  border="1px solid"
                  borderColor={borderGray200}
                  rounded="md"
                  shadow="lg"
                  maxH="200px"
                  overflowY="auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <Box
                      key={index}
                      px={4}
                      py={3}
                      cursor="pointer"
                      _hover={{
                        bg: hoverBlue,
                        color: "blue.600"
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      borderBottom={index < suggestions.length - 1 ? "1px solid" : "none"}
                      borderColor={borderGray100}
                    >
                      <HStack>
                        <Icon as={FaChevronRight} color="blue.400" boxSize={3} />
                        <Text fontSize="sm">{suggestion}</Text>
                      </HStack>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Stats */}
            <HStack spacing={8} justify="center" wrap="wrap">
              <VStack>
                <Icon as={FaShip} boxSize={8} color="blue.500" />
                <Text fontWeight="bold" fontSize="2xl" color="blue.500">
                  {boats.length}+
                </Text>
                <Text fontSize="sm" color={textGray400}>
                  Boat Categories
                </Text>
              </VStack>
              
              <VStack>
                <Icon as={FaWater} boxSize={8} color="cyan.500" />
                <Text fontWeight="bold" fontSize="2xl" color="cyan.500">
                  100%
                </Text>
                <Text fontSize="sm" color={textGray400}>
                  Water Ready
                </Text>
              </VStack>
              
              <VStack>
                <Icon as={FaAnchor} boxSize={8} color="teal.500" />
                <Text fontWeight="bold" fontSize="2xl" color="teal.500">
                  24/7
                </Text>
                <Text fontSize="sm" color={textGray400}>
                  Support
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Boat Categories Section */}
      <Box py={16}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            {/* Section Title */}
            <VStack spacing={4} textAlign="center">
              <Heading
                as="h2"
                size="2xl"
                fontWeight="bold"
                color={textGray800}
              >
                {searchTerm ? `Search Results for "${searchTerm}"` : "Our Boat Categories"}
              </Heading>
              <Text
                fontSize="lg"
                color={textGray600}
                maxW="xl"
              >
                {searchTerm 
                  ? `Found ${filteredBoats.length} boat${filteredBoats.length !== 1 ? 's' : ''} matching your search.`
                  : "Choose from our carefully curated selection of premium boats, each designed for different adventures and experiences."
                }
              </Text>
            </VStack>

            {/* Hierarchical Boat Categories */}
            {Object.keys(groupedBoats).length > 0 ? (
              <VStack spacing={12} w="full">
                {Object.entries(groupedBoats)
                  .sort(([a], [b]) => {
                    // Sort so that "Other Boats" appears last
                    if (a === 'Other Boats') return 1;
                    if (b === 'Other Boats') return -1;
                    return a.localeCompare(b);
                  })
                  .map(([categoryName, categoryBoats]) => (
                  <Box key={categoryName} w="full">
                    {/* Category Header */}
                    <VStack spacing={6} mb={8}>
                      <Heading
                        as="h3"
                        size="xl"
                        color={textGray800}
                        textAlign="center"
                        position="relative"
                        _after={{
                          content: '""',
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '60px',
                          height: '3px',
                          bgGradient: 'linear(to-r, blue.500, cyan.400)',
                          borderRadius: 'full'
                        }}
                      >
                        {categoryName}
                      </Heading>
                      <Text
                        fontSize="md"
                        color={textGray600}
                        textAlign="center"
                        maxW="md"
                      >
                        {categoryBoats.length} model{categoryBoats.length !== 1 ? 's' : ''} available
                      </Text>
                    </VStack>

                    {/* Boats Grid for this Category */}
                    <SimpleGrid
                      columns={{
                        base: 1,
                        md: 2,
                        lg: 3,
                        xl: 4,
                      }}
                      spacing={8}
                      w="full"
                    >
                      {categoryBoats.map((boat) => (
                        <UserBoatCard key={boat._id} boat={boat} />
                      ))}
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            ) : boats.length > 0 ? (
              <Box
                textAlign="center"
                py={20}
                bg={bgBox}
                rounded="2xl"
                shadow="lg"
                px={8}
              >
                <Icon as={FaSearch} boxSize={16} color="gray.400" mb={4} />
                <Heading size="lg" color="gray.500" mb={2}>
                  No Boats Found
                </Heading>
                <Text color="gray.400">
                  No boats match your search for "{searchTerm}". Try a different search term.
                </Text>
                <Button
                  mt={4}
                  colorScheme="blue"
                  variant="outline"
                  onClick={clearSearch}
                >
                  Clear Search
                </Button>
              </Box>
            ) : (
              <Box
                textAlign="center"
                py={20}
                bg={bgBox}
                rounded="2xl"
                shadow="lg"
                px={8}
              >
                <Icon as={FaShip} boxSize={16} color="gray.400" mb={4} />
                <Heading size="lg" color="gray.500" mb={2}>
                  No Boats Available
                </Heading>
                <Text color="gray.400">
                  We're currently updating our boat collection. Check back soon!
                </Text>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={16} bg={bgCallToAction}>
        <Container maxW="container.md" textAlign="center">
          <VStack spacing={6}>
            <Heading
              as="h3"
              size="xl"
              color={useColorModeValue("gray.800", "white")}
            >
              Ready to Set Sail?
            </Heading>
            <Text
              fontSize="lg"
              color={useColorModeValue("gray.600", "gray.300")}
            >
              Contact our expert team to learn more about our boats and find the perfect match for your needs.
            </Text>
            <HStack spacing={4} justify="center">
              <Badge
                colorScheme="green"
                variant="subtle"
                px={4}
                py={2}
                rounded="full"
                fontSize="sm"
              >
                ✓ Free Consultation
              </Badge>
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={4}
                py={2}
                rounded="full"
                fontSize="sm"
              >
                ✓ Expert Guidance
              </Badge>
              <Badge
                colorScheme="purple"
                variant="subtle"
                px={4}
                py={2}
                rounded="full"
                fontSize="sm"
              >
                ✓ Best Prices
              </Badge>
            </HStack>
          </VStack>
        </Container>
      </Box>
      {/* <StunningFooter /> */}
      {/* <LiveChatWidget /> */}
    </Box>
  );
};

export default BoatCatalog;

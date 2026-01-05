// src/pages/HomePage.jsx
import { 
  Container, 
  SimpleGrid, 
  Text, 
  VStack, 
  Box,
  Heading,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  HStack,
  Icon,
  Badge
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBoatStore } from "../../store/boat";
import ProductCard from "../../components/ProductCard";
/* eslint-disable react-hooks/rules-of-hooks */
import { FaSearch, FaTimes, FaShip, FaChevronRight, FaComments, FaChartLine, FaPlus, FaArrowLeft } from "react-icons/fa";

const BoatManagement = () => {
  const { fetchBoats, boats } = useBoatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBoats, setFilteredBoats] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [groupedBoats, setGroupedBoats] = useState({});

  // Color mode values at top level to avoid conditional calls
  const suggestionBg = useColorModeValue("white", "gray.700");
  const suggestionBorder = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.200", "gray.600");
  const sectionBg = useColorModeValue("white", "gray.800");
  const emptyCardBg = useColorModeValue("white", "gray.800");
  const emptyTextColor = useColorModeValue("gray.500", "gray.400");

  // Function to group boats by their assigned category with professional structure
  const groupBoatsByCategory = (boatsList) => {
    const grouped = {};
    const mainCategories = ['Speed Boats', 'Yachts', 'Fishing Boats'];
    
    boatsList.forEach(boat => {
      const category = boat.category || 'Other Boats';
      
      // If it's a main category, add it directly to its own section
      if (mainCategories.includes(category)) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(boat);
      } 
      // All other categories go under "Other Boats"
      else {
        if (!grouped['Other Boats']) {
          grouped['Other Boats'] = [];
        }
        grouped['Other Boats'].push(boat);
      }
    });
    
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

  console.log("boats", boats);

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
    <Container maxW="container.xl" py={12}>
      <VStack spacing={8}>
        {/* Back Button */}
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
          {/* Header Section */}
          <VStack spacing={6} textAlign="center">
            <HStack spacing={4}>
              <Icon as={FaShip} boxSize={10} color="blue.500" />
              <Heading
                as="h1"
                size="2xl"
                fontWeight="black"
                bgGradient="linear(to-r, blue.500, cyan.400)"
                bgClip="text"
              >
                Boat Management
              </Heading>
            </HStack>
            
            <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.300")} maxW="2xl">
              Manage your boat collection and view customer reviews with email addresses
            </Text>
            
            {/* Action Buttons */}
            <HStack spacing={4}>
              <Button
                as={Link}
                to="/admin/analytics"
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={FaChartLine} />}
                bgGradient="linear(to-r, green.500, teal.400)"
                border="2px solid"
                borderColor="lightblue.300"
                _hover={{
                  bgGradient: "linear(to-r, green.600, teal.500)",
                  borderColor: "lightblue.400",
                  transform: "translateY(-2px)",
                  shadow: "lg",
                  boxShadow: "0 0 20px rgba(135, 206, 250, 0.4)"
                }}
                transition="all 0.3s ease"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Analytics Dashboard
              </Button>
              
              <Button
                as={Link}
                to="/admin/create"
                colorScheme="purple"
                size="lg"
                leftIcon={<Icon as={FaPlus} />}
                bgGradient="linear(to-r, purple.500, pink.400)"
                border="2px solid"
                borderColor="lightblue.300"
                _hover={{
                  bgGradient: "linear(to-r, purple.600, pink.500)",
                  borderColor: "lightblue.400",
                  transform: "translateY(-2px)",
                  shadow: "lg",
                  boxShadow: "0 0 20px rgba(135, 206, 250, 0.4)"
                }}
                transition="all 0.3s ease"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Add Category
              </Button>
            </HStack>
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
                bg={useColorModeValue("white", "gray.700")}
                border="2px solid"
                borderColor={useColorModeValue("gray.200", "gray.600")}
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
                bg={suggestionBg}
                border="1px solid"
                borderColor={suggestionBorder}
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
                      bg: useColorModeValue("blue.50", "blue.900"),
                      color: "blue.600"
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    borderBottom={index < suggestions.length - 1 ? "1px solid" : "none"}
                    borderColor={useColorModeValue("gray.100", "gray.600")}
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

          {/* Section Title */}
          <VStack spacing={4}>
            <Heading
              as="h2"
              size="xl"
          fontWeight="bold"
              color={useColorModeValue("gray.800", "white")}
            >
              {searchTerm ? `Search Results for "${searchTerm}"` : "Current Boats"}
            </Heading>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} textAlign="center">
              {searchTerm 
                ? `Found ${filteredBoats.length} boat${filteredBoats.length !== 1 ? 's' : ''} matching your search.`
                : "Click the purple button on each boat card to view reviews with email addresses"
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
                      color={useColorModeValue("gray.800", "white")}
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
                      color={useColorModeValue("gray.600", "gray.300")}
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
                    }}
                    spacing={10}
                    w="full"
                  >
                    {categoryBoats.map((boat) => (
                      <ProductCard key={boat._id} boat={boat} />
                    ))}
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          ) : boats.length > 0 ? (
            <Box
            textAlign="center"
              py={20}
              bg={useColorModeValue("white", "gray.800")}
              rounded="2xl"
              shadow="lg"
              px={8}
            >
              <Icon as={FaSearch} boxSize={16} color="gray.400" mb={4} />
              <Heading size="lg" color="gray.500" mb={2}>
                No Boats Found
              </Heading>
              <Text color="gray.400" mb={4}>
                No boats match your search for "{searchTerm}". Try a different search term.
              </Text>
              <Button
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
              bg={useColorModeValue("white", "gray.800")}
              rounded="2xl"
              shadow="lg"
              px={8}
            >
              <Icon as={FaShip} boxSize={16} color="gray.400" mb={4} />
              <Heading size="lg" color="gray.500" mb={2}>
                No Boats Found
              </Heading>
              <Text color="gray.400" mb={4}>
                Start by creating your first boat category.
              </Text>
              <Button
                as={Link}
                to="/admin/create"
                colorScheme="blue"
                leftIcon={<Icon as={FaShip} />}
              >
                Create a Boat
              </Button>
            </Box>
        )}
      </VStack>
    </Container>
    </Box>
  );
};

export default BoatManagement;
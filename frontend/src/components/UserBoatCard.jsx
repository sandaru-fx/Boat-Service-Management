import {
  Box,
  Heading,
  Image,
  Text,
  Button,
  useColorModeValue,
  Badge,
  VStack,
  HStack,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaShip, FaEye } from "react-icons/fa";

const UserBoatCard = ({ boat }) => {
  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box
      shadow="xl"
      rounded="2xl"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ 
        transform: "translateY(-5px)",
        borderColor: "#3B82F6",
        boxShadow: "0 0 20px #3B82F6"
      }}
      bg={bg}
      border="3px solid"
      borderColor="transparent"
      position="relative"
      group
      cursor="pointer"
    >
      {/* Image Container with Overlay */}
      <Box position="relative" overflow="hidden">
        <Image
          src={boat.image}
          alt={boat.name}
          h={64}
          w="full"
          objectFit="cover"
          transition="transform 0.3s ease"
          _groupHover={{ transform: "scale(1.05)" }}
        />
        
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-t, blackAlpha.600, transparent)"
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.3s ease"
        />
        
        {/* Boat Icon Badge */}
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
          _groupHover={{
            bg: "blue.600",
            transform: "scale(1.1)",
            transition: "all 0.3s ease"
          }}
        >
          <Icon as={FaShip} mr={1} />
          BOAT
        </Badge>
      </Box>

      {/* Content */}
      <VStack spacing={4} p={6} align="stretch">
        {/* Category Name */}
        <Heading 
          as="h3" 
          size="lg" 
          color={useColorModeValue("gray.800", "white")}
          textAlign="center"
          fontWeight="bold"
          lineHeight="shorter"
        >
          {boat.name}
        </Heading>

        {/* Price */}
        <Flex justify="center" align="center">
          <Text
            fontSize="3xl"
            fontWeight="black"
            bgGradient="linear(to-r, blue.500, cyan.400)"
            bgClip="text"
            textAlign="center"
            _groupHover={{
              bgGradient: "linear(to-r, blue.600, cyan.500)",
              transition: "all 0.3s ease"
            }}
          >
            LKR {boat.price?.toLocaleString()}
          </Text>
          <Text
            fontSize="sm"
            color={textColor}
            ml={2}
            fontWeight="medium"
          >
            starting from
          </Text>
        </Flex>

        {/* Features Preview */}
        <VStack spacing={2} align="stretch">
          <Text
            fontSize="sm"
            color={textColor}
            textAlign="center"
            fontStyle="italic"
          >
            Premium boat category with modern features
          </Text>
          
          <HStack justify="center" spacing={4} fontSize="xs" color={textColor}>
            <Text>✓ Luxury Design</Text>
            <Text>✓ High Performance</Text>
            <Text>✓ Safety First</Text>
          </HStack>
        </VStack>

        {/* More Details Button */}
        <Button
          as={Link}
          to={`/boat-details/${boat._id}`}
          colorScheme="blue"
          size="lg"
          variant="solid"
          bgGradient="linear(to-r, blue.500, cyan.400)"
          _hover={{
            bgGradient: "linear(to-r, blue.600, cyan.500)",
            transform: "translateY(-2px)",
            shadow: "lg",
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
          }}
          _active={{
            transform: "translateY(0px)"
          }}
          leftIcon={<Icon as={FaEye} />}
          fontWeight="bold"
          rounded="xl"
          py={6}
          transition="all 0.2s ease"
        >
          More Details
        </Button>
      </VStack>
    </Box>
  );
};

export default UserBoatCard;

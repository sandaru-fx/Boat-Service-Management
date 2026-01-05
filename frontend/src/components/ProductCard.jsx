import { DeleteIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  Input,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Textarea,
  SimpleGrid,
  FormControl,
  FormLabel,
  Divider,
} from "@chakra-ui/react";
import { useBoatStore } from "../store/boat";
import { useState } from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ boat }) => {
  const textColor = useColorModeValue("gray.600", "gray.200");
  const bg = useColorModeValue("white", "gray.800");

  const { deleteBoat, updateBoat } = useBoatStore();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ✅ state for updated boat (primary + secondary details)
  const [updatedBoat, setUpdatedBoat] = useState({
    name: boat.name || "",
    price: boat.price || "",
    image: boat.image || "",
    // secondary
    model: boat.model || "",
    category: boat.category || "",
    length: boat.length || "",
    lengthUnit: boat.lengthUnit || "ft",
    engineType: boat.engineType || "",
    enginePower: boat.enginePower || "",
    powerUnit: boat.powerUnit || "HP",
    fuelCapacity: boat.fuelCapacity || "",
    fuelUnit: boat.fuelUnit || "liters",
    passengerCapacity: boat.passengerCapacity || "",
    crewCapacity: boat.crewCapacity || "",
    yearOfManufacture: boat.yearOfManufacture || "",
    hullMaterial: boat.hullMaterial || "",
    features: Array.isArray(boat.features) ? boat.features : [],
    description: boat.description || "",
    specifications: boat.specifications || "",
  });

  // ✅ state for validation errors
  const [errors, setErrors] = useState({});

  // ✅ validation function
  const validateBoatData = () => {
    const e = {};
    
    // Required fields
    if (!updatedBoat.name?.trim()) e.name = "Boat name is required";
    if (!updatedBoat.category?.trim()) e.category = "Category selection is required";
    if (updatedBoat.price === "" || Number(updatedBoat.price) <= 0) e.price = "Price must be > 0";
    
    // Validate numeric fields
    if (updatedBoat.length && (Number(updatedBoat.length) <= 0)) e.length = "Length must be > 0";
    if (updatedBoat.enginePower && (Number(updatedBoat.enginePower) <= 0)) e.enginePower = "Engine power must be > 0";
    if (updatedBoat.fuelCapacity && (Number(updatedBoat.fuelCapacity) <= 0)) e.fuelCapacity = "Fuel capacity must be > 0";
    if (updatedBoat.passengerCapacity && (Number(updatedBoat.passengerCapacity) <= 0)) e.passengerCapacity = "Passenger capacity must be > 0";
    if (updatedBoat.crewCapacity && (Number(updatedBoat.crewCapacity) < 0)) e.crewCapacity = "Crew capacity must be ≥ 0";
    if (updatedBoat.yearOfManufacture && (Number(updatedBoat.yearOfManufacture) < 1900 || Number(updatedBoat.yearOfManufacture) > 2030)) {
      e.yearOfManufacture = "Year must be between 1900 and 2030";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleDeleteBoat = async (bid) => {
    const { success, message } = await deleteBoat(bid);
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateBoat = async (bid, updatedBoat) => {
    // Use the validation function
    if (!validateBoatData()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before updating",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const {success , message} = await updateBoat(bid, updatedBoat);
    onClose();

    if (!success) {
  toast({
    title: "Error",
    description: message,
    status: "error",
    duration: 3000,
    isClosable: true,
  });
} else {
  toast({
    title: "Boat updated successfully",
    description: message,
    status: "success",
    duration: 3000,
    isClosable: true,
  });
}
  };

  return (
    <Box
      shadow="lg"
      rounded="lg"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ 
        transform: "translateY(-5px)",
        borderColor: "#FFD700",
        boxShadow: "0 0 20px #FFD700"
      }}
      bg={bg}
      border="3px solid"
      borderColor="transparent"
      cursor="pointer"
    >
      <Box position="relative" overflow="hidden">
        <Image
          src={boat.image}
          alt={boat.name}
          h={48}
          w="full"
          objectFit="cover"
          transition="transform 0.3s ease"
          _hover={{ transform: "scale(1.05)" }}
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
          _hover={{ opacity: 1 }}
          transition="opacity 0.3s ease"
        />
        
        {/* Admin Badge */}
        <Box
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
          _hover={{
            bg: "blue.600",
            transform: "scale(1.1)",
            transition: "all 0.3s ease"
          }}
        >
          ADMIN
        </Box>
      </Box>

      <Box p={6}>
        <Heading as="h3" size="lg" mb={3} color={useColorModeValue("gray.800", "white")}>
          {boat.name}
        </Heading>

        <Text 
          fontWeight="black" 
          fontSize="2xl" 
          bgGradient="linear(to-r, blue.500, cyan.400)"
          bgClip="text"
          mb={4}
        >
          LKR {boat.price?.toLocaleString()}
        </Text>

        <HStack spacing={2} justify="center">
          <IconButton 
            as={Link}
            to={`/boat-details/${boat._id}`}
            state={{ fromAdmin: true }}
            icon={<ViewIcon />} 
            colorScheme="green" 
            title="View Details"
            size="sm"
            _hover={{
              transform: "scale(1.1)",
              transition: "all 0.2s ease"
            }}
          />
          <IconButton 
            as={Link}
            to={`/admin/reviews/${boat._id}`}
            icon={<ViewIcon />} 
            colorScheme="purple" 
            title="View Reviews"
            size="sm"
            _hover={{
              transform: "scale(1.1)",
              transition: "all 0.2s ease"
            }}
          />
          <IconButton 
            icon={<EditIcon />} 
            onClick={onOpen} 
            colorScheme="blue"
            size="sm"
            _hover={{
              transform: "scale(1.1)",
              transition: "all 0.2s ease"
            }}
          />
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleDeleteBoat(boat._id)}
            colorScheme="red"
            size="sm"
            _hover={{
              transform: "scale(1.1)",
              transition: "all 0.2s ease"
            }}
          />
        </HStack>
      </Box>

      {/* Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Boat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs colorScheme="blue" isFitted>
              <TabList>
                <Tab>Primary Details</Tab>
                <Tab>Secondary Details</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Boat Category</FormLabel>
                      <Input
                        placeholder="Boat Category"
                        value={updatedBoat.name}
                        onChange={(e) =>
                          setUpdatedBoat({ ...updatedBoat, name: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Price</FormLabel>
                      <Input
                        placeholder="Price"
                        type="number"
                        min="0.01"
                        max="1000000"
                        step="0.01"
                        value={updatedBoat.price}
                        onChange={(e) =>
                          setUpdatedBoat({ ...updatedBoat, price: e.target.value })
                        }
                      />
                      {errors.price && <Text color="red.400" fontSize="sm" mt={1}>{errors.price}</Text>}
                    </FormControl>
                    <FormControl>
                      <FormLabel>Image URL</FormLabel>
                      <Input
                        placeholder="Image URL"
                        value={updatedBoat.image}
                        onChange={(e) =>
                          setUpdatedBoat({ ...updatedBoat, image: e.target.value })
                        }
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Model</FormLabel>
                        <Input
                          placeholder="Model"
                          value={updatedBoat.model}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, model: e.target.value })}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Category</FormLabel>
                        <Select
                          placeholder="Select category"
                          value={updatedBoat.category}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, category: e.target.value })}
                        >
                          <option value="Luxury">Luxury</option>
                          <option value="Fishing">Fishing</option>
                          <option value="Sports">Sports</option>
                          <option value="Yacht">Yacht</option>
                          <option value="Cruiser">Cruiser</option>
                          <option value="Sailboat">Sailboat</option>
                          <option value="Speedboat">Speedboat</option>
                          <option value="Other">Other</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Length</FormLabel>
                        <Input
                          type="number"
                          min="0.1"
                          max="1000"
                          step="0.1"
                          placeholder="Length"
                          value={updatedBoat.length}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, length: e.target.value })}
                        />
                        {errors.length && <Text color="red.400" fontSize="sm" mt={1}>{errors.length}</Text>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Length Unit</FormLabel>
                        <Select
                          value={updatedBoat.lengthUnit}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, lengthUnit: e.target.value })}
                        >
                          <option value="ft">ft</option>
                          <option value="meters">meters</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Engine Type</FormLabel>
                        <Select
                          placeholder="Select engine"
                          value={updatedBoat.engineType}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, engineType: e.target.value })}
                        >
                          <option value="Diesel">Diesel</option>
                          <option value="Petrol">Petrol</option>
                          <option value="Electric">Electric</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Other">Other</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Engine Power</FormLabel>
                        <Input
                          type="number"
                          min="0.1"
                          max="10000"
                          step="0.1"
                          placeholder="Power"
                          value={updatedBoat.enginePower}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, enginePower: e.target.value })}
                        />
                        {errors.enginePower && <Text color="red.400" fontSize="sm" mt={1}>{errors.enginePower}</Text>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Power Unit</FormLabel>
                        <Select
                          value={updatedBoat.powerUnit}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, powerUnit: e.target.value })}
                        >
                          <option value="HP">HP</option>
                          <option value="kW">kW</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Fuel Capacity</FormLabel>
                        <Input
                          type="number"
                          min="0.1"
                          max="10000"
                          step="0.1"
                          placeholder="Fuel Capacity"
                          value={updatedBoat.fuelCapacity}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, fuelCapacity: e.target.value })}
                        />
                        {errors.fuelCapacity && <Text color="red.400" fontSize="sm" mt={1}>{errors.fuelCapacity}</Text>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Fuel Unit</FormLabel>
                        <Select
                          value={updatedBoat.fuelUnit}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, fuelUnit: e.target.value })}
                        >
                          <option value="liters">liters</option>
                          <option value="gallons">gallons</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Passenger Capacity</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          step="1"
                          placeholder="Passengers"
                          value={updatedBoat.passengerCapacity}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, passengerCapacity: e.target.value })}
                        />
                        {errors.passengerCapacity && <Text color="red.400" fontSize="sm" mt={1}>{errors.passengerCapacity}</Text>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Crew Capacity</FormLabel>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="Crew"
                          value={updatedBoat.crewCapacity}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, crewCapacity: e.target.value })}
                        />
                        {errors.crewCapacity && <Text color="red.400" fontSize="sm" mt={1}>{errors.crewCapacity}</Text>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Year of Manufacture</FormLabel>
                        <Input
                          type="number"
                          min="1900"
                          max="2030"
                          step="1"
                          placeholder="Year"
                          value={updatedBoat.yearOfManufacture}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, yearOfManufacture: e.target.value })}
                        />
                        {errors.yearOfManufacture && <Text color="red.400" fontSize="sm" mt={1}>{errors.yearOfManufacture}</Text>}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Hull Material</FormLabel>
                        <Select
                          placeholder="Select hull material"
                          value={updatedBoat.hullMaterial}
                          onChange={(e) => setUpdatedBoat({ ...updatedBoat, hullMaterial: e.target.value })}
                        >
                          <option value="Fiberglass">Fiberglass</option>
                          <option value="Aluminum">Aluminum</option>
                          <option value="Steel">Steel</option>
                          <option value="Wood">Wood</option>
                          <option value="Carbon Fiber">Carbon Fiber</option>
                          <option value="Other">Other</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                    <FormControl>
                      <FormLabel>Features (comma separated)</FormLabel>
                      <Input
                        placeholder="GPS, Navigation, Cabin"
                        value={Array.isArray(updatedBoat.features) ? updatedBoat.features.join(", ") : ""}
                        onChange={(e) =>
                          setUpdatedBoat({
                            ...updatedBoat,
                            features: e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter((f) => f.length > 0),
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        placeholder="Description"
                        value={updatedBoat.description}
                        onChange={(e) => setUpdatedBoat({ ...updatedBoat, description: e.target.value })}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Technical Specifications</FormLabel>
                      <Textarea
                        placeholder="Technical Specifications"
                        value={updatedBoat.specifications}
                        onChange={(e) => setUpdatedBoat({ ...updatedBoat, specifications: e.target.value })}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateBoat(boat._id, updatedBoat)}
            >
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductCard;
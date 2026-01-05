import React, { useState } from "react";
import { 
  Box, 
  Container, 
  Heading, 
  useColorModeValue, 
  VStack, 
  Input, 
  Button, 
  useToast,
  Select,
  Textarea,
  SimpleGrid,
  Text,
  FormControl,
  FormLabel,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Collapse
} from "@chakra-ui/react";
import { useBoatStore } from "../../store/boat";


const CreatePage = () => {
  const [newBoat, setNewBoat] = useState({
    name: "",
    price: "",
    image: "",
    model: "",
    category: "",
    length: "",
    lengthUnit: "ft",
    engineType: "",
    enginePower: "",
    powerUnit: "HP",
    fuelCapacity: "",
    fuelUnit: "liters",
    passengerCapacity: "",
    crewCapacity: "",
    yearOfManufacture: "",
    hullMaterial: "",
    features: [],
    description: "",
    specifications: ""
  });
  
  const [newFeature, setNewFeature] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const toast = useToast()

   const { createBoat } = useBoatStore();

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!newBoat.name?.trim()) e.name = "Boat name is required";
    if (!newBoat.category?.trim()) e.category = "Category selection is required";
    if (newBoat.price === "" || Number(newBoat.price) <= 0) e.price = "Price must be > 0";
    
    // Validate numeric fields
    if (newBoat.length && (Number(newBoat.length) <= 0)) e.length = "Length must be > 0";
    if (newBoat.enginePower && (Number(newBoat.enginePower) <= 0)) e.enginePower = "Engine power must be > 0";
    if (newBoat.fuelCapacity && (Number(newBoat.fuelCapacity) <= 0)) e.fuelCapacity = "Fuel capacity must be > 0";
    if (newBoat.passengerCapacity && (Number(newBoat.passengerCapacity) <= 0)) e.passengerCapacity = "Passenger capacity must be > 0";
    if (newBoat.crewCapacity && (Number(newBoat.crewCapacity) < 0)) e.crewCapacity = "Crew capacity must be ≥ 0";
    if (newBoat.yearOfManufacture && (Number(newBoat.yearOfManufacture) < 1900 || Number(newBoat.yearOfManufacture) > 2030)) {
      e.yearOfManufacture = "Year must be between 1900 and 2030";
    }
    
    if (!newBoat.image?.trim()) {
      e.image = "Image URL is required";
    } else {
      try { 
        new URL(newBoat.image); 
        // Additional check for common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const hasImageExtension = imageExtensions.some(ext => 
          newBoat.image.toLowerCase().includes(ext)
        );
        if (!hasImageExtension && !newBoat.image.includes('unsplash.com') && !newBoat.image.includes('pexels.com')) {
          e.image = "Please use a valid image URL (jpg, png, gif, etc.)";
        }
      } catch { 
        e.image = "Please enter a valid URL (must start with http:// or https://)"; 
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddBoat = async () => {
    if (!validate()) return;
    // Build a sanitized payload: drop empty strings/empty arrays, coerce numbers
    const numericKeys = [
      "price",
      "length",
      "enginePower",
      "fuelCapacity",
      "passengerCapacity",
      "crewCapacity",
      "yearOfManufacture",
    ];

    const payload = Object.fromEntries(
      Object.entries(newBoat)
        .map(([key, value]) => {
          if (numericKeys.includes(key) && value !== "" && value !== null && value !== undefined) {
            const num = Number(value);
            return [key, isNaN(num) ? undefined : num];
          }
          return [key, value];
        })
        .filter(([key, value]) => {
          if (value === "" || value === null || value === undefined) return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        })
    );

    const { success, message } = await createBoat(payload);
     if (!success) {
        toast({
    title: "Error",
    description: message,
    status: "error",
    isClosable: true,
  });
} else {
  toast({
    title: "Success",
    description: message,
    status: "success",
    isClosable: true,
  });
  // Reset form
  setNewBoat({
    name: "",
    price: "",
    image: "",
    model: "",
    category: "",
    length: "",
    lengthUnit: "ft",
    engineType: "",
    enginePower: "",
    powerUnit: "HP",
    fuelCapacity: "",
    fuelUnit: "liters",
    passengerCapacity: "",
    crewCapacity: "",
    yearOfManufacture: "",
    hullMaterial: "",
    features: [],
    description: "",
    specifications: ""
  });
  setErrors({});
} 
  };

  const addFeature = () => {
    if (newFeature.trim() && !newBoat.features.includes(newFeature.trim())) {
      setNewBoat({
        ...newBoat,
        features: [...newBoat.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const removeFeature = (featureToRemove) => {
    setNewBoat({
      ...newBoat,
      features: newBoat.features.filter(feature => feature !== featureToRemove)
    });
  };

  return (
    <Container maxW="container.xl">
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center" mb={8}>
          Create Boat
        </Heading>

        <Box
          w="full"
          bg={useColorModeValue("white", "gray.800")}
          p={8}
          rounded="lg"
          shadow="md"
        >
          <VStack spacing={6}>
            {/* Basic Information (Minimal required fields) */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.500">
                Basic Information (Required)
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Boat Name *</FormLabel>
                  <Input
                    placeholder="e.g., Speed Boat 2024V, Luxury Yacht"
                    value={newBoat.name}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, name: e.target.value })
                    }
                  />
                  {errors.name && <Text color="red.400" fontSize="sm" mt={1}>{errors.name}</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    placeholder="Select boat category"
                    value={newBoat.category}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, category: e.target.value })
                    }
                  >
                    <optgroup label="Main Categories">
                      <option value="Speed Boats">🚤 Speed Boats</option>
                      <option value="Yachts">🛥️ Yachts</option>
                      <option value="Fishing Boats">🎣 Fishing Boats</option>
                    </optgroup>
                    <optgroup label="Specialty Categories">
                      <option value="Sailboats">⛵ Sailboats</option>
                      <option value="Pontoon Boats">🛟 Pontoon Boats</option>
                      <option value="Jet Skis & Water Sports">🏄 Jet Skis & Water Sports</option>
                      <option value="Cruisers">🚢 Cruisers</option>
                      <option value="Catamarans">⛵ Catamarans</option>
                      <option value="Commercial Boats">🏢 Commercial Boats</option>
                      <option value="Other Boats">📦 Other Boats</option>
                    </optgroup>
                  </Select>
                  {errors.category && <Text color="red.400" fontSize="sm" mt={1}>{errors.category}</Text>}
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    Main categories appear prominently. Specialty categories are grouped under "Other Boats" for a professional look.
                  </Text>
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                <FormControl>
                  <FormLabel>Price *</FormLabel>
                  <Input
                    placeholder="Enter price"
                    type="number"
                    value={newBoat.price}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, price: e.target.value })
                    }
                  />
                  {errors.price && <Text color="red.400" fontSize="sm" mt={1}>{errors.price}</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>Model</FormLabel>
                  <Input
                    placeholder="e.g., 2024V, Pro Series, Luxury Edition"
                    value={newBoat.model}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, model: e.target.value })
                    }
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl mt={4}>
                <FormLabel>Image URL *</FormLabel>
                <Input
                  placeholder="https://example.com/boat-image.jpg"
                  value={newBoat.image}
                  onChange={(e) =>
                    setNewBoat({ ...newBoat, image: e.target.value })
                  }
                />
                <Text color="gray.500" fontSize="xs" mt={1}>
                  Example: https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop
                </Text>
                {errors.image && <Text color="red.400" fontSize="sm" mt={1}>{errors.image}</Text>}
              </FormControl>
            </Box>

            {/* Toggle advanced fields */}
            <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "Hide advanced details" : "Add more technical details (optional)"}
            </Button>

            <Collapse in={showAdvanced} animateOpacity>
            {/* Dimensions */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.500">
                Dimensions & Capacity
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel>Length</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Enter length"
                      type="number"
                      min="0.1"
                      max="1000"
                      step="0.1"
                      value={newBoat.length}
                      onChange={(e) =>
                        setNewBoat({ ...newBoat, length: e.target.value })
                      }
                    />
                    <Select
                      value={newBoat.lengthUnit}
                      onChange={(e) =>
                        setNewBoat({ ...newBoat, lengthUnit: e.target.value })
                      }
                    >
                      <option value="ft">ft</option>
                      <option value="meters">meters</option>
                    </Select>
                  </HStack>
                  {errors.length && <Text color="red.400" fontSize="sm" mt={1}>{errors.length}</Text>}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Passenger Capacity</FormLabel>
                  <Input
                    placeholder="Max passengers"
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={newBoat.passengerCapacity}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, passengerCapacity: e.target.value })
                    }
                  />
                  {errors.passengerCapacity && <Text color="red.400" fontSize="sm" mt={1}>{errors.passengerCapacity}</Text>}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Crew Capacity</FormLabel>
                  <Input
                    placeholder="Max crew"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={newBoat.crewCapacity}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, crewCapacity: e.target.value })
                    }
                  />
                  {errors.crewCapacity && <Text color="red.400" fontSize="sm" mt={1}>{errors.crewCapacity}</Text>}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Year of Manufacture</FormLabel>
                  <Input
                    placeholder="Year (e.g., 2024)"
                    type="number"
                    min="1900"
                    max="2030"
                    step="1"
                    value={newBoat.yearOfManufacture}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, yearOfManufacture: e.target.value })
                    }
                  />
                  {errors.yearOfManufacture && <Text color="red.400" fontSize="sm" mt={1}>{errors.yearOfManufacture}</Text>}
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Engine & Fuel */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.500">
                Engine & Fuel
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Engine Type</FormLabel>
                  <Select
                    placeholder="Select engine type"
                    value={newBoat.engineType}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, engineType: e.target.value })
                    }
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
                  <HStack>
                    <Input
                      placeholder="Enter power"
                      type="number"
                      min="0.1"
                      max="10000"
                      step="0.1"
                      value={newBoat.enginePower}
                      onChange={(e) =>
                        setNewBoat({ ...newBoat, enginePower: e.target.value })
                      }
                    />
                    <Select
                      value={newBoat.powerUnit}
                      onChange={(e) =>
                        setNewBoat({ ...newBoat, powerUnit: e.target.value })
                      }
                    >
                      <option value="HP">HP</option>
                      <option value="kW">kW</option>
                    </Select>
                  </HStack>
                  {errors.enginePower && <Text color="red.400" fontSize="sm" mt={1}>{errors.enginePower}</Text>}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Fuel Capacity</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Enter capacity"
                      type="number"
                      min="0.1"
                      max="10000"
                      step="0.1"
                      value={newBoat.fuelCapacity}
                      onChange={(e) =>
                        setNewBoat({ ...newBoat, fuelCapacity: e.target.value })
                      }
                    />
                    <Select
                      value={newBoat.fuelUnit}
                      onChange={(e) =>
                        setNewBoat({ ...newBoat, fuelUnit: e.target.value })
                      }
                    >
                      <option value="liters">liters</option>
                      <option value="gallons">gallons</option>
                    </Select>
                  </HStack>
                  {errors.fuelCapacity && <Text color="red.400" fontSize="sm" mt={1}>{errors.fuelCapacity}</Text>}
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Features */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.500">
                Features & Equipment
              </Text>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Input
                    placeholder="Add feature (e.g., GPS, Navigation System)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button onClick={addFeature} colorScheme="blue">
                    Add
                  </Button>
                </HStack>
                
                {newBoat.features.length > 0 && (
                  <Box>
                    <Text fontSize="sm" mb={2}>Added Features:</Text>
                    <HStack spacing={2} wrap="wrap">
                      {newBoat.features.map((feature, index) => (
                        <Tag key={index} size="md" colorScheme="blue" borderRadius="full">
                          <TagLabel>{feature}</TagLabel>
                          <TagCloseButton onClick={() => removeFeature(feature)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Description & Specifications */}
            <Box w="full">
              <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.500">
                Description & Specifications
              </Text>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Enter boat description"
                    rows={3}
                    value={newBoat.description}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, description: e.target.value })
                    }
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Technical Specifications</FormLabel>
                  <Textarea
                    placeholder="Enter technical specifications"
                    rows={3}
                    value={newBoat.specifications}
                    onChange={(e) =>
                      setNewBoat({ ...newBoat, specifications: e.target.value })
                    }
                  />
                </FormControl>
              </VStack>
            </Box>
            </Collapse>

            <Button 
              colorScheme="blue" 
              onClick={handleAddBoat} 
              w="full" 
              size="lg"
              bgGradient="linear(to-r, blue.500, cyan.400)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, cyan.500)"
              }}
              isDisabled={Object.keys(errors).length > 0}
            >
              Add Boat
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;

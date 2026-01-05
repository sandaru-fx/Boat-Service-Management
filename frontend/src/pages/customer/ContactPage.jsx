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
  Flex,
  SimpleGrid,
  Divider,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Stack,
  Link,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaShip,
  FaPaperPlane,
  FaWhatsapp
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: ""
  });

  
  const [contactInfo, setContactInfo] = useState({
    companyName: "Marine Service Center",
    phoneNumbers: ["+94 11 234 5678", "+94 76 123 4568"],
    email: "marineservicecenter513@gmail.com",
    address: "112, Baseline Road, Colombo 10, Sri Lanka",
    operatingHours: {
      weekdays: "Mon-Fri: 9AM-9PM",
      saturday: "Saturday: 9AM-4PM",
      sunday: "Sunday: Closed"
    },
    emergencyService: {
      available: true,
      phoneNumber: "+94 123 456 789"
    },
    whatsappNumber: "+94 76 628 0198"
  });
  
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // Fetch contact information from API
  const fetchContactInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contacts');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        // Use the first contact record (assuming there's only one main contact)
        const contact = data.data[0];
        setContactInfo({
          companyName: contact.companyName || "Marine Service Center",
          phoneNumbers: contact.phoneNumbers || ["+94 11 234 5678", "+94 76 123 4568"],
          email: contact.email || "marineservicecenter513@gmail.com",
          address: contact.address || "112, Baseline Road, Colombo 10, Sri Lanka",
          operatingHours: {
            weekdays: contact.operatingHours?.weekdays || "Mon-Fri: 9AM-9PM",
            saturday: contact.operatingHours?.saturday || "Saturday: 9AM-4PM",
            sunday: contact.operatingHours?.sunday || "Sunday: Closed"
          },
          emergencyService: {
            available: contact.emergencyService?.available || true,
            phoneNumber: contact.emergencyService?.phoneNumber || "+94 123 456 789"
          },
          whatsappNumber: contact.whatsappNumber || "+94 76 628 0198"
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: ""
    });
  };


  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Text>Loading contact information...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack spacing={4} textAlign="center">
          <HStack spacing={4}>
            <Icon as={FaShip} boxSize={8} color="blue.500" />
              <Heading
                as="h1"
                size="2xl"
                fontWeight="black"
                bgGradient="linear(to-r, blue.500, cyan.400)"
                bgClip="text"
              >
                Contact {contactInfo.companyName}
              </Heading>
          </HStack>
          <Text fontSize="lg" color={useColorModeValue("gray.600", "gray.300")} maxW="2xl">
            Get in touch with our expert team for all your marine service needs
          </Text>
        </VStack>

        {/* Back Button */}
        <Box>
          <Button
            as={RouterLink}
            to="/"
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            colorScheme="blue"
            size="sm"
          >
            Back to Home
          </Button>
        </Box>

        {/* Contact Information Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {/* Phone */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Icon as={FaPhone} boxSize={8} color="green.500" mb={4} />
              <Heading size="sm" mb={2}>Phone Numbers</Heading>
              <VStack spacing={2}>
                {contactInfo.phoneNumbers.map((phone, index) => (
                  <Text key={index} fontSize="sm" fontWeight="medium">{phone}</Text>
                ))}
              </VStack>
              <Button
                colorScheme="green"
                size="sm"
                mt={3}
                leftIcon={<Icon as={FaPhone} />}
                onClick={() => window.open("tel:+94112345678", "_self")}
              >
                Call Now
              </Button>
            </CardBody>
          </Card>

          {/* Email */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Icon as={FaEnvelope} boxSize={8} color="blue.500" mb={4} />
              <Heading size="sm" mb={2}>Email Address</Heading>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                {contactInfo.email}
              </Text>
              <Button
                colorScheme="blue"
                size="sm"
                leftIcon={<Icon as={FaEnvelope} />}
                onClick={() => {
                  const subject = "Inquiry from Marine Service Center Website";
                  const body = `Dear Marine Service Center Team,

I am writing to inquire about your marine services.

Please provide me with the following information:
- Service type needed:
- Preferred date/time:
- Boat details:
- Any specific requirements:

Thank you for your time.

Best regards,
[Your Name]`;
                  window.location.href = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
              >
                Send Email
              </Button>
            </CardBody>
          </Card>

          {/* Address */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Icon as={FaMapMarkerAlt} boxSize={8} color="red.500" mb={4} />
              <Heading size="sm" mb={2}>Our Location</Heading>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                {contactInfo.address}
              </Text>
              <Button
                colorScheme="red"
                size="sm"
                leftIcon={<Icon as={FaMapMarkerAlt} />}
                onClick={() => window.open("https://maps.google.com/?q=112+Baseline+Road+Colombo+10", "_blank")}
              >
                View on Map
              </Button>
            </CardBody>
          </Card>

          {/* Business Hours */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody textAlign="center">
              <Icon as={FaClock} boxSize={8} color="purple.500" mb={4} />
              <Heading size="sm" mb={2}>Business Hours</Heading>
              <VStack spacing={1} fontSize="sm">
                <Text>{contactInfo.operatingHours.weekdays}</Text>
                <Text>{contactInfo.operatingHours.saturday}</Text>
                <Text color="red.500">{contactInfo.operatingHours.sunday}</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Emergency Contact */}
        <Card bg="red.50" border="2px solid" borderColor="red.200">
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FaExclamationTriangle} boxSize={6} color="red.500" />
              <VStack align="start" spacing={0}>
                <Heading size="md" color="red.600">24/7 Emergency Service</Heading>
                <Text fontSize="sm" color="red.500">Available round the clock for urgent marine issues</Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <HStack spacing={4} justify="center">
              <VStack spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  Emergency Hotline
                </Text>
                <Text fontSize="xl" fontWeight="black" color="red.700">
                  {contactInfo.emergencyService.phoneNumber}
                </Text>
              </VStack>
              <Button
                colorScheme="red"
                size="lg"
                leftIcon={<Icon as={FaPhone} />}
                bg="red.600"
                _hover={{ bg: "red.700" }}
                onClick={() => window.open("tel:+94123456789", "_self")}
              >
                Call Emergency
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Contact Form */}
        <Card bg={bg} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Heading size="lg" color={useColorModeValue("gray.800", "white")}>
              Send us a Message
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.400")}>
              Fill out the form below and we'll get back to you as soon as possible
            </Text>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Inquiry Type</FormLabel>
                  <Select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    placeholder="Select inquiry type"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="service">Boat Service</option>
                    <option value="repair">Boat Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="emergency">Emergency Service</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl mt={6} isRequired>
                <FormLabel>Subject</FormLabel>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief subject of your inquiry"
                />
              </FormControl>

              <FormControl mt={6} isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please provide details about your inquiry..."
                  rows={6}
                />
              </FormControl>

              <HStack spacing={4} mt={6} justify="center">
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<Icon as={FaPaperPlane} />}
                  bgGradient="linear(to-r, blue.500, cyan.400)"
                  _hover={{
                    bgGradient: "linear(to-r, blue.600, cyan.500)",
                    transform: "translateY(-2px)",
                    shadow: "lg"
                  }}
                >
                  Send Message
                </Button>
                
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<Icon as={FaWhatsapp} />}
                  variant="outline"
                  onClick={() => window.open(`https://wa.me/${contactInfo.whatsappNumber.replace(/[^0-9]/g, '')}`, "_blank")}
                >
                  WhatsApp
                </Button>
              </HStack>
            </form>
          </CardBody>
        </Card>

      </VStack>
    </Container>
  );
};

export default ContactPage;

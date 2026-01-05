import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Link,
  Icon,
  useColorModeValue,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Divider,
  Image,
  Badge,
  Tooltip,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FaShip, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter,
  FaWhatsapp,
  FaClock,
  FaShieldAlt,
  FaAward,
  FaHeart,
  FaWater,
  FaAnchor,
  FaCompass,
  FaPaperPlane,
  FaArrowUp,
  FaStar,
  FaUsers,
  FaTools,
  FaCertificate,
  FaGlobe,
  FaRocket
} from 'react-icons/fa';

const StunningFooter = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const bgColor = useColorModeValue('gray.900', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');
  const accentColor = useColorModeValue('cyan.400', 'blue.400');

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialLinks = [
    { icon: FaFacebook, label: 'Facebook', color: '#1877F2', href: '#' },
    { icon: FaInstagram, label: 'Instagram', color: '#E4405F', href: '#' },
    { icon: FaLinkedin, label: 'LinkedIn', color: '#0077B5', href: '#' },
    { icon: FaTwitter, label: 'Twitter', color: '#1DA1F2', href: '#' },
    { icon: FaWhatsapp, label: 'WhatsApp', color: '#25D366', href: '#' },
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Boat Categories', path: '/' },
    { name: 'Reviews', path: '/boat-reviews/all' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const services = [
    'Engine Repair',
    'Boat Cleaning',
    'Maintenance',
    'Emergency Service',
    'Inspection',
    'General Service',
  ];

  const features = [
    { icon: FaShieldAlt, text: '24/7 Emergency Service' },
    { icon: FaAward, text: 'Certified Professionals' },
    { icon: FaTools, text: 'Modern Equipment' },
    { icon: FaHeart, text: 'Customer Satisfaction' },
  ];

  return (
    <>
      {/* Back to Top Button */}
      {isVisible && (
        <Button
          position="fixed"
          bottom="30px"
          right="30px"
          zIndex={1000}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          leftIcon={<Icon as={FaArrowUp} />}
          onClick={scrollToTop}
          bgGradient="linear(to-r, blue.500, cyan.400)"
          _hover={{
            bgGradient: 'linear(to-r, cyan.400, blue.500)',
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          }}
          transition="all 0.3s ease"
          animation="bounce 2s infinite"
        >
          Top
        </Button>
      )}

      {/* Main Footer */}
      <Box
        bg={bgColor}
        color={textColor}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgGradient: 'linear(to-r, blue.500, cyan.400, blue.500)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 3s ease infinite',
        }}
        sx={{
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      >
        <Container maxW="container.xl" py={16}>
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr' }} gap={8}>
            {/* Company Info */}
            <GridItem>
              <VStack align="start" spacing={6}>
                <HStack spacing={4}>
                  <Box
                    position="relative"
                    _hover={{
                      transform: 'rotate(360deg)',
                      transition: 'transform 0.8s ease',
                    }}
                  >
                    <Icon
                      as={FaShip}
                      boxSize={12}
                      color={accentColor}
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                    />
                    <Box
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      w={4}
                      h={4}
                      bg="green.400"
                      borderRadius="full"
                      animation="pulse 2s infinite"
                    />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading
                      size="lg"
                      bgGradient="linear(to-r, cyan.400, blue.400)"
                      bgClip="text"
                    >
                      Marine Service Center
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                      Premium Boat Management
                    </Text>
                  </VStack>
                </HStack>

                <Text color="gray.300" lineHeight="tall">
                  Your trusted partner for all marine services. We provide expert care for your vessel 
                  with 24/7 emergency support, certified professionals, and state-of-the-art equipment.
                </Text>

                {/* Features */}
                <VStack align="start" spacing={3}>
                  {features.map((feature, index) => (
                    <HStack
                      key={index}
                      spacing={3}
                      p={2}
                      borderRadius="md"
                      _hover={{
                        bg: 'rgba(255,255,255,0.05)',
                        transform: 'translateX(5px)',
                      }}
                      transition="all 0.3s ease"
                    >
                      <Icon as={feature.icon} color={accentColor} />
                      <Text fontSize="sm" color="gray.300">
                        {feature.text}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                {/* Social Links */}
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color={accentColor}>
                    Follow Us
                  </Text>
                  <HStack spacing={4}>
                    {socialLinks.map((social, index) => (
                      <Tooltip
                        key={index}
                        label={social.label}
                        placement="top"
                        hasArrow
                      >
                        <Box
                          as="a"
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          p={3}
                          borderRadius="full"
                          bg="rgba(255,255,255,0.1)"
                          _hover={{
                            bg: social.color,
                            transform: 'translateY(-3px) scale(1.1)',
                            boxShadow: `0 8px 25px ${social.color}40`,
                          }}
                          transition="all 0.3s ease"
                          onMouseEnter={() => setHoveredIcon(index)}
                          onMouseLeave={() => setHoveredIcon(null)}
                        >
                          <Icon
                            as={social.icon}
                            boxSize={5}
                            color={hoveredIcon === index ? 'white' : 'gray.400'}
                            transition="all 0.3s ease"
                          />
                        </Box>
                      </Tooltip>
                    ))}
                  </HStack>
                </VStack>
              </VStack>
            </GridItem>

            {/* Quick Links */}
            <GridItem>
              <VStack align="start" spacing={6}>
                <Heading size="md" color={accentColor}>
                  Quick Links
                </Heading>
                <VStack align="start" spacing={3}>
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      as={RouterLink}
                      to={link.path}
                      color="gray.300"
                      _hover={{
                        color: accentColor,
                        transform: 'translateX(5px)',
                        textDecoration: 'none',
                      }}
                      transition="all 0.3s ease"
                      position="relative"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '-15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        w: '0',
                        h: '2px',
                        bg: accentColor,
                        transition: 'width 0.3s ease',
                      }}
                      _hover={{
                        _before: { w: '10px' },
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </VStack>
              </VStack>
            </GridItem>

            {/* Services */}
            <GridItem>
              <VStack align="start" spacing={6}>
                <Heading size="md" color={accentColor}>
                  Our Services
                </Heading>
                <VStack align="start" spacing={3}>
                  {services.map((service, index) => (
                    <HStack
                      key={index}
                      spacing={3}
                      p={2}
                      borderRadius="md"
                      _hover={{
                        bg: 'rgba(255,255,255,0.05)',
                        transform: 'translateX(5px)',
                      }}
                      transition="all 0.3s ease"
                    >
                      <Icon as={FaWater} color={accentColor} />
                      <Text fontSize="sm" color="gray.300">
                        {service}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </GridItem>

            {/* Contact Info */}
            <GridItem>
              <VStack align="start" spacing={6}>
                <Heading size="md" color={accentColor}>
                  Contact Info
                </Heading>
                <VStack align="start" spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={FaMapMarkerAlt} color={accentColor} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.300">
                        112, Baseline Road
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Colombo 10, Sri Lanka
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    <Icon as={FaPhone} color={accentColor} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.300">
                        +94 11 234 5678
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        +94 76 123 4568
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    <Icon as={FaEnvelope} color={accentColor} />
                    <Text fontSize="sm" color="gray.300">
                      marineservicecenter513@gmail.com
                    </Text>
                  </HStack>

                  <HStack spacing={3}>
                    <Icon as={FaClock} color={accentColor} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.300">
                        Mon-Fri: 9AM-9PM
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        Sat: 9AM-4PM
                      </Text>
                      <Text fontSize="sm" color="red.400">
                        Sun: Closed
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                {/* Emergency Contact */}
                <Box
                  bg="rgba(239, 68, 68, 0.1)"
                  border="1px solid"
                  borderColor="red.500"
                  borderRadius="lg"
                  p={4}
                  w="full"
                >
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FaShieldAlt} color="red.400" />
                      <Text fontWeight="bold" color="red.400">
                        24/7 Emergency
                      </Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      +94 123 456 789
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      leftIcon={<Icon as={FaPhone} />}
                      w="full"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                      }}
                      transition="all 0.3s ease"
                    >
                      Call Now
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </Container>

        {/* Bottom Bar */}
        <Box
          borderTop="1px solid"
          borderColor="gray.700"
          py={6}
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            bgGradient: 'linear(to-r, transparent, cyan.400, transparent)',
          }}
        >
          <Container maxW="container.xl">
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: 'column', md: 'row' }}
              spacing={4}
            >
              <HStack spacing={6}>
                <Text fontSize="sm" color="gray.400">
                  © {currentYear} Marine Service Center. All rights reserved.
                </Text>
                <HStack spacing={4}>
                  <Link color="gray.400" fontSize="sm" _hover={{ color: accentColor }}>
                    Privacy Policy
                  </Link>
                  <Link color="gray.400" fontSize="sm" _hover={{ color: accentColor }}>
                    Terms of Service
                  </Link>
                </HStack>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.400">
                  Made with
                </Text>
                <Icon as={FaHeart} color="red.400" animation="pulse 2s infinite" />
                <Text fontSize="sm" color="gray.400">
                  in Sri Lanka
                </Text>
              </HStack>
            </Flex>
          </Container>
        </Box>
      </Box>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-8px); }
          70% { transform: translateY(-4px); }
          90% { transform: translateY(-2px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default StunningFooter;















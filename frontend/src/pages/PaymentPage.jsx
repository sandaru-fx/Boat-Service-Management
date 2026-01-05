import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge
} from '@chakra-ui/react';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCreditCard,
  FaShieldAlt
} from 'react-icons/fa';
import PaymentSection from '../components/PaymentSection.jsx';
import { formatAmount } from '../config/stripe.js';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { serviceType, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Get payment data from location state or fetch from API
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        
        // Check if payment data is passed via navigation state
        if (location.state?.paymentData) {
          setPaymentData(location.state.paymentData);
          setIsLoading(false);
          return;
        }

        // If no state data, try to fetch from API based on service type and ID
        if (serviceType && serviceId) {
          const response = await fetch(`/api/${serviceType}/${serviceId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setPaymentData({
              amount: data.amount || data.totalPrice || data.price || 2000,
              serviceType,
              serviceId,
              serviceDescription: data.description || data.name || `${serviceType} service`,
              customerInfo: {
                name: data.customerName || 'Customer',
                email: data.customerEmail || 'customer@example.com',
                phone: data.customerPhone || ''
              }
            });
          } else {
            throw new Error('Failed to fetch service details');
          }
        } else {
          throw new Error('Missing service information');
        }
      } catch (error) {
        console.error('Error initializing payment:', error);
        setError(error.message);
        toast.error('Failed to load payment information');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [serviceType, serviceId, location.state]);

  const handlePaymentSuccess = (paymentResult) => {
    setIsPaid(true);
    toast.success('Payment completed successfully!');
    
    // Redirect to success page or back to service page after a delay
    setTimeout(() => {
      navigate(`/${serviceType}/${serviceId}/success`, {
        state: { paymentResult }
      });
    }, 2000);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading payment information...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={bgColor} p={6}>
        <Box maxW="600px" mx="auto">
          <Alert status="error" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Payment Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
          <Button leftIcon={<Icon as={FaArrowLeft} />} onClick={handleGoBack}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (isPaid) {
    return (
      <Box minH="100vh" bg={bgColor} p={6}>
        <Box maxW="600px" mx="auto">
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={6} textAlign="center">
                <Icon as={FaCheckCircle} color="green.500" boxSize={16} />
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    Payment Successful!
                  </Text>
                  <Text color={mutedColor}>
                    Your payment has been processed successfully. You will receive a confirmation email shortly.
                  </Text>
                </VStack>
                <Button colorScheme="blue" onClick={() => navigate('/')}>
                  Continue
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} p={6}>
      <Box maxW="800px" mx="auto">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card bg={cardBg}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Button
                    variant="ghost"
                    leftIcon={<Icon as={FaArrowLeft} />}
                    onClick={handleGoBack}
                  >
                    Back
                  </Button>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                      Complete Your Payment
                    </Text>
                    <Text color={mutedColor}>
                      Secure payment powered by Stripe
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme="green" variant="subtle">
                  <Icon as={FaShieldAlt} mr={1} />
                  SSL Secured
                </Badge>
              </Flex>
            </CardHeader>
          </Card>

          {/* Payment Section */}
          {paymentData && (
            <PaymentSection
              amount={paymentData.amount}
              serviceType={paymentData.serviceType}
              serviceId={paymentData.serviceId}
              serviceDescription={paymentData.serviceDescription}
              customerInfo={paymentData.customerInfo}
              onPaymentComplete={handlePaymentSuccess}
              isPaid={isPaid}
            />
          )}

          {/* Payment Information */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack spacing={2}>
                <Icon as={FaCreditCard} color="blue.500" />
                <Text fontSize="lg" fontWeight="bold">Payment Information</Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info" size="sm">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Accepted Payment Methods</AlertTitle>
                    <AlertDescription fontSize="xs">
                      We accept all major credit and debit cards including Visa, Mastercard, and American Express.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Divider />
                
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text color={mutedColor}>Service:</Text>
                    <Text fontWeight="medium">{paymentData?.serviceDescription}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={mutedColor}>Amount:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {paymentData && formatAmount(paymentData.amount)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
};

export default PaymentPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Spinner,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select
} from '@chakra-ui/react';
import { 
  FaCreditCard, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaLock,
  FaRupeeSign,
  FaInfoCircle
} from 'react-icons/fa';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise, { STRIPE_CONFIG, formatAmount } from '../config/stripe.js';
import toast from 'react-hot-toast';

// Payment form component
const PaymentForm = ({ 
  amount, 
  serviceType, 
  serviceId, 
  serviceDescription, 
  customerInfo,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [error, setError] = useState(null);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('🔍 Creating payment intent with:', {
          amount,
          serviceType,
          serviceId,
          serviceDescription,
          customerInfo,
          apiUrl: process.env.REACT_APP_API_URL
        });

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount,
            currency: 'lkr',
            serviceType,
            serviceId,
            serviceDescription,
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            metadata: {
              source: 'web_app',
              userAgent: navigator.userAgent
            }
          })
        });

        console.log('📡 Payment intent response status:', response.status);
        const data = await response.json();
        console.log('📡 Payment intent response data:', data);
        
        if (data.success) {
          setPaymentIntent(data.data);
        } else {
          throw new Error(data.message || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('❌ Error creating payment intent:', error);
        setError(error.message);
        onPaymentError && onPaymentError(error);
      }
    };

    if (amount && serviceType && serviceId && customerInfo) {
      createPaymentIntent();
    }
  }, [amount, serviceType, serviceId, customerInfo]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (confirmedPaymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        const confirmResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/payment/${paymentIntent.paymentId}/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          toast.success('Payment completed successfully!');
          onPaymentSuccess && onPaymentSuccess(confirmData.data);
        } else {
          throw new Error(confirmData.message || 'Failed to confirm payment');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
      onPaymentError && onPaymentError(error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  if (!paymentIntent) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4}>Setting up secure payment...</Text>
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Payment Summary */}
        <Card>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Payment Summary</Text>
              <HStack justify="space-between">
                <Text>{serviceDescription}</Text>
                <Text fontWeight="bold" color="blue.600">
                  {formatAmount(amount)}
                </Text>
              </HStack>
              <Divider />
              <HStack justify="space-between" fontSize="lg" fontWeight="bold">
                <Text>Total Amount</Text>
                <Text color="green.600">{formatAmount(amount)}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Card Details */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaCreditCard} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">Card Details</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
                <CardElement options={cardElementOptions} />
              </Box>
              
              {/* Test Card Info */}
              <Alert status="info" size="sm">
                <AlertIcon as={FaInfoCircle} />
                <Box>
                  <AlertTitle fontSize="sm">Test Mode</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Use test card: 4242 4242 4242 4242, any future date, any CVC
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Payment Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Security Notice */}
        <Alert status="success" size="sm">
          <AlertIcon as={FaLock} />
          <Box>
            <AlertTitle fontSize="sm">Secure Payment</AlertTitle>
            <AlertDescription fontSize="xs">
              Your payment information is encrypted and secure. We never store your card details.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Action Buttons */}
        <HStack spacing={4}>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            flex={1}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isProcessing}
            loadingText="Processing..."
            disabled={!stripe || isProcessing}
            flex={2}
            leftIcon={<Icon as={FaShieldAlt} />}
          >
            Pay {formatAmount(amount)}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

// Main Stripe Payment Component
const StripePayment = ({ 
  isOpen, 
  onClose, 
  amount, 
  serviceType, 
  serviceId, 
  serviceDescription,
  customerInfo,
  onPaymentSuccess,
  onPaymentError
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handlePaymentSuccess = (paymentData) => {
    onPaymentSuccess && onPaymentSuccess(paymentData);
    onClose();
  };

  const handlePaymentError = (error) => {
    onPaymentError && onPaymentError(error);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} maxW="600px">
        <ModalHeader>
          <HStack>
            <Icon as={FaCreditCard} color="blue.500" />
            <Text>Secure Payment</Text>
            <Badge colorScheme="green" ml={2}>SSL Secured</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Elements stripe={stripePromise}>
            <PaymentForm
              amount={amount}
              serviceType={serviceType}
              serviceId={serviceId}
              serviceDescription={serviceDescription}
              customerInfo={customerInfo}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
            />
          </Elements>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StripePayment;

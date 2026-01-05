import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Badge,
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
  useDisclosure
} from '@chakra-ui/react';
import { 
  FaCreditCard, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaLock,
  FaRupeeSign
} from 'react-icons/fa';
import StripePayment from './StripePayment.jsx';
import { formatAmount } from '../config/stripe.js';
import toast from 'react-hot-toast';

const PaymentSection = ({ 
  onPaymentComplete, 
  isPaid = false, 
  isLoading = false, 
  amount = 2000,
  serviceType,
  serviceId,
  serviceDescription,
  customerInfo
}) => {
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const summaryBgColor = useColorModeValue('gray.50', 'gray.700');

  const handlePaymentClick = () => {
    if (!amount || amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    if (!serviceType || !serviceId || !serviceDescription) {
      toast.error('Missing service information');
      return;
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      toast.error('Missing customer information');
      return;
    }

    onOpen();
  };

  const handlePaymentSuccess = (paymentData) => {
    setPaymentStatus('completed');
    toast.success('Payment completed successfully! Redirecting to order confirmation...');
    onClose(); // Close the payment modal
    
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      onPaymentComplete && onPaymentComplete(paymentData);
    }, 500);
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('failed');
    console.error('Payment error:', error);
  };

  const getPaymentButtonContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <HStack spacing={2}>
            <Spinner size="sm" color="white" />
            <Text>Processing Payment...</Text>
          </HStack>
        );
      case 'completed':
        return (
          <HStack spacing={2}>
            <Icon as={FaCheckCircle} />
            <Text>Payment Completed</Text>
          </HStack>
        );
      case 'failed':
        return (
          <HStack spacing={2}>
            <Icon as={FaExclamationTriangle} />
            <Text>Payment Failed - Try Again</Text>
          </HStack>
        );
      default:
        return (
          <HStack spacing={2}>
            <Icon as={FaCreditCard} />
            <Text>Pay {formatAmount(amount)}</Text>
          </HStack>
        );
    }
  };

  const getPaymentButtonProps = () => {
    switch (paymentStatus) {
      case 'processing':
        return {
          colorScheme: 'blue',
          isLoading: true,
          loadingText: 'Processing...',
          disabled: true,
        };
      case 'completed':
        return {
          colorScheme: 'green',
          disabled: true,
        };
      case 'failed':
        return {
          colorScheme: 'red',
          onClick: () => {
            setPaymentStatus('pending');
            handlePaymentClick();
          },
        };
      default:
        return {
          colorScheme: 'blue',
          onClick: handlePaymentClick,
        };
    }
  };

  if (isPaid) {
    return (
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <VStack spacing={4}>
            <HStack spacing={2}>
              <Icon as={FaCheckCircle} color="green.500" boxSize={6} />
              <Text fontSize="lg" fontWeight="bold" color="green.600">
                Payment Completed
              </Text>
            </HStack>
            <Text color={mutedColor} textAlign="center">
              Your payment has been successfully processed. You will receive a confirmation email shortly.
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FaCreditCard} color="blue.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Payment Required
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  Complete your payment to proceed
                </Text>
              </VStack>
            </HStack>
            <Badge colorScheme="blue" variant="subtle">
              Secure Payment
            </Badge>
          </Flex>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Payment Summary */}
            <Box p={4} bg={summaryBgColor} borderRadius="md">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text color={mutedColor}>Service:</Text>
                  <Text fontWeight="medium">{serviceDescription}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={mutedColor}>Amount:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    {formatAmount(amount)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Security Features */}
            <VStack spacing={3} align="stretch">
              <HStack spacing={2}>
                <Icon as={FaLock} color="green.500" />
                <Text fontSize="sm" color={mutedColor}>
                  Your payment information is encrypted and secure
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaShieldAlt} color="blue.500" />
                <Text fontSize="sm" color={mutedColor}>
                  Powered by Stripe - trusted by millions of businesses
                </Text>
              </HStack>
            </VStack>

            {/* Payment Button */}
            <Button
              size="lg"
              leftIcon={<Icon as={FaCreditCard} />}
              {...getPaymentButtonProps()}
              isLoading={isLoading}
              loadingText="Loading..."
            >
              {getPaymentButtonContent()}
            </Button>

            {/* Additional Information */}
            <Alert status="info" size="sm">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Payment Information</AlertTitle>
                <AlertDescription fontSize="xs">
                  You will be redirected to our secure payment gateway. 
                  We accept all major credit and debit cards.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </CardBody>
      </Card>

      {/* Stripe Payment Modal */}
      <StripePayment
        isOpen={isOpen}
        onClose={onClose}
        amount={amount}
        serviceType={serviceType}
        serviceId={serviceId}
        serviceDescription={serviceDescription}
        customerInfo={customerInfo}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </>
  );
};

export default PaymentSection;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  useColorModeValue,
  Icon,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaShip, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaFilter,
  FaCreditCard,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft
} from 'react-icons/fa';

const AdminAppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors at top level
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/appointments`;
      const params = new URLSearchParams();
      
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterDate) params.append('date', filterDate);
      if (filterPayment !== 'All') params.append('paymentStatus', filterPayment);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, filterDate, filterPayment]);

  // Update appointment status
  const updateAppointmentStatus = async (id, status, adminNotes = '') => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Appointment status updated to ${status}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchAppointments();
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update appointment status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete appointment
  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Success',
            description: 'Appointment deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchAppointments();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete appointment',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'yellow';
      case 'Confirmed': return 'blue';
      case 'In Progress': return 'orange';
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading appointments...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
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
        
        <Box textAlign="center">
          <Heading size="2xl" color={headingColor}>
            Appointment Management
          </Heading>
          <Text mt={2} color={textColor}>
            Manage customer appointments and service reservations
          </Text>
        </Box>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={4}>
              <Icon as={FaFilter} />
              <Heading size="md">Filters</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Payment Status</FormLabel>
                <Select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
                  <option value="All">All Payments</option>
                  <option value="completed">Paid</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Actions</FormLabel>
                <Button
                  colorScheme="blue"
                  onClick={fetchAppointments}
                  leftIcon={<Icon as={FaFilter} />}
                >
                  Apply Filters
                </Button>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Appointments Table */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Appointments ({appointments.length})</Heading>
          </CardHeader>
          <CardBody>
            {appointments.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Customer</Th>
                      <Th>Service</Th>
                      <Th>Date & Time</Th>
                      <Th>Boat</Th>
                      <Th>Payment</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {appointments.map((appointment) => (
                      <Tr key={appointment._id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{appointment.customerName}</Text>
                            <Text fontSize="sm" color="gray.500">{appointment.customerEmail}</Text>
                            <Text fontSize="sm" color="gray.500">{appointment.customerPhone}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{appointment.serviceType}</Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {appointment.description}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{formatDate(appointment.appointmentDate)}</Text>
                            <Text fontSize="sm" color="gray.500">{appointment.appointmentTime}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{appointment.boatDetails.boatName}</Text>
                            <Text fontSize="sm" color="gray.500">{appointment.boatDetails.boatType}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="green.600">
                              {appointment.estimatedCost && appointment.estimatedCost > 0 ? `${appointment.estimatedCost.toLocaleString()} LKR` : '2,000 LKR'}
                            </Text>
                            <Badge 
                              colorScheme="green"
                              size="sm"
                            >
                              Paid
                            </Badge>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<Icon as={FaEye} />}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                onDetailOpen();
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<Icon as={FaEdit} />}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                onOpen();
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<Icon as={FaTrash} />}
                              onClick={() => deleteAppointment(appointment._id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>No appointments found!</AlertTitle>
                  <AlertDescription>
                    No appointments match your current filters.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Status Update Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Appointment Status</ModalHeader>
            <ModalBody>
              {selectedAppointment && (
                <VStack spacing={4} align="stretch">
                  <Text><strong>Customer:</strong> {selectedAppointment.customerName}</Text>
                  <Text><strong>Service:</strong> {selectedAppointment.serviceType}</Text>
                  <Text><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}</Text>
                  
                  <FormControl>
                    <FormLabel>New Status</FormLabel>
                    <Select id="status" defaultValue={selectedAppointment.status}>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Admin Notes</FormLabel>
                    <Textarea
                      placeholder="Add any notes about this appointment..."
                      defaultValue={selectedAppointment.adminNotes}
                    />
                  </FormControl>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  const status = document.getElementById('status').value;
                  const notes = document.querySelector('textarea').value;
                  updateAppointmentStatus(selectedAppointment._id, status, notes);
                }}
              >
                Update Status
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Appointment Detail Modal */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Appointment Details</ModalHeader>
            <ModalBody>
              {selectedAppointment && (
                <VStack spacing={6} align="stretch">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <Icon as={FaUser} />
                        <Heading size="sm">Customer Information</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <Text><strong>Name:</strong> {selectedAppointment.customerName}</Text>
                        <Text><strong>Email:</strong> {selectedAppointment.customerEmail}</Text>
                        <Text><strong>Phone:</strong> {selectedAppointment.customerPhone}</Text>
                        <Text><strong>Priority:</strong> {selectedAppointment.priority}</Text>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Service Information */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <Icon as={FaCalendarAlt} />
                        <Heading size="sm">Service Information</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <Text><strong>Service Type:</strong> {selectedAppointment.serviceType}</Text>
                        <Text><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}</Text>
                        <Text><strong>Time:</strong> {selectedAppointment.appointmentTime}</Text>
                        <Text><strong>Duration:</strong> {selectedAppointment.estimatedDuration} hours</Text>
                        <Text><strong>Status:</strong> 
                          <Badge ml={2} colorScheme={getStatusColor(selectedAppointment.status)}>
                            {selectedAppointment.status}
                          </Badge>
                        </Text>
                        <Text><strong>Estimated Cost:</strong> LKR {selectedAppointment.estimatedCost?.toLocaleString()}</Text>
                      </SimpleGrid>
                      <Text mt={4}><strong>Description:</strong> {selectedAppointment.description}</Text>
                    </CardBody>
                  </Card>

                  {/* Boat Information */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <Icon as={FaShip} />
                        <Heading size="sm">Boat Information</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <Text><strong>Boat Name:</strong> {selectedAppointment.boatDetails.boatName}</Text>
                        <Text><strong>Boat Type:</strong> {selectedAppointment.boatDetails.boatType}</Text>
                        <Text><strong>Length:</strong> {selectedAppointment.boatDetails.boatLength || 'Not specified'}</Text>
                        <Text><strong>Engine Type:</strong> {selectedAppointment.boatDetails.engineType || 'Not specified'}</Text>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <Icon as={FaCreditCard} />
                        <Heading size="sm">Payment Information</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold" color="green.600" fontSize="xl">
                            {selectedAppointment.estimatedCost && selectedAppointment.estimatedCost > 0 ? `${selectedAppointment.estimatedCost.toLocaleString()} LKR` : '2,000 LKR'}
                          </Text>
                          <Text fontSize="sm" color="gray.500">Service Fee</Text>
                        </VStack>
                        <VStack align="start" spacing={2}>
                          <Badge 
                            colorScheme={selectedAppointment.paymentStatus === 'completed' ? 'green' : 'red'}
                            size="lg"
                          >
                            <HStack spacing={1}>
                              <Icon as={selectedAppointment.paymentStatus === 'completed' ? FaCheckCircle : FaSpinner} />
                              <Text>
                                {selectedAppointment.paymentStatus === 'completed' ? 'Payment Completed' : 'Payment Pending'}
                              </Text>
                            </HStack>
                          </Badge>
                          <Text fontSize="sm" color="gray.500">
                            {selectedAppointment.paymentStatus === 'completed' ? 'Paid via secure payment system' : 'Awaiting payment completion'}
                          </Text>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Admin Notes */}
                  {selectedAppointment.adminNotes && (
                    <Card>
                      <CardHeader>
                        <HStack>
                          <Icon as={FaExclamationTriangle} />
                          <Heading size="sm">Admin Notes</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <Text>{selectedAppointment.adminNotes}</Text>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onDetailClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default AdminAppointmentPage;

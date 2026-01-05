import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Badge,
  SimpleGrid,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaCalendarAlt,
  FaArrowLeft,
  FaShip,
  FaUser,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes
} from "react-icons/fa";

const CustomerAppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const toast = useToast();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  // Fetch customer appointments
  const fetchAppointments = async () => {
    console.log('Current user object:', user);
    
    if (!user) {
      setError("Please log in to view your appointments");
      setLoading(false);
      return;
    }

    if (!user.email) {
      setError("User email not found. Please check your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching appointments for email:', user.email);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/customer?customerEmail=${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Appointments response:', data);
      if (data.success) {
        setAppointments(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: `Failed to fetch appointments: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Fetch available time slots for editing
  const fetchAvailableTimeSlots = async (date) => {
    if (!date) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/available-slots/${date}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAvailableTimeSlots(data.data.availableSlots || []);
      } else {
        throw new Error(data.message || 'Failed to fetch time slots');
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch available time slots: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setAvailableTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    if (appointment.status && appointment.status.toLowerCase() !== 'pending') {
      toast({
        title: 'Cannot Edit',
        description: 'Only pending appointments can be edited.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEditingAppointment(appointment);
    setEditFormData({
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      boatDetails: {
        boatName: appointment.boatDetails?.boatName || '',
        boatType: appointment.boatDetails?.boatType || '',
        boatLength: appointment.boatDetails?.boatLength || '',
        engineType: appointment.boatDetails?.engineType || ''
      },
      description: appointment.description || '',
      estimatedDuration: appointment.estimatedDuration || 1
    });
    
    // Fetch time slots for the current date
    if (appointment.appointmentDate) {
      fetchAvailableTimeSlots(appointment.appointmentDate);
    }
    
    onEditOpen();
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointment) => {
    if (appointment.status && appointment.status.toLowerCase() !== 'pending') {
      toast({
        title: 'Cannot Cancel',
        description: 'Only pending appointments can be cancelled.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAppointmentToDelete(appointment);
    onDeleteOpen();
  };

  // Update appointment
  const handleUpdateAppointment = async () => {
    if (!editingAppointment || !user?.email) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/customer/${editingAppointment._id}?customerEmail=${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Appointment Updated!",
          description: "Your appointment has been successfully updated.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh appointments list
        fetchAppointments();
        onEditClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update appointment. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Delete appointment
  const handleConfirmDelete = async () => {
    if (!appointmentToDelete || !user?.email) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/customer/${appointmentToDelete._id}?customerEmail=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Appointment Cancelled!",
          description: "Your appointment has been successfully cancelled.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh appointments list
        fetchAppointments();
        onDeleteClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel appointment. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    return timeString;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color={subTextColor}>Loading your appointments...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading appointments!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
        <Box mt={4} textAlign="center">
          {!user ? (
            <VStack spacing={4}>
              <Text>Please log in to view your appointments.</Text>
              <Button as={RouterLink} to="/login" colorScheme="blue">
                Go to Login
              </Button>
            </VStack>
          ) : (
            <HStack spacing={4} justify="center">
              <Button onClick={fetchAppointments} colorScheme="blue">
                Try Again
              </Button>
              <Button as={RouterLink} to="/dashboard" variant="outline">
                Back to Dashboard
              </Button>
            </HStack>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={4} mb={4}>
          <Button
            as={RouterLink}
            to="/dashboard"
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            colorScheme="blue"
            size="sm"
          >
            Back to Dashboard
          </Button>
        </HStack>
        
        <Heading
          as="h1"
          size="2xl"
          fontWeight="black"
          bgGradient="linear(to-r, blue.500, cyan.400)"
          bgClip="text"
          mb={2}
        >
          My Appointments
        </Heading>
        <Text fontSize="lg" color={subTextColor}>
          View and manage your boat purchase appointments
        </Text>
      </Box>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card bg={bg} border="1px solid" borderColor={borderColor}>
          <CardBody textAlign="center" py={12}>
            <Icon as={FaCalendarAlt} boxSize={16} color="gray.400" mb={4} />
            <Heading size="lg" color={textColor} mb={2}>
              No Appointments Found
            </Heading>
            <Text color={subTextColor} mb={6}>
              You haven't booked any appointments yet. Book your first boat visit to get started!
            </Text>
            <Button
              as={RouterLink}
              to="/boat-catalog"
              colorScheme="blue"
              size="lg"
              leftIcon={<Icon as={FaShip} />}
            >
              Browse Boats
            </Button>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {appointments.map((appointment) => (
            <Card
              key={appointment._id}
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
              _hover={{
                shadow: "lg",
                transform: "translateY(-2px)",
                transition: "all 0.2s ease"
              }}
            >
              <CardHeader>
                <HStack justify="space-between" align="flex-start">
                  <VStack align="flex-start" spacing={1}>
                    <Heading size="md" color={textColor}>
                      {appointment.serviceType || 'Boat Purchase Visit'}
                    </Heading>
                    <Text fontSize="sm" color={subTextColor}>
                      {appointment.boatDetails?.boatName || 'General Visit'}
                    </Text>
                  </VStack>
                  <Badge
                    colorScheme={getStatusColor(appointment.status)}
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {appointment.status || 'Pending'}
                  </Badge>
                </HStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  {/* Date & Time */}
                  <HStack spacing={4}>
                    <HStack spacing={2}>
                      <Icon as={FaCalendarAlt} color="blue.500" />
                      <Text fontSize="sm" color={textColor}>
                        {formatDate(appointment.appointmentDate)}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FaClock} color="green.500" />
                      <Text fontSize="sm" color={textColor}>
                        {formatTime(appointment.appointmentTime)}
                      </Text>
                    </HStack>
                  </HStack>

                  <Divider />

                  {/* Customer Info */}
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={2}>
                      <Icon as={FaUser} color="purple.500" />
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {appointment.customerName}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FaEnvelope} color="orange.500" />
                      <Text fontSize="sm" color={subTextColor}>
                        {appointment.customerEmail}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FaPhone} color="teal.500" />
                      <Text fontSize="sm" color={subTextColor}>
                        {appointment.customerPhone}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Boat Details */}
                  {appointment.boatDetails && (
                    <>
                      <Divider />
                      <VStack spacing={2} align="stretch">
                        <HStack spacing={2}>
                          <Icon as={FaShip} color="cyan.500" />
                          <Text fontSize="sm" fontWeight="medium" color={textColor}>
                            Boat Details
                          </Text>
                        </HStack>
                        {appointment.boatDetails.boatName && (
                          <Text fontSize="sm" color={subTextColor} pl={6}>
                            Name: {appointment.boatDetails.boatName}
                          </Text>
                        )}
                        {appointment.boatDetails.boatType && (
                          <Text fontSize="sm" color={subTextColor} pl={6}>
                            Type: {appointment.boatDetails.boatType}
                          </Text>
                        )}
                        {appointment.boatDetails.boatLength && (
                          <Text fontSize="sm" color={subTextColor} pl={6}>
                            Length: {appointment.boatDetails.boatLength}
                          </Text>
                        )}
                        {appointment.boatDetails.engineType && (
                          <Text fontSize="sm" color={subTextColor} pl={6}>
                            Engine: {appointment.boatDetails.engineType}
                          </Text>
                        )}
                      </VStack>
                    </>
                  )}

                  {/* Description */}
                  {appointment.description && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
                          Additional Notes:
                        </Text>
                        <Text fontSize="sm" color={subTextColor}>
                          {appointment.description}
                        </Text>
                      </Box>
                    </>
                  )}

                  {/* Estimated Duration */}
                  {appointment.estimatedDuration && (
                    <HStack spacing={2}>
                      <Icon as={FaClock} color="indigo.500" />
                      <Text fontSize="sm" color={subTextColor}>
                        Estimated Duration: {appointment.estimatedDuration} hour{appointment.estimatedDuration !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  )}

                  {/* Action Buttons */}
                  <Divider />
                  <HStack spacing={2} justify="center">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<Icon as={FaEdit} />}
                      onClick={() => handleEditAppointment(appointment)}
                      isDisabled={appointment.status && appointment.status.toLowerCase() !== 'pending'}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<Icon as={FaTrash} />}
                      onClick={() => handleDeleteAppointment(appointment)}
                      isDisabled={appointment.status && appointment.status.toLowerCase() !== 'pending'}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Action Buttons */}
      <Box mt={8} textAlign="center">
        <HStack spacing={4} justify="center">
          <Button
            as={RouterLink}
            to="/boat-catalog"
            colorScheme="blue"
            size="lg"
            leftIcon={<Icon as={FaShip} />}
          >
            Book Another Appointment
          </Button>
          <Button
            as={RouterLink}
            to="/dashboard"
            variant="outline"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </HStack>
      </Box>

      {/* Edit Appointment Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/* Date */}
              <FormControl>
                <FormLabel>Appointment Date</FormLabel>
                <Input
                  type="date"
                  value={editFormData.appointmentDate || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setEditFormData(prev => ({ ...prev, appointmentDate: newDate }));
                    if (newDate) {
                      fetchAvailableTimeSlots(newDate);
                    }
                  }}
                />
              </FormControl>

              {/* Time */}
              <FormControl>
                <FormLabel>Appointment Time</FormLabel>
                <Select
                  value={editFormData.appointmentTime || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  placeholder="Select time slot"
                >
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Select>
                {loadingSlots && <Text fontSize="sm" color="gray.500">Loading time slots...</Text>}
              </FormControl>

              {/* Boat Details */}
              <FormControl>
                <FormLabel>Boat Name</FormLabel>
                <Input
                  value={editFormData.boatDetails?.boatName || ''}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    boatDetails: { ...prev.boatDetails, boatName: e.target.value }
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Boat Type</FormLabel>
                <Input
                  value={editFormData.boatDetails?.boatType || ''}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    boatDetails: { ...prev.boatDetails, boatType: e.target.value }
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Boat Length</FormLabel>
                <Input
                  value={editFormData.boatDetails?.boatLength || ''}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    boatDetails: { ...prev.boatDetails, boatLength: e.target.value }
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Engine Type</FormLabel>
                <Input
                  value={editFormData.boatDetails?.engineType || ''}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    boatDetails: { ...prev.boatDetails, engineType: e.target.value }
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Additional Details</FormLabel>
                <Textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any additional information about your boat purchase interest..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Estimated Duration (hours)</FormLabel>
                <Select
                  value={editFormData.estimatedDuration || 1}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateAppointment}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Appointment
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              {appointmentToDelete && (
                <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    Appointment Details:
                  </Text>
                  <Text fontSize="sm">
                    Date: {formatDate(appointmentToDelete.appointmentDate)}
                  </Text>
                  <Text fontSize="sm">
                    Time: {formatTime(appointmentToDelete.appointmentTime)}
                  </Text>
                  <Text fontSize="sm">
                    Boat: {appointmentToDelete.boatDetails?.boatName || 'General Visit'}
                  </Text>
                </Box>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose}>
                Keep Appointment
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Cancel Appointment
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default CustomerAppointmentsPage;

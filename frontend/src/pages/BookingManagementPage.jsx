import React, { useEffect, useState } from 'react';
import { 
	Box, 
	Container, 
	Heading, 
	Text, 
	VStack, 
	HStack,
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	Select,
	Grid,
	Badge,
	useColorModeValue,
	Alert,
	AlertIcon,
	AlertDescription,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Textarea,
	useDisclosure
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useBoatBookingStore } from '../store/boatBookingStore';
import { useToastNotification } from '../components/ToastNotification';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingCard from '../components/BookingCard';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BookingManagementPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const statusFilter = searchParams.get('status');

	const { 
		bookings, 
		loading, 
		error, 
		fetchBookings,
		fetchBookingsByStatus,
		fetchFlaggedBookings,
		updateBookingStatus,
		reviewBookingContent,
		deleteBoatBooking,
		clearError 
	} = useBoatBookingStore();
	
	const { showSuccess, showError } = useToastNotification();
	const { isOpen, onOpen, onClose } = useDisclosure();
	
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredBookings, setFilteredBookings] = useState([]);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [actionType, setActionType] = useState('');
	const [formData, setFormData] = useState({
		status: '',
		notes: '',
		quotedPrice: '',
		assignedEmployee: '',
		reviewAction: '',
		employeeNotes: '',
		customMessage: ''
	});

	const bgColor = useColorModeValue('gray.50', 'gray.900');
	const cardBg = useColorModeValue('white', 'gray.800');

	useEffect(() => {
		if (statusFilter === 'flagged') {
			fetchFlaggedBookings();
		} else if (statusFilter) {
			fetchBookingsByStatus(statusFilter);
		} else {
			fetchBookings();
		}
	}, [statusFilter]);

	useEffect(() => {
		if (error) {
			showError('Error', error);
			clearError();
		}
	}, [error]);

	// Filter bookings based on search query
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredBookings(bookings);
		} else {
			const filtered = bookings.filter(booking =>
				booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				booking.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
				booking.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())
			);
			setFilteredBookings(filtered);
		}
	}, [bookings, searchQuery]);

	const handleSearch = (e) => {
		e.preventDefault();
		// Search is handled by the filteredBookings useEffect
		// No need to call API, just filter locally
	};

	const handleStatusUpdate = async () => {
		if (!selectedBooking) return;

		try {
			const result = await updateBookingStatus(selectedBooking._id, {
				status: formData.status,
				notes: formData.notes,
				quotedPrice: formData.quotedPrice ? parseFloat(formData.quotedPrice) : undefined,
				assignedEmployee: formData.assignedEmployee
			});

			if (result.success) {
				showSuccess('Success', 'Booking status updated successfully');
				onClose();
				// Refresh bookings
				if (statusFilter === 'flagged') {
					fetchFlaggedBookings();
				} else if (statusFilter) {
					fetchBookingsByStatus(statusFilter);
				} else {
					fetchBookings();
				}
			} else {
				showError('Error', result.message);
			}
		} catch (error) {
			showError('Error', 'Failed to update booking status');
		}
	};


	const handleReviewContent = async () => {
		if (!selectedBooking) return;

		try {
			const result = await reviewBookingContent(
				selectedBooking._id, 
				formData.reviewAction, 
				formData.employeeNotes, 
				formData.sendTerms
			);

			if (result.success) {
				showSuccess('Success', 'Booking content reviewed successfully');
				onClose();
				// Refresh bookings
				if (statusFilter === 'flagged') {
					fetchFlaggedBookings();
				} else if (statusFilter) {
					fetchBookingsByStatus(statusFilter);
				} else {
					fetchBookings();
				}
			} else {
				showError('Error', result.message);
			}
		} catch (error) {
			showError('Error', 'Failed to review booking content');
		}
	};

	const openModal = (booking, action) => {
		setSelectedBooking(booking);
		setActionType(action);
		setFormData({
			status: booking.employeeInfo?.status || 'Pending Review',
			notes: booking.employeeInfo?.employeeNotes || '',
			quotedPrice: booking.employeeInfo?.quotedPrice || '',
			assignedEmployee: booking.employeeInfo?.assignedEmployee || '',
			reviewAction: '',
			employeeNotes: '',
			sendTerms: false,
			termsReason: 'employee_request',
			customMessage: ''
		});
		onOpen();
	};

	const handleReviewBooking = (bookingId, action) => {
		const booking = bookings.find(b => b._id === bookingId);
		if (booking) {
			openModal(booking, 'review');
		}
	};


	const handleEditBooking = (booking) => {
		openModal(booking, 'edit');
	};

	const handleDeleteBooking = async (bookingId) => {
		if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
			return;
		}

		try {
			const result = await deleteBoatBooking(bookingId);
			
			if (result.success) {
				showSuccess('Success', 'Booking deleted successfully');
				// Refresh bookings
				fetchBookings();
			} else {
				showError('Error', result.message);
			}
		} catch (error) {
			showError('Error', 'Failed to delete booking');
		}
	};

	const getStatusBadge = (status) => {
		const statusColors = {
			'Pending Review': 'yellow',
			'Confirmed': 'green',
			'Cancelled': 'red',
			'Completed': 'blue',
			'In Progress': 'purple'
		};
		return statusColors[status] || 'gray';
	};

	if (loading) {
		return <LoadingSpinner message="Loading bookings..." />;
	}

	return (
		<Box bg={bgColor} minH="100vh" py={8}>
			<Container maxW="7xl">
				<VStack spacing={8} align="stretch">
					{/* Back Button */}
					<Box>
						<Button
							variant="ghost"
							onClick={() => navigate('/employee')}
							color="blue.600"
							_hover={{ color: "blue.800" }}
							fontSize="sm"
						>
							← Back to Dashboard
						</Button>
					</Box>

					{/* Header */}
					<Box textAlign="center">
						<Heading size="xl" color="blue.600" mb={4}>
							📋 Booking Management
						</Heading>
						<Text fontSize="lg" color="gray.600">
							Manage and review customer booking requests
						</Text>
					</Box>

					{/* Search and Filters */}
					<Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
						<VStack spacing={4}>
							<form onSubmit={handleSearch} style={{ width: '100%' }}>
								<InputGroup>
									<InputLeftElement pointerEvents="none">
										<SearchIcon color="gray.300" />
									</InputLeftElement>
									<Input
										placeholder="Search bookings..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										bg="white"
									/>
								</InputGroup>
							</form>

							<HStack spacing={4} width="100%" flexWrap="wrap">
								<Select
									placeholder="Filter by status"
									value={statusFilter || ''}
									onChange={(e) => {
										const newStatus = e.target.value;
										if (newStatus === 'flagged') {
											window.location.href = '/employee/bookings?status=flagged';
										} else if (newStatus) {
											window.location.href = `/employee/bookings?status=${newStatus}`;
										} else {
											window.location.href = '/employee/bookings';
										}
									}}
									maxW="200px"
									bg="white"
								>
									<option value="">All Bookings</option>
									<option value="Pending Review">Pending Review</option>
									<option value="Confirmed">Confirmed</option>
									<option value="Cancelled">Cancelled</option>
									<option value="Completed">Completed</option>
									<option value="In Progress">In Progress</option>
									<option value="flagged">Flagged Content</option>
								</Select>

								<Button
									colorScheme="blue"
									variant="outline"
									onClick={() => {
										setSearchQuery('');
									}}
								>
									Clear Search
								</Button>

								<Badge colorScheme="blue" fontSize="sm">
									{filteredBookings.length} bookings found
								</Badge>
							</HStack>
						</VStack>
					</Box>

					{/* Bookings Grid */}
					{filteredBookings.length > 0 ? (
						<Grid
							templateColumns={{
								base: '1fr',
								md: 'repeat(2, 1fr)',
								lg: 'repeat(3, 1fr)'
							}}
							gap={6}
						>
							{filteredBookings.map((booking) => (
								<BookingCard
									key={booking._id}
									booking={booking}
									onReview={handleReviewBooking}
									onEdit={handleEditBooking}
									onDelete={handleDeleteBooking}
									isEmployee={true}
								/>
							))}
						</Grid>
					) : (
						<Box textAlign="center" py={12}>
							<Text fontSize="lg" color="gray.500">
								{searchQuery ? `No bookings found matching "${searchQuery}".` : 'No bookings found matching your criteria.'}
							</Text>
							<Button
								colorScheme="blue"
								mt={4}
								onClick={() => window.location.href = '/employee/bookings'}
							>
								View All Bookings
							</Button>
						</Box>
					)}

					{/* Action Modal */}
					<Modal isOpen={isOpen} onClose={onClose} size="lg">
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>
								{actionType === 'edit' && 'Update Booking Status'}
								{actionType === 'review' && 'Review Booking Content'}
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<VStack spacing={4} align="stretch">
									{selectedBooking && (
										<Box bg="gray.50" p={4} borderRadius="md">
											<Text fontWeight="bold">Customer: {selectedBooking.customerName}</Text>
											<Text>Package: {selectedBooking.packageName}</Text>
											<Text>Date: {new Date(selectedBooking.bookingDate).toLocaleDateString()}</Text>
											<Badge colorScheme={getStatusBadge(selectedBooking.employeeInfo?.status)}>
												{selectedBooking.employeeInfo?.status || 'Pending Review'}
											</Badge>
										</Box>
									)}

									{actionType === 'edit' && (
										<>
											<FormControl>
												<FormLabel>Status</FormLabel>
												<Select
													value={formData.status}
													onChange={(e) => setFormData({...formData, status: e.target.value})}
												>
													<option value="Pending Review">Pending Review</option>
													<option value="Confirmed">Confirmed</option>
													<option value="Cancelled">Cancelled</option>
													<option value="In Progress">In Progress</option>
													{(() => {
														const bookingDate = new Date(selectedBooking?.bookingDate);
														const today = new Date();
														today.setHours(0, 0, 0, 0);
														bookingDate.setHours(0, 0, 0, 0);
														
														if (bookingDate <= today) {
															return <option value="Completed">Completed</option>;
														}
														return null;
													})()}
												</Select>
											</FormControl>

											<FormControl>
												<FormLabel>Employee Notes</FormLabel>
												<Textarea
													value={formData.notes}
													onChange={(e) => setFormData({...formData, notes: e.target.value})}
													placeholder="Add notes about this booking..."
												/>
											</FormControl>

											<FormControl>
												<FormLabel>Quoted Price (optional)</FormLabel>
												<Input
													type="number"
													value={formData.quotedPrice}
													onChange={(e) => setFormData({...formData, quotedPrice: e.target.value})}
													placeholder="Enter quoted price"
												/>
											</FormControl>

											<FormControl>
												<FormLabel>Assigned Employee (optional)</FormLabel>
												<Input
													value={formData.assignedEmployee}
													onChange={(e) => setFormData({...formData, assignedEmployee: e.target.value})}
													placeholder="Enter employee name"
												/>
											</FormControl>
										</>
									)}


									{actionType === 'review' && (
										<>
											<FormControl>
												<FormLabel>Review Action</FormLabel>
												<Select
													value={formData.reviewAction}
													onChange={(e) => setFormData({...formData, reviewAction: e.target.value})}
												>
													<option value="">Select Action</option>
													<option value="approve">Approve</option>
													<option value="reject">Reject</option>
													<option value="modification_requested">Request Modification</option>
												</Select>
											</FormControl>

											<FormControl>
												<FormLabel>Employee Notes</FormLabel>
												<Textarea
													value={formData.employeeNotes}
													onChange={(e) => setFormData({...formData, employeeNotes: e.target.value})}
													placeholder="Add notes about the content review..."
												/>
											</FormControl>

											<FormControl>
												<FormLabel>
													<input
														type="checkbox"
														checked={formData.sendTerms}
														onChange={(e) => setFormData({...formData, sendTerms: e.target.checked})}
													/>
													{' '}Send Terms & Conditions
												</FormLabel>
											</FormControl>
										</>
									)}
								</VStack>
							</ModalBody>
							<ModalFooter>
								<Button variant="ghost" mr={3} onClick={onClose}>
									Cancel
								</Button>
								<Button
									colorScheme="blue"
									onClick={() => {
										if (actionType === 'edit') handleStatusUpdate();
										if (actionType === 'review') handleReviewContent();
									}}
								>
									{actionType === 'edit' && 'Update Status'}
									{actionType === 'review' && 'Submit Review'}
								</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</VStack>
			</Container>
		</Box>
	);
};

export default BookingManagementPage;

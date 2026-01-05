import React from 'react';
import { 
	Box, 
	Card, 
	CardBody, 
	Heading, 
	Text, 
	Badge, 
	Button, 
	HStack, 
	VStack, 
	Flex,
	Icon,
	Tooltip,
	Divider
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, PhoneIcon, EmailIcon, StarIcon } from '@chakra-ui/icons';

const BookingCard = ({ 
	booking, 
	onEdit, 
	onDelete, 
	onUpdateStatus,
	onReview,
	isEmployee = false 
}) => {
	const formatPrice = (price) => {
		return `Rs. ${price.toLocaleString('en-LK')}`;
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'Confirmed': return 'green';
			case 'Pending Review': return 'yellow';
			case 'Cancelled': return 'red';
			case 'Completed': return 'blue';
			case 'In Progress': return 'purple';
			default: return 'gray';
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'URGENT': return 'red';
			case 'HIGH': return 'orange';
			case 'MEDIUM': return 'yellow';
			case 'LOW': return 'green';
			default: return 'gray';
		}
	};

	const getRiskLevelColor = (riskLevel) => {
		switch (riskLevel) {
			case 'HIGH': return 'red';
			case 'MEDIUM': return 'orange';
			case 'LOW': return 'green';
			default: return 'gray';
		}
	};

	const isCompleted = (booking) => {
		return booking.employeeInfo?.status === 'Completed';
	};

	const isArchived = (booking) => {
		return booking.isArchived === true;
	};

	return (
		<Card 
			maxW="md" 
			borderWidth="1px" 
			borderRadius="lg" 
			overflow="hidden"
			borderLeft={booking.contentAnalysis?.flagged ? "4px solid" : "1px solid"}
			borderLeftColor={booking.contentAnalysis?.flagged ? "red.500" : "gray.200"}
			_hover={{ 
				transform: 'translateY(-2px)', 
				shadow: 'lg',
				transition: 'all 0.2s'
			}}
		>
			<CardBody>
				<VStack align="stretch" spacing={4}>
					{/* Header */}
					<Flex justify="space-between" align="start">
						<VStack align="start" spacing={1} flex={1}>
							<Heading size="md" color="blue.600">
								{booking.customerName}
							</Heading>
							<Text fontSize="sm" color="gray.600">
								{booking.packageName}
							</Text>
						</VStack>
						<VStack align="end" spacing={1}>
							<Badge 
								colorScheme={getStatusColor(booking.employeeInfo?.status)} 
								variant="solid"
								fontSize="xs"
							>
								{booking.employeeInfo?.status || 'Pending Review'}
							</Badge>
							{booking.paymentStatus && (
								<Badge 
									colorScheme={booking.paymentStatus === 'paid' ? 'green' : 'orange'} 
									variant="outline"
									fontSize="xs"
								>
									{booking.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Pending Payment'}
								</Badge>
							)}
							{booking.employeeInfo?.priority && (
								<Badge 
									colorScheme={getPriorityColor(booking.employeeInfo.priority)} 
									variant="outline"
									fontSize="xs"
								>
									{booking.employeeInfo.priority}
								</Badge>
							)}
						</VStack>
					</Flex>

					{/* Content Analysis Alert */}
					{booking.contentAnalysis?.flagged && (
						<Box 
							bg="red.50" 
							p={2} 
							borderRadius="md" 
							border="1px solid" 
							borderColor="red.200"
						>
							<Text fontSize="xs" color="red.600" fontWeight="bold">
								⚠️ Content Flagged for Review
							</Text>
							{booking.contentAnalysis.reasons && (
								<Text fontSize="xs" color="red.500" mt={1}>
									{booking.contentAnalysis.reasons.join(', ')}
								</Text>
							)}
							<Badge 
								colorScheme={getRiskLevelColor(booking.contentAnalysis.riskLevel)} 
								variant="solid"
								fontSize="xs"
								mt={1}
							>
								Risk: {booking.contentAnalysis.riskLevel}
							</Badge>
						</Box>
					)}

					{/* Customer Details */}
					<VStack align="stretch" spacing={2}>
						<HStack>
							<Icon as={EmailIcon} color="gray.500" />
							<Text fontSize="sm" color="gray.600">{booking.customerEmail}</Text>
						</HStack>
						<HStack>
							<Icon as={PhoneIcon} color="gray.500" />
							<Text fontSize="sm" color="gray.600">{booking.customerPhone}</Text>
						</HStack>
					</VStack>

					<Divider />

					{/* Booking Details */}
					<VStack align="stretch" spacing={2}>
						<HStack justify="space-between">
							<HStack>
								<Icon as={CalendarIcon} color="gray.500" />
								<Text fontSize="sm" color="gray.600">Date:</Text>
							</HStack>
							<Text fontSize="sm" fontWeight="medium">
								{formatDate(booking.bookingDate)}
							</Text>
						</HStack>

						<HStack justify="space-between">
							<HStack>
								<Icon as={TimeIcon} color="gray.500" />
								<Text fontSize="sm" color="gray.600">Time:</Text>
							</HStack>
							<Text fontSize="sm" fontWeight="medium">
								{booking.bookingTime}
							</Text>
						</HStack>

						<HStack justify="space-between">
							<HStack>
								<Icon as={StarIcon} color="gray.500" />
								<Text fontSize="sm" color="gray.600">Passengers:</Text>
							</HStack>
							<Text fontSize="sm" fontWeight="medium">
								{booking.numberOfPassengers}
							</Text>
						</HStack>

						{booking.selectedCatering && (
							<HStack justify="space-between">
								<Text fontSize="sm" color="gray.600">Catering:</Text>
								<Text fontSize="sm" fontWeight="medium">
									{booking.selectedCatering}
								</Text>
							</HStack>
						)}
					</VStack>

					{/* Passenger Names */}
					{booking.passengerNames && (
						<Box>
							<Text fontSize="sm" color="gray.600" fontWeight="bold">
								Passenger Names:
							</Text>
							<Text fontSize="sm" color="gray.700" mt={1}>
								{booking.passengerNames}
							</Text>
						</Box>
					)}

					{/* Price */}
					<Box 
						bg="green.50" 
						p={3} 
						borderRadius="md" 
						border="1px solid" 
						borderColor="green.200"
					>
						<Text fontSize="lg" fontWeight="bold" color="green.600" textAlign="center">
							{formatPrice(booking.totalPrice)}
						</Text>
						<Text fontSize="xs" color="gray.500" textAlign="center">
							Total Price
						</Text>
					</Box>

					{/* Employee Notes */}
					{isEmployee && booking.employeeInfo?.employeeNotes && (
						<Box>
							<Text fontSize="sm" color="gray.600" fontWeight="bold">
								Employee Notes:
							</Text>
							<Text fontSize="sm" color="gray.700" mt={1}>
								{booking.employeeInfo.employeeNotes}
							</Text>
						</Box>
					)}


					{/* Actions */}
					{isEmployee ? (
						<VStack spacing={2}>
							{booking.contentAnalysis?.flagged && !booking.contentReviewed && (
								<HStack spacing={2} width="100%">
									<Button
										colorScheme="green"
										size="sm"
										flex={1}
										onClick={() => onReview(booking._id, 'approve')}
									>
										Approve
									</Button>
									<Button
										colorScheme="red"
										size="sm"
										flex={1}
										onClick={() => onReview(booking._id, 'reject')}
									>
										Reject
									</Button>
									<Button
										colorScheme="orange"
										size="sm"
										flex={1}
										onClick={() => onReview(booking._id, 'request_modification')}
									>
										Modify
									</Button>
								</HStack>
							)}
							
							<HStack spacing={2} width="100%">
								<Button
									colorScheme="blue"
									size="sm"
									flex={1}
									onClick={() => onEdit(booking)}
								>
									Edit
								</Button>
								<Button
									colorScheme="red"
									size="sm"
									flex={1}
									onClick={() => onDelete(booking._id)}
								>
									Delete
								</Button>
							</HStack>
						</VStack>
					) : (
						<HStack spacing={2} width="100%">
							<Button
								colorScheme="blue"
								size="sm"
								flex={1}
								onClick={() => onEdit(booking)}
							>
								Edit
							</Button>
							<Button
								colorScheme="red"
								size="sm"
								flex={1}
								onClick={() => onDelete(booking._id)}
							>
								Cancel
							</Button>
						</HStack>
					)}
				</VStack>
			</CardBody>
		</Card>
	);
};

export default BookingCard;

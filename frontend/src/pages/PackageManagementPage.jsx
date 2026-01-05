import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
	useDisclosure,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useBoatPackageStore } from '../store/boatPackageStore';
import { useToastNotification } from '../components/ToastNotification';
import LoadingSpinner from '../components/LoadingSpinner';
import PackageCard from '../components/PackageCard';

const PackageManagementPage = () => {
	const navigate = useNavigate();
	const { 
		packages, 
		loading, 
		error, 
		fetchPackages, 
		createPackage, 
		updatePackage, 
		deletePackage,
		togglePackageStatus,
		clearError 
	} = useBoatPackageStore();
	
	const { showSuccess, showError } = useToastNotification();
	const { isOpen, onOpen, onClose } = useDisclosure();
	
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		packageName: '',
		packageType: '',
		description: '',
		maxCapacity: '',
		basePrice: '',
		duration: '',
		destinations: [],
		cateringOptions: [],
		imageUrl: '',
		isActive: true,
		status: 'Available'
	});

	const bgColor = useColorModeValue('gray.50', 'gray.900');
	const cardBg = useColorModeValue('white', 'gray.800');

	useEffect(() => {
		fetchPackages();
	}, []);

	useEffect(() => {
		if (error) {
			showError('Error', error);
			clearError();
		}
	}, [error]);

	const handleSearch = (e) => {
		e.preventDefault();
		// Implement search functionality
		console.log('Searching for:', searchQuery);
	};

	const handleCreatePackage = async () => {
		try {
			const result = await createPackage(formData);
			
			if (result.success) {
				showSuccess('Success', 'Package created successfully');
				onClose();
				resetForm();
				fetchPackages();
			} else {
				showError('Error', result.message);
			}
		} catch (error) {
			showError('Error', 'Failed to create package');
		}
	};

	const handleUpdatePackage = async () => {
		if (!selectedPackage) return;

		try {
			const result = await updatePackage(selectedPackage._id, formData);
			
			if (result.success) {
				showSuccess('Success', 'Package updated successfully');
				onClose();
				resetForm();
				fetchPackages();
			} else {
				showError('Error', result.message);
			}
		} catch (error) {
			showError('Error', 'Failed to update package');
		}
	};

	const handleDeletePackage = async (packageId) => {
		if (window.confirm('Are you sure you want to delete this package?')) {
			try {
				const result = await deletePackage(packageId);
				
				if (result.success) {
					showSuccess('Success', 'Package deleted successfully');
					fetchPackages();
				} else {
					showError('Error', result.message);
				}
			} catch (error) {
				showError('Error', 'Failed to delete package');
			}
		}
	};

	const handleToggleStatus = async (packageId) => {
		try {
			const result = await togglePackageStatus(packageId);
			
			if (result.success) {
				showSuccess('Success', result.message);
				fetchPackages();
			} else {
				showError('Error', result.message);
			}
		} catch (error) {
			showError('Error', 'Failed to toggle package status');
		}
	};

	const openModal = (pkg = null) => {
		if (pkg) {
			setSelectedPackage(pkg);
			setIsEditing(true);
			setFormData({
				packageName: pkg.packageName,
				packageType: pkg.packageType,
				description: pkg.description,
				maxCapacity: pkg.maxCapacity.toString(),
				basePrice: pkg.basePrice.toString(),
				duration: pkg.duration,
				destinations: pkg.destinations || [],
				cateringOptions: pkg.cateringOptions || [],
				imageUrl: pkg.imageUrl || '',
				isActive: pkg.isActive,
				status: pkg.status
			});
		} else {
			setSelectedPackage(null);
			setIsEditing(false);
			resetForm();
		}
		onOpen();
	};

	const resetForm = () => {
		setFormData({
			packageName: '',
			packageType: '',
			description: '',
			maxCapacity: '',
			basePrice: '',
			duration: '',
			destinations: [],
			cateringOptions: [],
			imageUrl: '',
			isActive: true,
			status: 'Available'
		});
	};

	const handleEditPackage = (pkg) => {
		openModal(pkg);
	};

	const filteredPackages = packages.filter(pkg => {
		const matchesSearch = !searchQuery || 
			pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesStatus = !statusFilter || pkg.status === statusFilter;
		
		return matchesSearch && matchesStatus;
	});

	const packageTypes = ['Group Trip', 'Family Package', 'Luxury Experience', 'Fishing Trip', 'Event Package', 'Individual Experience'];
	const durations = ['30 Minutes', '2 Hours', '4 Hours', 'Half Day (4 Hours)', 'Full Day (8 Hours)', 'Multi-Day'];
	const destinations = ['Marina Bay', 'Harbor View', 'Sunset Dock', 'Ocean Adventure', 'Island Hopping', 'Coastal Waters'];
	const cateringOptions = ['Water Bottle', 'Light Snacks', 'Full Meal', 'BBQ Package', 'Premium Dining'];

	if (loading) {
		return <LoadingSpinner message="Loading packages..." />;
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
							📦 Package Management
						</Heading>
						<Text fontSize="lg" color="gray.600">
							Create and manage boat service packages
						</Text>
					</Box>

					{/* Search and Filters */}
					<Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
						<VStack spacing={4}>
							<HStack width="100%" justify="space-between">
								<form onSubmit={handleSearch} style={{ flex: 1 }}>
									<InputGroup>
										<InputLeftElement pointerEvents="none">
											<SearchIcon color="gray.300" />
										</InputLeftElement>
										<Input
											placeholder="Search packages..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											bg="white"
										/>
									</InputGroup>
								</form>

								<Button
									colorScheme="blue"
									leftIcon={<AddIcon />}
									onClick={() => openModal()}
								>
									Create Package
								</Button>
							</HStack>

							<HStack spacing={4} width="100%" flexWrap="wrap">
								<Select
									placeholder="Filter by status"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									maxW="200px"
									bg="white"
								>
									<option value="">All Status</option>
									<option value="Available">Available</option>
									<option value="Maintenance">Maintenance</option>
									<option value="Out of Service">Out of Service</option>
								</Select>

								<Button
									colorScheme="blue"
									variant="outline"
									onClick={() => {
										setSearchQuery('');
										setStatusFilter('');
									}}
								>
									Clear Filters
								</Button>

								<Badge colorScheme="blue" fontSize="sm">
									{filteredPackages.length} packages found
								</Badge>
							</HStack>
						</VStack>
					</Box>

					{/* Packages Grid */}
					{filteredPackages.length > 0 ? (
						<Grid
							templateColumns={{
								base: '1fr',
								md: 'repeat(2, 1fr)',
								lg: 'repeat(3, 1fr)'
							}}
							gap={6}
						>
							{filteredPackages.map((pkg) => (
								<PackageCard
									key={pkg._id}
									package={pkg}
									onBook={() => {}}
									onEdit={handleEditPackage}
									onDelete={handleDeletePackage}
									onToggleStatus={handleToggleStatus}
									isEmployee={true}
								/>
							))}
						</Grid>
					) : (
						<Box textAlign="center" py={12}>
							<Text fontSize="lg" color="gray.500">
								No packages found matching your criteria.
							</Text>
							<Button
								colorScheme="blue"
								mt={4}
								leftIcon={<AddIcon />}
								onClick={() => openModal()}
							>
								Create First Package
							</Button>
						</Box>
					)}

					{/* Create/Edit Package Modal */}
					<Modal isOpen={isOpen} onClose={onClose} size="xl">
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>
								{isEditing ? 'Edit Package' : 'Create New Package'}
							</ModalHeader>
							<ModalCloseButton />
							<ModalBody>
								<VStack spacing={4} align="stretch">
									<FormControl isRequired>
										<FormLabel>Package Name</FormLabel>
										<Input
											value={formData.packageName}
											onChange={(e) => setFormData({...formData, packageName: e.target.value})}
											placeholder="Enter package name"
										/>
									</FormControl>

									<FormControl isRequired>
										<FormLabel>Package Type</FormLabel>
										<Select
											value={formData.packageType}
											onChange={(e) => setFormData({...formData, packageType: e.target.value})}
											placeholder="Select package type"
										>
											{packageTypes.map(type => (
												<option key={type} value={type}>{type}</option>
											))}
										</Select>
									</FormControl>

									<FormControl isRequired>
										<FormLabel>Description</FormLabel>
										<Textarea
											value={formData.description}
											onChange={(e) => setFormData({...formData, description: e.target.value})}
											placeholder="Enter package description"
											rows={3}
										/>
									</FormControl>

									<HStack spacing={4}>
										<FormControl isRequired>
											<FormLabel>Max Capacity</FormLabel>
											<NumberInput
												value={formData.maxCapacity}
												onChange={(value) => setFormData({...formData, maxCapacity: value})}
												min={1}
												max={100}
											>
												<NumberInputField />
												<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
												</NumberInputStepper>
											</NumberInput>
										</FormControl>

										<FormControl isRequired>
											<FormLabel>Base Price (Rs.)</FormLabel>
											<NumberInput
												value={formData.basePrice}
												onChange={(value) => setFormData({...formData, basePrice: value})}
												min={0}
												precision={2}
											>
												<NumberInputField />
												<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
												</NumberInputStepper>
											</NumberInput>
										</FormControl>
									</HStack>

									<FormControl isRequired>
										<FormLabel>Duration</FormLabel>
										<Select
											value={formData.duration}
											onChange={(e) => setFormData({...formData, duration: e.target.value})}
											placeholder="Select duration"
										>
											{durations.map(duration => (
												<option key={duration} value={duration}>{duration}</option>
											))}
										</Select>
									</FormControl>

									<FormControl>
										<FormLabel>Destinations</FormLabel>
										<Select
											value=""
											onChange={(e) => {
												if (e.target.value && !formData.destinations.includes(e.target.value)) {
													setFormData({
														...formData, 
														destinations: [...formData.destinations, e.target.value]
													});
												}
											}}
											placeholder="Add destination"
										>
											{destinations.map(dest => (
												<option key={dest} value={dest}>{dest}</option>
											))}
										</Select>
										{formData.destinations.length > 0 && (
											<HStack mt={2} flexWrap="wrap">
												{formData.destinations.map((dest, index) => (
													<Badge key={index} colorScheme="blue" variant="subtle">
														{dest}
														<Button
															size="xs"
															variant="ghost"
															onClick={() => {
																setFormData({
																	...formData,
																	destinations: formData.destinations.filter((_, i) => i !== index)
																});
															}}
														>
															×
														</Button>
													</Badge>
												))}
											</HStack>
										)}
									</FormControl>

									<FormControl>
										<FormLabel>Catering Options</FormLabel>
										<Select
											value=""
											onChange={(e) => {
												if (e.target.value && !formData.cateringOptions.includes(e.target.value)) {
													setFormData({
														...formData, 
														cateringOptions: [...formData.cateringOptions, e.target.value]
													});
												}
											}}
											placeholder="Add catering option"
										>
											{cateringOptions.map(option => (
												<option key={option} value={option}>{option}</option>
											))}
										</Select>
										{formData.cateringOptions.length > 0 && (
											<HStack mt={2} flexWrap="wrap">
												{formData.cateringOptions.map((option, index) => (
													<Badge key={index} colorScheme="green" variant="subtle">
														{option}
														<Button
															size="xs"
															variant="ghost"
															onClick={() => {
																setFormData({
																	...formData,
																	cateringOptions: formData.cateringOptions.filter((_, i) => i !== index)
																});
															}}
														>
															×
														</Button>
													</Badge>
												))}
											</HStack>
										)}
									</FormControl>

									<FormControl>
										<FormLabel>Image URL (optional)</FormLabel>
										<Input
											value={formData.imageUrl}
											onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
											placeholder="Enter image URL"
										/>
									</FormControl>

									<HStack spacing={4}>
										<FormControl>
											<FormLabel>Status</FormLabel>
											<Select
												value={formData.status}
												onChange={(e) => setFormData({...formData, status: e.target.value})}
											>
												<option value="Available">Available</option>
												<option value="Maintenance">Maintenance</option>
												<option value="Out of Service">Out of Service</option>
											</Select>
										</FormControl>

										<FormControl>
											<FormLabel>
												<input
													type="checkbox"
													checked={formData.isActive}
													onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
												/>
												{' '}Active
											</FormLabel>
										</FormControl>
									</HStack>
								</VStack>
							</ModalBody>
							<ModalFooter>
								<Button variant="ghost" mr={3} onClick={onClose}>
									Cancel
								</Button>
								<Button
									colorScheme="blue"
									onClick={isEditing ? handleUpdatePackage : handleCreatePackage}
								>
									{isEditing ? 'Update Package' : 'Create Package'}
								</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</VStack>
			</Container>
		</Box>
	);
};

export default PackageManagementPage;

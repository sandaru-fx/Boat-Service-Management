import React, { useState, useEffect } from 'react';
import { useBoatPackageStore } from '../store/boatPackageStore';
import { useBoatBookingStore } from '../store/boatBookingStore';
import { useRealTimeValidation } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { updateBoatBooking } from '../api/boatBookingApi';
import StripePayment from '../components/StripePayment';

const BookingRequestPage = () => {
	const { packages, fetchActivePackages } = useBoatPackageStore();
	const { createBooking, loading } = useBoatBookingStore();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const { user } = useAuth();
	
	// Check if we're in edit mode
	const isEditMode = location.state?.editMode;
	const editBookingId = location.state?.bookingId;
	const editBookingData = location.state?.bookingData;
	
	const [selectedPackage, setSelectedPackage] = useState(null);
	const [totalPrice, setTotalPrice] = useState(0);
	const [formData, setFormData] = useState({
		customerName: '',
		email: '',
		phone: '',
		numberOfPassengers: 1,
		passengerNames: '',
		bookingDate: '',
		bookingTime: '',
		catering: ''
	});
	
	// Payment states
	const [paymentCompleted, setPaymentCompleted] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [tempBookingData, setTempBookingData] = useState(null);

	const validationRules = {
		numberOfPassengers: { type: 'required', fieldName: 'Number of Passengers' },
		passengerNames: { type: 'required', fieldName: 'Passenger Names' },
		bookingDate: { type: 'required', fieldName: 'Booking Date' },
		bookingTime: { type: 'required', fieldName: 'Booking Time' }
	};

	const { errors, validateField, clearError } = useRealTimeValidation(validationRules);

	useEffect(() => {
		fetchActivePackages();
	}, []);

	// Pre-fill customer data from auth
	useEffect(() => {
		if (user) {
			setFormData(prev => ({
				...prev,
				customerName: user.name || '',
				email: user.email || '',
				phone: user.phone || ''
			}));
		}
	}, [user]);

	// Pre-fill form data in edit mode
	useEffect(() => {
		if (isEditMode && editBookingData && packages.length > 0) {
			
			setFormData(prev => ({
				...prev,
				customerName: editBookingData.customerName || '',
				email: editBookingData.customerEmail || '',
				phone: editBookingData.customerPhone || '',
				numberOfPassengers: editBookingData.numberOfPassengers || 1,
				passengerNames: editBookingData.passengerNames || '',
				bookingDate: editBookingData.bookingDate ? new Date(editBookingData.bookingDate).toISOString().split('T')[0] : '',
				bookingTime: editBookingData.bookingDate ? new Date(editBookingData.bookingDate).toTimeString().slice(0, 5) : '',
				catering: editBookingData.selectedCatering || ''
			}));
			
			// Set selected package - handle both string ID and populated object
			if (editBookingData.packageId) {
				let packageId;
				
				// Check if packageId is a populated object or string
				if (typeof editBookingData.packageId === 'object' && editBookingData.packageId._id) {
					packageId = editBookingData.packageId._id;
				} else if (typeof editBookingData.packageId === 'string') {
					packageId = editBookingData.packageId;
				} else {
					console.error('Unknown packageId format:', editBookingData.packageId);
					return;
				}
				
				const pkg = packages.find(p => p._id === packageId);
				if (pkg) {
					setSelectedPackage(pkg);
				} else {
					// Fallback: try to fetch the package directly from backend
					fetch(`/api/boat-packages/${packageId}`)
						.then(response => response.json())
						.then(data => {
							if (data.success && data.data) {
								setSelectedPackage(data.data);
							} else {
								toast.error('Package not found. Please try again.');
							}
						})
						.catch(error => {
							console.error('Error fetching package from backend:', error);
							toast.error('Failed to load package details.');
						});
				}
			}
		}
	}, [isEditMode, editBookingData, packages]);

	useEffect(() => {
		const packageId = searchParams.get('packageId');
		if (packageId && packages.length > 0) {
			const pkg = packages.find(p => p._id === packageId);
			if (pkg) {
				setSelectedPackage(pkg);
				setFormData(prev => ({
					...prev,
					duration: pkg.duration,
					destinations: pkg.destinations.join(', ')
				}));
			}
		}
	}, [searchParams, packages]);

	useEffect(() => {
		if (selectedPackage && formData.numberOfPassengers) {
			const basePrice = selectedPackage.basePrice;
			setTotalPrice(basePrice * formData.numberOfPassengers);
		}
	}, [selectedPackage, formData.numberOfPassengers]);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		clearError(field);
		validateField(field, value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Validate required fields (excluding pre-filled customer data)
		const requiredFields = ['numberOfPassengers', 'passengerNames', 'bookingDate', 'bookingTime'];
		let hasErrors = false;
		
		requiredFields.forEach(field => {
			if (!formData[field]) {
				validateField(field, formData[field]);
				hasErrors = true;
			}
		});

		if (hasErrors) {
			toast.error('Please fill in all required fields');
			return;
		}

		// Check if customer data is available (only for new bookings)
		if (!isEditMode && (!formData.customerName || !formData.email || !formData.phone)) {
			toast.error('Customer information is missing. Please refresh the page and try again.');
			return;
		}

		const bookingData = {
			...formData,
			packageId: selectedPackage._id,
			packageName: selectedPackage.packageName,
			totalPrice: isEditMode ? editBookingData.totalPrice : totalPrice, // Preserve original price in edit mode
			boatType: selectedPackage.packageType,
			bookingDate: new Date(formData.bookingDate + ' ' + formData.bookingTime),
			passengerNames: formData.passengerNames,
			selectedCatering: formData.catering,
			// Ensure customer data is included and preserved
			customerName: formData.customerName,
			customerEmail: formData.email,
			customerPhone: formData.phone
		};

		if (isEditMode) {
			// For edit mode, proceed directly without payment
			console.log('🔄 Updating booking with ID:', editBookingId);
			console.log('🔄 Updating booking with data:', bookingData);
			console.log('📧 Customer email:', bookingData.customerEmail);
			console.log('📞 Customer phone:', bookingData.customerPhone);
			try {
				const result = await updateBoatBooking(editBookingId, bookingData);
				console.log('✅ Update result:', result);
				if (result.success) {
					toast.success('Your booking has been updated successfully!');
					navigate('/my-rides');
				} else {
					toast.error(result.message || 'Update failed');
				}
			} catch (error) {
				console.error('❌ Update error:', error);
				toast.error('An error occurred while processing your request');
			}
		} else {
			// For new bookings, show payment modal first
			setTempBookingData(bookingData);
			setShowPaymentModal(true);
		}
	};

	const handlePaymentSuccess = async (paymentData) => {
		try {
			// Add payment information to booking data
			const bookingDataWithPayment = {
				...tempBookingData,
				paymentStatus: 'paid',
				paymentId: paymentData.paymentId,
				paymentAmount: tempBookingData.totalPrice,
				paidAt: new Date()
			};

			// Create booking with payment information
			const result = await createBooking(bookingDataWithPayment);
			
			if (result.success) {
				setPaymentCompleted(true);
				setShowPaymentModal(false);
				toast.success('Payment completed and booking confirmed successfully!');
				navigate('/booking-confirmation', { 
					state: { booking: result.data, package: selectedPackage, payment: paymentData }
				});
			} else {
				throw new Error(result.message || 'Booking failed');
			}
		} catch (error) {
			console.error('Error completing booking after payment:', error);
			toast.error('Payment succeeded but booking failed. Please contact support.');
		}
	};

	const handlePaymentError = (error) => {
		console.error('Payment error:', error);
		toast.error('Payment failed. Please try again.');
	};

	if (loading) {
		return <LoadingSpinner message="Submitting booking..." />;
	}

	if (!selectedPackage) {
		// In edit mode, show loading while packages are being fetched
		if (isEditMode) {
			return <LoadingSpinner message="Loading booking details..." />;
		}
		
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
						<p className="text-gray-600 mb-6">The selected package could not be found.</p>
						<button
							onClick={() => {
								if (isEditMode) {
									navigate('/my-rides');
								} else {
									navigate('/customer');
								}
							}}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							{isEditMode ? 'Back to My Rides' : 'Back to Packages'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="space-y-8">
					{/* Back Button */}
					<div className="mb-4">
						<button
							onClick={() => {
								if (isEditMode) {
									// Go back to My Rides page for edit mode
									navigate('/my-rides');
								} else {
									// Go back to packages for new bookings
									navigate('/customer');
								}
							}}
							className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
						>
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							{isEditMode ? 'Back to My Rides' : 'Back to Packages'}
						</button>
					</div>

					{/* Header */}
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							{isEditMode ? '✏️ Edit Your Booking' : '🚤 Book Your Boat Experience'}
						</h1>
						<p className="text-lg text-gray-600">
							{isEditMode ? 'Update your booking details below' : 'Complete the form below to request your booking'}
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Package Details */}
						<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Package Details</h2>
							
							<div className="space-y-4">
								<div>
									<h3 className="text-xl font-semibold text-gray-800 mb-2">
										{selectedPackage.packageName}
									</h3>
									<p className="text-gray-600 mb-4">
										{selectedPackage.description}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<span className="font-semibold text-gray-700">Package Type:</span>
										<p className="text-gray-600">{selectedPackage.packageType}</p>
									</div>
									<div>
										<span className="font-semibold text-gray-700">Duration:</span>
										<p className="text-gray-600">{selectedPackage.duration}</p>
									</div>
									<div>
										<span className="font-semibold text-gray-700">Max Capacity:</span>
										<p className="text-gray-600">{selectedPackage.maxCapacity} people</p>
									</div>
									<div>
										<span className="font-semibold text-gray-700">Base Price:</span>
										<p className="text-green-600 font-bold">
											Rs. {selectedPackage.basePrice.toLocaleString('en-LK')}
										</p>
									</div>
								</div>

								{totalPrice > 0 && (
									<div className="bg-green-50 p-4 rounded-md border border-green-200">
										<p className="text-lg font-bold text-green-600 text-center">
											Total Price: Rs. {totalPrice.toLocaleString('en-LK')}
										</p>
										<p className="text-sm text-gray-500 text-center">
											{formData.numberOfPassengers} passengers × Rs. {selectedPackage.basePrice.toLocaleString('en-LK')}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Booking Form */}
						<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Information</h2>
							
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Customer Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Customer Name
										</label>
										<div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
											{formData.customerName || 'Loading...'}
										</div>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Email Address
										</label>
										<div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
											{formData.email || 'Loading...'}
										</div>
									</div>
									
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Phone Number
										</label>
										<div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
											{formData.phone || 'Loading...'}
										</div>
									</div>
								</div>

								{/* Number of Passengers */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Number of Passengers *
									</label>
									<select
										value={formData.numberOfPassengers}
										onChange={(e) => handleInputChange('numberOfPassengers', parseInt(e.target.value))}
										disabled={isEditMode}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
											errors.numberOfPassengers ? 'border-red-500' : 'border-gray-300'
										} ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
									>
										<option value="">Select number of passengers</option>
										{Array.from({ length: selectedPackage.maxCapacity }, (_, i) => i + 1).map(num => (
											<option key={num} value={num}>
												{num} {num === 1 ? 'passenger' : 'passengers'}
											</option>
										))}
									</select>
									{errors.numberOfPassengers && (
										<p className="mt-1 text-sm text-red-600">{errors.numberOfPassengers}</p>
									)}
									<p className="mt-1 text-sm text-gray-500">
										Maximum: {selectedPackage.maxCapacity} people
									</p>
									{isEditMode && (
										<p className="mt-1 text-sm text-orange-600 font-medium">
											⚠️ Cannot be changed after booking (price already paid)
										</p>
									)}
								</div>

								{/* Passenger Names */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Passenger Names *
									</label>
									<textarea
										value={formData.passengerNames}
										onChange={(e) => handleInputChange('passengerNames', e.target.value)}
										placeholder="List all passenger names (one per line)"
										rows={4}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
											errors.passengerNames ? 'border-red-500' : 'border-gray-300'
										}`}
									/>
									{errors.passengerNames && (
										<p className="mt-1 text-sm text-red-600">{errors.passengerNames}</p>
									)}
								</div>

								{/* Booking Date */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Booking Date *
									</label>
									<input
										type="date"
										value={formData.bookingDate}
										onChange={(e) => handleInputChange('bookingDate', e.target.value)}
										min={new Date().toISOString().split('T')[0]}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
											errors.bookingDate ? 'border-red-500' : 'border-gray-300'
										}`}
									/>
									{errors.bookingDate && (
										<p className="mt-1 text-sm text-red-600">{errors.bookingDate}</p>
									)}
								</div>

								{/* Booking Time */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Booking Time *
									</label>
									<select
										value={formData.bookingTime}
										onChange={(e) => handleInputChange('bookingTime', e.target.value)}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
											errors.bookingTime ? 'border-red-500' : 'border-gray-300'
										}`}
									>
										<option value="">Select time</option>
										<option value="09:00">9:00 AM</option>
										<option value="10:00">10:00 AM</option>
										<option value="11:00">11:00 AM</option>
										<option value="12:00">12:00 PM</option>
										<option value="13:00">1:00 PM</option>
										<option value="14:00">2:00 PM</option>
										<option value="15:00">3:00 PM</option>
										<option value="16:00">4:00 PM</option>
										<option value="17:00">5:00 PM</option>
										<option value="18:00">6:00 PM</option>
									</select>
									{errors.bookingTime && (
										<p className="mt-1 text-sm text-red-600">{errors.bookingTime}</p>
									)}
								</div>

								{/* Catering Options */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Catering Options
									</label>
									<select
										value={formData.catering}
										onChange={(e) => handleInputChange('catering', e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="">Select catering option</option>
										{selectedPackage.cateringOptions.map((option, index) => (
											<option key={index} value={option}>{option}</option>
										))}
									</select>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg ${
										paymentCompleted 
											? 'bg-green-600 text-white hover:bg-green-700' 
											: 'bg-blue-600 text-white hover:bg-blue-700'
									}`}
								>
									{paymentCompleted ? '✅ Payment Complete - Book Now' : (isEditMode ? 'Update Booking' : 'Pay & Book Now')}
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>

			{/* Payment Modal */}
			{showPaymentModal && tempBookingData && (
				<StripePayment
					isOpen={showPaymentModal}
					onClose={() => setShowPaymentModal(false)}
					amount={tempBookingData.totalPrice}
					serviceType="ride_booking"
					serviceId={tempBookingData.packageId}
					serviceDescription={`Ride Booking: ${tempBookingData.packageName}`}
					customerInfo={{
						name: tempBookingData.customerName,
						email: tempBookingData.customerEmail,
						phone: tempBookingData.customerPhone
					}}
					onPaymentSuccess={handlePaymentSuccess}
					onPaymentError={handlePaymentError}
				/>
			)}
		</div>
	);
};

export default BookingRequestPage;
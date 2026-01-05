import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const BookingConfirmationPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const booking = location.state?.booking;
	const packageInfo = location.state?.package;
	const payment = location.state?.payment;
	const [generatingPDF, setGeneratingPDF] = useState(false);

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatPrice = (price) => {
		return `Rs. ${price.toLocaleString('en-LK')}`;
	};

	const generatePDF = async () => {
		try {
			setGeneratingPDF(true);
			
			// Create new PDF document
			const doc = new jsPDF();
			
			// Compact company header
			doc.setFontSize(14);
			doc.setFont('helvetica', 'bold');
			doc.text('Marine Service Center', 20, 20);
			
			doc.setFontSize(9);
			doc.setFont('helvetica', 'normal');
			doc.text('Boat Booking Confirmation', 20, 28);
			doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
			
			// Add line separator
			doc.setLineWidth(0.3);
			doc.line(20, 40, 190, 40);
			
			let yPosition = 50;
			
			// Booking Reference (compact)
			doc.setFontSize(12);
			doc.setFont('helvetica', 'bold');
			doc.text('Booking Reference:', 20, yPosition);
			doc.setFont('helvetica', 'normal');
			doc.text(`#${booking._id.slice(-8).toUpperCase()}`, 80, yPosition);
			yPosition += 15;
			
			// Two-column layout: Package Details and Customer Information side by side
			const leftCol = 20;
			const rightCol = 105;
			
			// Package Details (Left Column)
			doc.setFontSize(11);
			doc.setFont('helvetica', 'bold');
			doc.text('Package Details', leftCol, yPosition);
			yPosition += 8;
			
			doc.setFontSize(9);
			doc.setFont('helvetica', 'normal');
			doc.text(`Package: ${booking.packageName}`, leftCol, yPosition);
			yPosition += 6;
			doc.text(`Type: ${booking.boatType}`, leftCol, yPosition);
			yPosition += 6;
			doc.text(`Duration: ${packageInfo?.duration || 'N/A'}`, leftCol, yPosition);
			yPosition += 6;
			doc.text(`Passengers: ${booking.numberOfPassengers} people`, leftCol, yPosition);
			
			// Customer Information (Right Column)
			const customerY = yPosition - 20; // Start at same level as Package Details
			doc.setFontSize(11);
			doc.setFont('helvetica', 'bold');
			doc.text('Customer Information', rightCol, customerY);
			
			doc.setFontSize(9);
			doc.setFont('helvetica', 'normal');
			doc.text(`Name: ${booking.customerName}`, rightCol, customerY + 8);
			doc.text(`Email: ${booking.email}`, rightCol, customerY + 14);
			doc.text(`Phone: ${booking.phone}`, rightCol, customerY + 20);
			doc.text(`Date: ${formatDate(booking.scheduleDate)}`, rightCol, customerY + 26);
			
			yPosition += 15;
			
			// Pricing (full width)
			doc.setFontSize(11);
			doc.setFont('helvetica', 'bold');
			doc.text('Pricing', leftCol, yPosition);
			yPosition += 8;
			
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.text(`Total Amount: ${formatPrice(booking.totalPrice)}`, leftCol, yPosition);
			yPosition += 15;
			
			// Passenger Names (with more space)
			if (booking.specialRequests) {
				doc.setFontSize(11);
				doc.setFont('helvetica', 'bold');
				doc.text('Passenger Names', leftCol, yPosition);
				yPosition += 8;
				
				doc.setFontSize(9);
				doc.setFont('helvetica', 'normal');
				const passengerNames = booking.specialRequests.split('\n');
				passengerNames.forEach(name => {
					if (yPosition > 250) return; // More space for names
					doc.text(`• ${name.trim()}`, leftCol, yPosition);
					yPosition += 6;
				});
			}
			
			// Footer (compact)
			doc.setFontSize(7);
			doc.setFont('helvetica', 'italic');
			doc.text('Thank you for choosing Marine Service Center', leftCol, 270);
			doc.text('Contact: +94 11 234 5678', leftCol, 275);
			
			// Save PDF
			const fileName = `booking-confirmation-${booking._id.slice(-8)}.pdf`;
			doc.save(fileName);
			
			toast.success('PDF downloaded successfully!');
		} catch (error) {
			console.error('Error generating PDF:', error);
			toast.error('Failed to generate PDF');
		} finally {
			setGeneratingPDF(false);
		}
	};

	if (!booking) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
						<p className="text-lg text-gray-500 mb-6">
							No booking information found. Please try again.
						</p>
						<button
							onClick={() => navigate('/customer')}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Back to Packages
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="space-y-8">
					{/* Back Button */}
					<div className="mb-4">
						<button
							onClick={() => navigate('/customer')}
							className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
						>
							<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Back to Packages
						</button>
					</div>

					{/* Success Header */}
					<div className="text-center">
						<div className="flex justify-center mb-4">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
								<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
						</div>
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							Booking Confirmed!
						</h1>
						<p className="text-lg text-gray-600">
							Your booking request has been submitted successfully
						</p>
					</div>

					{/* Booking Details Card */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
						<div className="space-y-6">
							{/* Booking Reference */}
							<div className="text-center">
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									Booking Reference
								</h2>
								<div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-mono text-lg">
									#{booking._id.slice(-8).toUpperCase()}
								</div>
							</div>

							{/* Package Information */}
							<div className="border-t border-gray-200 pt-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-4">Package Details</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<span className="font-medium text-gray-700">Package:</span>
										<p className="text-gray-600">{booking.packageName}</p>
									</div>
									<div>
										<span className="font-medium text-gray-700">Type:</span>
										<p className="text-gray-600">{booking.boatType}</p>
									</div>
									<div>
										<span className="font-medium text-gray-700">Duration:</span>
										<p className="text-gray-600">{packageInfo?.duration || 'N/A'}</p>
									</div>
									<div>
										<span className="font-medium text-gray-700">Passengers:</span>
										<p className="text-gray-600">{booking.numberOfPassengers} people</p>
									</div>
								</div>
							</div>

							{/* Customer Information */}
							<div className="border-t border-gray-200 pt-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<span className="font-medium text-gray-700">Name:</span>
										<p className="text-gray-600">{booking.customerName}</p>
									</div>
									<div>
										<span className="font-medium text-gray-700">Email:</span>
										<p className="text-gray-600">{booking.email}</p>
									</div>
									<div>
										<span className="font-medium text-gray-700">Phone:</span>
										<p className="text-gray-600">{booking.phone}</p>
									</div>
									<div>
										<span className="font-medium text-gray-700">Booking Date:</span>
										<p className="text-gray-600">{formatDate(booking.scheduleDate)}</p>
									</div>
								</div>
							</div>

							{/* Payment Information */}
							{payment && (
								<div className="border-t border-gray-200 pt-6">
									<h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h3>
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<div className="flex items-center mb-2">
											<svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span className="font-medium text-green-800">Payment Completed</span>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
											<div>
												<span className="font-medium text-gray-700">Payment ID:</span>
												<p className="text-gray-600 font-mono">{payment.paymentId}</p>
											</div>
											<div>
												<span className="font-medium text-gray-700">Amount:</span>
												<p className="text-gray-600 font-semibold">{formatPrice(payment.amount)}</p>
											</div>
											<div>
												<span className="font-medium text-gray-700">Status:</span>
												<p className="text-green-600 font-medium">Paid</p>
											</div>
											<div>
												<span className="font-medium text-gray-700">Payment Method:</span>
												<p className="text-gray-600">Credit Card (Stripe)</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Pricing */}
							<div className="border-t border-gray-200 pt-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h3>
								<div className="bg-green-50 p-4 rounded-lg border border-green-200">
									<div className="flex justify-between items-center">
										<span className="text-lg font-medium text-gray-700">Total Amount:</span>
										<span className="text-2xl font-bold text-green-600">
											{formatPrice(booking.totalPrice)}
										</span>
									</div>
								</div>
							</div>

							{/* Passenger Names */}
							{booking.specialRequests && (
								<div className="border-t border-gray-200 pt-6">
									<h3 className="text-xl font-semibold text-gray-900 mb-4">Passenger Names</h3>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-gray-700 whitespace-pre-line">{booking.specialRequests}</p>
									</div>
								</div>
							)}

							{/* Next Steps */}
							<div className="border-t border-gray-200 pt-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
								<div className="space-y-3">
									<div className="flex items-start">
										<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
											<span className="text-xs font-bold text-blue-600">1</span>
										</div>
										<div>
											<p className="font-medium text-gray-900">Confirmation Email</p>
											<p className="text-gray-600">You'll receive a confirmation email shortly with all the details.</p>
										</div>
									</div>
									<div className="flex items-start">
										<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
											<span className="text-xs font-bold text-blue-600">2</span>
										</div>
										<div>
											<p className="font-medium text-gray-900">Staff Review</p>
											<p className="text-gray-600">Our team will review your booking and contact you within 24 hours.</p>
										</div>
									</div>
									<div className="flex items-start">
										<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
											<span className="text-xs font-bold text-blue-600">3</span>
										</div>
										<div>
											<p className="font-medium text-gray-900">Final Confirmation</p>
											<p className="text-gray-600">Once approved, you'll receive final confirmation and payment instructions.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={() => navigate('/customer')}
							className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold"
						>
							Book Another Package
						</button>
						<button
							onClick={generatePDF}
							disabled={generatingPDF}
							className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold disabled:opacity-50"
						>
							{generatingPDF ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Generating PDF...
								</>
							) : (
								'Download PDF'
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookingConfirmationPage;
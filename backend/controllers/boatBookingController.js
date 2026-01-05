import mongoose from "mongoose";
import BoatBooking from "../models/boatBooking.model.js";

// Employee notification service with content analysis
const sendEmployeeNotification = async (bookingData) => {
	try {
		// Analyze booking content for potential issues
		const contentAnalysis = analyzeBookingContent(bookingData);
		
		const notificationData = {
			type: 'NEW_BOAT_BOOKING_REQUEST',
			title: '🚤 New Boat Booking Request',
			message: `New booking request from ${bookingData.customerName}`,
			contentAnalysis: contentAnalysis,
			requiresReview: contentAnalysis.flagged,
			details: {
				customerName: bookingData.customerName,
				email: bookingData.customerEmail,
				phone: bookingData.customerPhone,
				packageName: bookingData.packageName,
				passengers: bookingData.numberOfPassengers,
				bookingDate: bookingData.bookingDate,
				bookingTime: bookingData.bookingTime,
				duration: bookingData.duration,
				selectedCatering: bookingData.selectedCatering,
				specialRequests: bookingData.specialRequests,
				timestamp: new Date().toISOString(),
				priority: contentAnalysis.flagged ? 'URGENT' : 'HIGH'
			}
		};

		// Log notification with analysis
		console.log('🔔 EMPLOYEE NOTIFICATION SENT:', notificationData);
		
		if (contentAnalysis.flagged) {
			console.log('⚠️  CONTENT FLAGGED FOR REVIEW:', contentAnalysis.reasons);
			console.log('📧 Automated Terms & Conditions response may be sent');
		}
		
		// Simulate notification channels
		console.log('📧 Email notification sent to employee@marina.com');
		console.log('📱 SMS notification sent to employee phone');
		console.log('🖥️  Dashboard notification created');
		
		return { success: true, notificationData, contentAnalysis };
	} catch (error) {
		console.error('❌ Failed to send employee notification:', error);
		return { success: false, error: error.message };
	}
};

// Content analysis function
const analyzeBookingContent = (bookingData) => {
	const flaggedKeywords = [
		'party', 'alcohol', 'drinking', 'drunk', 'wild', 'crazy', 
		'damage', 'loud', 'noise', 'inappropriate', 'illegal',
		'drugs', 'smoking', 'bachelor', 'bachelorette', 'strip'
	];
	
	const concerningPhrases = [
		'bring our own alcohol', 'party hard', 'get wild',
		'no rules', 'anything goes', 'break things'
	];
	
	let analysis = {
		flagged: false,
		reasons: [],
		riskLevel: 'LOW',
		requiresTermsReminder: false
	};
	
	// Check special requests for concerning content
	const specialRequests = (bookingData.specialRequests || '').toLowerCase();
	const customerName = (bookingData.customerName || '').toLowerCase();
	
	// Check for flagged keywords
	flaggedKeywords.forEach(keyword => {
		if (specialRequests.includes(keyword)) {
			analysis.flagged = true;
			analysis.reasons.push(`Contains keyword: "${keyword}"`);
		}
	});
	
	// Check for concerning phrases
	concerningPhrases.forEach(phrase => {
		if (specialRequests.includes(phrase)) {
			analysis.flagged = true;
			analysis.reasons.push(`Contains concerning phrase: "${phrase}"`);
			analysis.riskLevel = 'HIGH';
		}
	});
	
	// Check passenger count for large groups
	const passengerCount = parseInt(bookingData.numberOfPassengers);
	if (passengerCount > 15) {
		analysis.requiresTermsReminder = true;
		analysis.reasons.push(`Large group (${passengerCount} passengers) - Terms reminder recommended`);
	}
	
	// Set risk level
	if (analysis.flagged) {
		analysis.riskLevel = analysis.reasons.length > 2 ? 'HIGH' : 'MEDIUM';
		analysis.requiresTermsReminder = true;
	}
	
	return analysis;
};

// Send Terms & Conditions to customer
const sendTermsAndConditions = async (customerInfo, reason = 'standard_review') => {
	try {
		const termsData = {
			type: 'TERMS_AND_CONDITIONS',
			recipient: customerInfo,
			reason: reason,
			timestamp: new Date().toISOString(),
			content: {
				subject: '🚤 Important: Terms & Conditions for Your Boat Booking',
				message: generateTermsMessage(reason),
				attachments: ['marina_terms_conditions.pdf', 'safety_guidelines.pdf']
			}
		};
		
		console.log('📋 TERMS & CONDITIONS SENT TO CUSTOMER:', termsData);
		console.log('📧 Email sent to:', customerInfo.email);
		console.log('📄 Documents attached: Terms of Service, Safety Guidelines');
		
		return { success: true, termsData };
	} catch (error) {
		console.error('❌ Failed to send terms and conditions:', error);
		return { success: false, error: error.message };
	}
};

// Generate terms message based on reason
const generateTermsMessage = (reason) => {
	const baseMessage = `
Dear Valued Customer,

Thank you for your interest in booking with our marina services. To ensure a safe and enjoyable experience for all our guests, please review our terms and conditions.

IMPORTANT SAFETY AND CONDUCT GUIDELINES:
• All passengers must follow safety instructions at all times
• Life jackets are mandatory and will be provided
• No illegal substances or excessive alcohol consumption permitted
• Respectful behavior toward staff and other guests is required
• Damage to vessel or equipment will result in additional charges
• Weather conditions may require rescheduling for safety

BOOKING TERMS:
• Full payment required 48 hours before departure
• Cancellation policy: 24-hour notice for full refund
• Late arrivals may result in shortened trip duration
• Maximum capacity limits strictly enforced

By proceeding with your booking, you acknowledge agreement to all terms and conditions.

Best regards,
Marina Management Team
`;

	const reasonSpecificMessages = {
		'content_review': `\n⚠️  ADDITIONAL NOTICE: Your booking request requires special review due to specific requirements mentioned. Please ensure all activities comply with our safety and conduct policies.\n`,
		'large_group': `\n👥 LARGE GROUP NOTICE: Special guidelines apply to groups over 15 passengers. Additional safety briefing and supervision will be provided.\n`,
		'standard_review': ''
	};
	
	return baseMessage + (reasonSpecificMessages[reason] || reasonSpecificMessages['standard_review']);
};

// Employee schedule service
const addToEmployeeSchedule = async (bookingData) => {
	try {
		const scheduleData = {
			eventType: 'BOAT_BOOKING_REQUEST',
			customerName: bookingData.customerName,
			contactInfo: {
				email: bookingData.customerEmail,
				phone: bookingData.customerPhone
			},
			bookingDetails: {
				packageName: bookingData.packageName,
				bookingDate: bookingData.bookingDate,
				bookingTime: bookingData.bookingTime,
				passengers: bookingData.numberOfPassengers,
				duration: bookingData.duration
			},
			status: 'PENDING_REVIEW',
			createdAt: new Date().toISOString(),
			followUpRequired: true,
			followUpDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
		};

		console.log('📅 EMPLOYEE SCHEDULE ENTRY CREATED:', scheduleData);
		console.log('⏰ Follow-up reminder set for:', scheduleData.followUpDeadline);
		
		return { success: true, scheduleData };
	} catch (error) {
		console.error('❌ Failed to add to employee schedule:', error);
		return { success: false, error: error.message };
	}
};

// Get all boat bookings
export const getBoatBookings = async (req, res) => {
	try {
		const bookings = await BoatBooking.find({}).populate('packageId').sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: bookings });
	} catch (error) {
		console.log("Error in fetching boat bookings:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Create new boat booking (Customer)
export const createBoatBooking = async (req, res) => {
	console.log('🚀 CREATE BOAT BOOKING REQUEST RECEIVED');
	console.log('Request method:', req.method);
	console.log('Request headers:', req.headers);
	console.log('Request body:', req.body);
	
	const booking = req.body;

	// Validate required fields
	const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'packageId', 'packageName', 'numberOfPassengers', 'passengerNames', 'bookingDate', 'bookingTime', 'duration', 'totalPrice'];
	const missingFields = requiredFields.filter(field => !booking[field]);

	if (missingFields.length > 0) {
		return res.status(400).json({ 
			success: false, 
			message: `Please provide all required fields: ${missingFields.join(', ')}` 
		});
	}

	// Email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(booking.customerEmail)) {
		return res.status(400).json({ 
			success: false, 
			message: "Please provide a valid email address" 
		});
	}

	// Validate package ID
	if (!mongoose.Types.ObjectId.isValid(booking.packageId)) {
		return res.status(400).json({ 
			success: false, 
			message: "Please provide a valid package ID" 
		});
	}

	// Validate passenger count
	if (isNaN(booking.numberOfPassengers) || booking.numberOfPassengers <= 0) {
		return res.status(400).json({ 
			success: false, 
			message: "Please provide a valid number of passengers" 
		});
	}

	// Validate total price
	if (isNaN(booking.totalPrice) || booking.totalPrice <= 0) {
		return res.status(400).json({ 
			success: false, 
			message: "Please provide a valid total price" 
		});
	}

	// Set default employee info
	if (!booking.employeeInfo) {
		booking.employeeInfo = {
			status: booking.paymentStatus === 'paid' ? "Confirmed" : "Pending Review",
			priority: "HIGH", // New bookings get high priority
			followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
		};
	}

	const newBooking = new BoatBooking(booking);

	try {
		// Save the booking first
		const savedBooking = await newBooking.save();
		
		// Send employee notification after successful save
		try {
			const notificationResult = await sendEmployeeNotification(savedBooking);
			const scheduleResult = await addToEmployeeSchedule(savedBooking);
			
			// Check if terms and conditions should be sent
			if (notificationResult.success && notificationResult.contentAnalysis) {
				const analysis = notificationResult.contentAnalysis;
				
				if (analysis.requiresTermsReminder || analysis.flagged) {
					const reason = analysis.flagged ? 'content_review' : 
								 parseInt(savedBooking.numberOfPassengers) > 15 ? 'large_group' : 'standard_review';
					
					await sendTermsAndConditions({
						name: savedBooking.customerName,
						email: savedBooking.customerEmail,
						phone: savedBooking.customerPhone
					}, reason);
					
					// Update booking to reflect terms sent
					savedBooking.termsSent = true;
					savedBooking.termsReason = reason;
					savedBooking.termsSentAt = new Date();
				}
			}
			
			// Update the booking to mark notification as sent
			if (notificationResult.success) {
				savedBooking.contentAnalysis = notificationResult.contentAnalysis;
				await savedBooking.save();
			}
			
			console.log('✅ Boat booking created and employee notified successfully');
			console.log('📋 Booking ID:', savedBooking._id);
			
			if (notificationResult.contentAnalysis?.flagged) {
				console.log('⚠️  Booking flagged for employee review');
				console.log('📄 Terms & Conditions automatically sent to customer');
			}
			
		} catch (notificationError) {
			console.error('⚠️  Booking saved but notification failed:', notificationError);
			// Don't fail the request if notification fails
		}

		res.status(201).json({ 
			success: true, 
			data: savedBooking,
			message: "Boat booking request submitted successfully! We will contact you within 24 hours to confirm your reservation."
		});
		
	} catch (error) {
		console.error("Error in Create boat booking:", error.message);
		
		// Provide more specific error messages
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map(err => err.message);
			return res.status(400).json({ 
				success: false, 
				message: `Validation Error: ${validationErrors.join(', ')}` 
			});
		}
		
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Update boat booking
export const updateBoatBooking = async (req, res) => {
	const { id } = req.params;
	const booking = req.body;
	console.log('PUT /api/boat-bookings/:id', { id, booking });

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Invalid Boat Booking Id:', id);
		return res.status(404).json({ success: false, message: "Invalid Boat Booking Id" });
	}

	try {
		// First get the existing booking to preserve customer data
		const existingBooking = await BoatBooking.findById(id);
		if (!existingBooking) {
			console.log('No boat booking found for update:', id);
			return res.status(404).json({ success: false, message: "Boat booking not found" });
		}

		// Ensure customer data is preserved
		const updateData = {
			...booking,
			customerName: booking.customerName || existingBooking.customerName,
			customerEmail: booking.customerEmail || existingBooking.customerEmail,
			customerPhone: booking.customerPhone || existingBooking.customerPhone
		};

		console.log('🔧 Update data with preserved customer info:', updateData);

		const updatedBooking = await BoatBooking.findByIdAndUpdate(id, updateData, { new: true }).populate('packageId');
		res.status(200).json({ success: true, data: updatedBooking });
	} catch (error) {
		console.log('Error updating boat booking:', error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Delete boat booking
export const deleteBoatBooking = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Boat Booking Id" });
	}

	try {
		await BoatBooking.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: "Boat booking deleted successfully" });
	} catch (error) {
		console.log("Error in deleting boat booking:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// EMPLOYEE SPECIFIC ENDPOINTS

// Get employee dashboard data
export const getEmployeeDashboard = async (req, res) => {
	try {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Get bookings that need follow-up
		const pendingBookings = await BoatBooking.find({
			'employeeInfo.status': 'Pending Review',
			'employeeInfo.followUpDate': { $lte: tomorrow }
		}).populate('packageId').sort({ createdAt: -1 });

		// Get recent bookings
		const recentBookings = await BoatBooking.find({})
			.populate('packageId')
			.sort({ createdAt: -1 })
			.limit(10);

		// Get booking statistics
		const stats = {
			totalBookings: await BoatBooking.countDocuments(),
			pendingReview: await BoatBooking.countDocuments({ 'employeeInfo.status': 'Pending Review' }),
			confirmed: await BoatBooking.countDocuments({ 'employeeInfo.status': 'Confirmed' }),
			needFollowUp: pendingBookings.length,
			todayBookings: await BoatBooking.countDocuments({
				createdAt: {
					$gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
					$lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
				}
			})
		};

		res.status(200).json({
			success: true,
			data: {
				stats,
				pendingBookings,
				recentBookings
			}
		});
	} catch (error) {
		console.error("Error in employee dashboard:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
	const { id } = req.params;
	const { status, notes, quotedPrice, assignedEmployee } = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Booking Id" });
	}

	try {
		const booking = await BoatBooking.findById(id);
		if (!booking) {
			return res.status(404).json({ success: false, message: "Boat booking not found" });
		}

		// Update employee info
		booking.employeeInfo = {
			...booking.employeeInfo,
			status: status || booking.employeeInfo.status,
			employeeNotes: notes || booking.employeeInfo.employeeNotes,
			quotedPrice: quotedPrice || booking.employeeInfo.quotedPrice,
			assignedEmployee: assignedEmployee || booking.employeeInfo.assignedEmployee,
			lastContactDate: new Date()
		};

		await booking.save();

		console.log(`📋 Boat booking ${id} status updated to: ${status}`);

		res.status(200).json({
			success: true,
			data: booking,
			message: "Boat booking status updated successfully"
		});
	} catch (error) {
		console.error("Error updating booking status:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Get bookings by status
export const getBookingsByStatus = async (req, res) => {
	try {
		const { status } = req.query;
		const filter = status ? { 'employeeInfo.status': status } : {};
		
		const bookings = await BoatBooking.find(filter)
			.populate('packageId')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: bookings,
			count: bookings.length
		});
	} catch (error) {
		console.error("Error fetching bookings by status:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Get flagged bookings for employee review
export const getFlaggedBookings = async (req, res) => {
	try {
		const flaggedBookings = await BoatBooking.find({
			'contentAnalysis.flagged': true
		}).populate('packageId').sort({ createdAt: -1 });

		const pendingReview = flaggedBookings.filter(booking => 
			booking.employeeInfo.status === 'Pending Review'
		);

		res.status(200).json({
			success: true,
			data: {
				flaggedBookings,
				pendingReview,
				totalFlagged: flaggedBookings.length,
				pendingCount: pendingReview.length
			}
		});
	} catch (error) {
		console.error("Error fetching flagged bookings:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Send terms and conditions to specific customer
export const sendTermsToCustomer = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason, customMessage } = req.body;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(404).json({ success: false, message: "Invalid Booking Id" });
		}

		const booking = await BoatBooking.findById(id);
		if (!booking) {
			return res.status(404).json({ success: false, message: "Boat booking not found" });
		}

		const customerInfo = {
			name: booking.customerName,
			email: booking.customerEmail,
			phone: booking.customerPhone
		};

		const termsResult = await sendTermsAndConditions(customerInfo, reason || 'employee_request');

		if (termsResult.success) {
			// Update booking record
			booking.termsSent = true;
			booking.termsReason = reason || 'employee_request';
			booking.termsSentAt = new Date();
			booking.employeeInfo.employeeNotes = (booking.employeeInfo.employeeNotes || '') + 
				`\n[${new Date().toISOString()}] Terms & Conditions sent by employee. Reason: ${reason || 'employee_request'}`;
			
			if (customMessage) {
				booking.employeeInfo.employeeNotes += `\nCustom message: ${customMessage}`;
			}

			await booking.save();
		}

		res.status(200).json({
			success: termsResult.success,
			message: termsResult.success ? "Terms & Conditions sent successfully" : "Failed to send terms",
			data: termsResult.termsData
		});
	} catch (error) {
		console.error("Error sending terms to customer:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Employee content review action
export const reviewBookingContent = async (req, res) => {
	try {
		const { id } = req.params;
		const { action, employeeNotes, sendTerms } = req.body; // action: 'approve', 'reject', 'request_modification'

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(404).json({ success: false, message: "Invalid Booking Id" });
		}

		const booking = await BoatBooking.findById(id);
		if (!booking) {
			return res.status(404).json({ success: false, message: "Boat booking not found" });
		}

		// Update booking based on employee action
		switch (action) {
			case 'approve':
				booking.employeeInfo.status = 'Confirmed';
				booking.contentReviewed = true;
				booking.reviewAction = 'approved';
				break;
			case 'reject':
				booking.employeeInfo.status = 'Cancelled';
				booking.contentReviewed = true;
				booking.reviewAction = 'rejected';
				break;
			case 'request_modification':
				booking.employeeInfo.status = 'Pending Review';
				booking.contentReviewed = false;
				booking.reviewAction = 'modification_requested';
				break;
		}

		booking.employeeInfo.employeeNotes = (booking.employeeInfo.employeeNotes || '') + 
			`\n[${new Date().toISOString()}] Employee review: ${action}. Notes: ${employeeNotes || 'None'}`;
		booking.reviewedAt = new Date();
		booking.reviewedBy = 'Employee'; // In production, use actual employee ID

		// Send terms if requested
		if (sendTerms) {
			const customerInfo = {
				name: booking.customerName,
				email: booking.customerEmail,
				phone: booking.customerPhone
			};
			
			await sendTermsAndConditions(customerInfo, 'employee_review');
			booking.termsSent = true;
			booking.termsReason = 'employee_review';
			booking.termsSentAt = new Date();
		}

		await booking.save();

		console.log(`📋 Boat booking ${id} reviewed by employee: ${action}`);

		res.status(200).json({
			success: true,
			message: `Boat booking ${action} successfully`,
			data: booking
		});
	} catch (error) {
		console.error("Error reviewing booking content:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Get customer's own bookings
export const getCustomerBookings = async (req, res) => {
	try {
		const { user } = req; // Assuming user is attached by auth middleware
		
		if (!user || !user.id) {
			return res.status(401).json({ 
				success: false, 
				message: "Authentication required" 
			});
		}

		const { page = 1, limit = 10, status } = req.query;
		const skip = (page - 1) * limit;

		// Build query filter - we need to get user's email first
		const User = (await import('../models/userModel.js')).default;
		const userDoc = await User.findById(user.id);
		
		if (!userDoc) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found" 
			});
		}

		const filter = { customerEmail: userDoc.email };
		if (status && status !== 'all') {
			filter.status = status;
		}

		// Get bookings with pagination
		const bookings = await BoatBooking.find(filter)
			.populate('packageId')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
		const total = await BoatBooking.countDocuments(filter);
		const pages = Math.ceil(total / limit);

		res.status(200).json({
			success: true,
			data: {
				bookings,
				pagination: {
					current: parseInt(page),
					pages,
					total,
					limit: parseInt(limit)
				}
			}
		});
	} catch (error) {
		console.error("Error fetching customer bookings:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Confirm payment for boat booking
export const confirmBoatBookingPayment = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const { paymentId, paymentAmount } = req.body;

		if (!mongoose.Types.ObjectId.isValid(bookingId)) {
			return res.status(404).json({ success: false, message: "Invalid Booking Id" });
		}

		const booking = await BoatBooking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ success: false, message: "Boat booking not found" });
		}

		// Update payment information
		booking.paymentStatus = 'paid';
		booking.paymentId = paymentId;
		booking.paymentAmount = paymentAmount;
		booking.paidAt = new Date();
		
		// Update employee info status to confirmed after payment
		booking.employeeInfo = {
			...booking.employeeInfo,
			status: 'Confirmed',
			lastContactDate: new Date()
		};

		await booking.save();

		console.log(`💳 Boat booking ${bookingId} payment confirmed: Rs. ${paymentAmount}`);

		res.status(200).json({
			success: true,
			message: "Payment confirmed successfully",
			data: {
				bookingId: booking._id,
				paymentStatus: booking.paymentStatus,
				paymentAmount: booking.paymentAmount,
				paidAt: booking.paidAt,
				status: booking.employeeInfo.status
			}
		});

	} catch (error) {
		console.log("Error in confirming boat booking payment:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

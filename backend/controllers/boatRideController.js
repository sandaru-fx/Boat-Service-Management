import BoatRide from '../models/boatRideModel.js';
import BoatBooking from '../models/boatBooking.model.js';

// Create a new boat ride booking
const createBoatRide = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      rideDate,
      rideTime,
      duration,
      passengers,
      boatType,
      journeyType,
      basePrice,
      passengerPrice,
      specialRequests,
      emergencyContact
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !rideDate || !rideTime || 
        !duration || !passengers || !boatType || !journeyType || !basePrice || !passengerPrice) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check for duplicate booking (same date, time, and boat type)
    const existingBooking = await BoatRide.findOne({
      rideDate: new Date(rideDate),
      rideTime,
      boatType,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'A booking already exists for this date, time, and boat type'
      });
    }

    // Calculate total price
    const totalPrice = basePrice + (passengers * passengerPrice);

    // Create booking data
    const bookingData = {
      customerId: req.user.id,
      customerName,
      customerEmail,
      customerPhone,
      rideDate: new Date(rideDate),
      rideTime,
      duration,
      passengers,
      boatType,
      journeyType,
      basePrice,
      passengerPrice,
      totalPrice,
      specialRequests,
      emergencyContact,
      paymentStatus: 'pending',
      paymentMethod: 'manual'
    };

    // Create booking in database
    const newBooking = await BoatRide.create(bookingData);

    res.status(201).json({
      success: true,
      message: 'Boat ride booking created successfully',
      data: { booking: newBooking }
    });

  } catch (error) {
    console.error('Create boat ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create boat ride booking',
      error: error.message
    });
  }
};

// Get customer's own bookings
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Try both models to find bookings
    const query = { customerEmail: req.user.email }; // BoatBooking uses email instead of ID
    if (status) {
      query.status = status;
    }

    console.log('🔍 Boat Rides Query:', { query, userId: req.user.id, email: req.user.email });

    // Try BoatBooking first (where the data likely is)
    let bookings = await BoatBooking.find(query)
      .populate('packageId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    let total = await BoatBooking.countDocuments(query);

    // If no bookings found in BoatBooking, try BoatRide
    if (bookings.length === 0) {
      console.log('🔍 No bookings in BoatBooking, trying BoatRide...');
      const rideQuery = { customerId: req.user.id };
      if (status) {
        rideQuery.status = status;
      }
      
      bookings = await BoatRide.find(rideQuery)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      total = await BoatRide.countDocuments(rideQuery);
    }
    
    console.log('🔍 Boat Rides Results:', { bookingsCount: bookings.length, total });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get all bookings (employee/admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.rideDate = { $gte: startDate, $lt: endDate };
    }

    const bookings = await BoatRide.find(query)
      .populate('customerId', 'name email phone')
      .sort({ rideDate: 1, rideTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BoatRide.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get specific booking by ID
const getBoatRideById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await BoatRide.findById(id).populate('customerId', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking
const updateBoatRide = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await BoatRide.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can update this booking
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be updated
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled bookings'
      });
    }

    // Update booking
    const updatedBooking = await BoatRide.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Note: Calendly updates will be handled via webhook

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBoatRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await BoatRide.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (req.user.role === 'customer' && booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed bookings'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Note: Calendly cancellation will be handled via webhook

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Assign boat and captain (employee/admin only)
const assignBoatRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedBoat, assignedCaptain } = req.body;

    const booking = await BoatRide.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update assignment
    booking.assignedBoat = assignedBoat;
    booking.assignedCaptain = assignedCaptain;
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Boat and captain assigned successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Assign booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign booking',
      error: error.message
    });
  }
};

// Update booking status (employee/admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await BoatRide.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
    }
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Process refund (employee/admin only)
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, reason } = req.body;

    const booking = await BoatRide.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid booking'
      });
    }

    // Update payment status
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { 
        booking,
        refund: {
          amount: refundAmount || booking.calculateRefund(),
          reason: reason || 'Customer cancellation'
        }
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Handle Calendly webhook (receive booking data from Calendly)
const handleCalendlyWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === 'invitee.created') {
      const { scheduled_event, invitee } = payload;
      
      // Find the booking by customer email and pending status
      const booking = await BoatRide.findOne({
        customerEmail: invitee.email,
        status: 'pending'
      });

      if (booking) {
        // Update booking with Calendly data
        booking.calendlyEventId = scheduled_event.uri.split('/').pop();
        booking.calendlyEventUri = scheduled_event.uri;
        booking.calendlyScheduledAt = scheduled_event.start_time;
        booking.calendlyInviteeUri = invitee.uri;
        booking.status = 'confirmed';
        await booking.save();

        console.log('Booking confirmed via Calendly:', booking._id);
      }
    }

    if (event === 'invitee.canceled') {
      const { scheduled_event, invitee } = payload;
      
      // Find the booking by Calendly event ID
      const booking = await BoatRide.findOne({
        calendlyEventId: scheduled_event.uri.split('/').pop()
      });

      if (booking) {
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.calendlyStatus = 'cancelled';
        await booking.save();

        console.log('Booking cancelled via Calendly:', booking._id);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Calendly webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get ride booking by booking ID (for confirmation page)
const getRideByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await BoatRide.findOne({ _id: bookingId }).populate('customerId', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Get pricing information
const getPricing = async (req, res) => {
  try {
    const { boatType, journeyType, duration, passengers } = req.body;

    if (!boatType || !journeyType || !duration || !passengers) {
      return res.status(400).json({
        success: false,
        message: 'All pricing parameters must be provided'
      });
    }

    // Base pricing structure (you can modify these values as needed)
    const basePricing = {
      'Speedboat': {
        'Sunset Tour': 5000,
        'Adventure Tour': 6000,
        'Island Hopping': 7000,
        'Snorkeling Adventure': 6500,
        'Deep Sea Fishing': 8000,
        'Romantic Cruise': 5500,
        'Family Tour': 4500,
        'Corporate Event': 10000,
        'Birthday Party': 6000,
        'Wedding Proposal': 8000
      },
      'Yacht': {
        'Sunset Tour': 8000,
        'Adventure Tour': 10000,
        'Island Hopping': 12000,
        'Snorkeling Adventure': 11000,
        'Deep Sea Fishing': 15000,
        'Romantic Cruise': 9000,
        'Family Tour': 7000,
        'Corporate Event': 20000,
        'Birthday Party': 10000,
        'Wedding Proposal': 15000
      },
      'Catamaran': {
        'Sunset Tour': 6000,
        'Adventure Tour': 7500,
        'Island Hopping': 9000,
        'Snorkeling Adventure': 8000,
        'Deep Sea Fishing': 10000,
        'Romantic Cruise': 7000,
        'Family Tour': 5500,
        'Corporate Event': 15000,
        'Birthday Party': 7500,
        'Wedding Proposal': 10000
      },
      'Fishing Boat': {
        'Sunset Tour': 3000,
        'Adventure Tour': 4000,
        'Island Hopping': 5000,
        'Snorkeling Adventure': 4500,
        'Deep Sea Fishing': 6000,
        'Romantic Cruise': 3500,
        'Family Tour': 2500,
        'Corporate Event': 8000,
        'Birthday Party': 4000,
        'Wedding Proposal': 5000
      },
      'Dinghy': {
        'Sunset Tour': 2000,
        'Adventure Tour': 2500,
        'Island Hopping': 3000,
        'Snorkeling Adventure': 2800,
        'Deep Sea Fishing': 3500,
        'Romantic Cruise': 2200,
        'Family Tour': 1800,
        'Corporate Event': 5000,
        'Birthday Party': 2500,
        'Wedding Proposal': 3000
      },
      'Jet Ski': {
        'Sunset Tour': 1500,
        'Adventure Tour': 2000,
        'Island Hopping': 2500,
        'Snorkeling Adventure': 2200,
        'Deep Sea Fishing': 3000,
        'Romantic Cruise': 1800,
        'Family Tour': 1200,
        'Corporate Event': 4000,
        'Birthday Party': 2000,
        'Wedding Proposal': 2500
      }
    };

    // Get base price
    const basePrice = basePricing[boatType]?.[journeyType] || 5000;
    
    // Calculate passenger price (per person per hour)
    const passengerPricePerHour = Math.round(basePrice * 0.1); // 10% of base price per person per hour
    
    // Calculate total passenger price
    const passengerPrice = passengerPricePerHour * duration * passengers;
    
    // Calculate total price
    const totalPrice = basePrice + passengerPrice;

    res.status(200).json({
      success: true,
      data: {
        basePrice,
        passengerPrice: passengerPricePerHour,
        totalPrice
      }
    });

  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing information',
      error: error.message
    });
  }
};

// Get boat ride statistics (Employee/Admin only)
const getBoatRideStats = async (req, res) => {
  try {
    const stats = await BoatRide.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRides = await BoatRide.countDocuments();
    const activeRides = await BoatRide.countDocuments({ 
      status: { $in: ['pending', 'confirmed', 'in-progress'] } 
    });
    const completedRides = await BoatRide.countDocuments({ status: 'completed' });
    const cancelledRides = await BoatRide.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        total: totalRides,
        active: activeRides,
        completed: completedRides,
        cancelled: cancelledRides,
        byStatus: stats
      }
    });

  } catch (error) {
    console.error('Get boat ride stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get boat ride statistics',
      error: error.message
    });
  }
};

export {
  createBoatRide,
  getMyBookings,
  getAllBookings,
  getBoatRideById,
  updateBoatRide,
  cancelBoatRide,
  assignBoatRide,
  updateBookingStatus,
  processRefund,
  handleCalendlyWebhook,
  getRideByBookingId,
  getPricing,
  getBoatRideStats
};

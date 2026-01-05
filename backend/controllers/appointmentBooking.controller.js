import mongoose from "mongoose";
import Appointment from "../models/appointmentBooking.model.js";
import Payment from "../models/Payment.js";

// Get all appointments with payment status
export const getAppointments = async (req, res) => {
  try {
    const { status, date, serviceType, paymentStatus } = req.query;
    
    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (date) filter.appointmentDate = new Date(date);
    if (serviceType) filter.serviceType = serviceType;
    
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    
    // Get payment status for each appointment
    const appointmentsWithPaymentStatus = await Promise.all(
      appointments.map(async (appointment) => {
        // For Boat Purchase Visit appointments, check if payment exists
        if (appointment.serviceType === 'Boat Purchase Visit') {
          const payment = await Payment.findOne({
            serviceType: 'boat_sales_visit',
            customerEmail: appointment.customerEmail,
            serviceId: appointment._id.toString()
          });
          
          return {
            ...appointment.toObject(),
            paymentStatus: payment ? payment.status : 'completed', // Assume paid if no payment record found
            paymentId: payment ? payment._id : null
          };
        }
        
        // For other appointment types, assume paid (all appointments require payment)
        return {
          ...appointment.toObject(),
          paymentStatus: 'completed',
          paymentId: null
        };
      })
    );
    
    // Filter by payment status if specified
    let filteredAppointments = appointmentsWithPaymentStatus;
    if (paymentStatus && paymentStatus !== 'All') {
      filteredAppointments = appointmentsWithPaymentStatus.filter(
        appointment => appointment.paymentStatus === paymentStatus
      );
    }
    
    res.status(200).json({ success: true, data: filteredAppointments });
  } catch (error) {
    console.log("error in fetching appointments", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get customer's own appointments
export const getCustomerAppointments = async (req, res) => {
  try {
    const { customerEmail } = req.query;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }
    
    const appointments = await Appointment.find({ customerEmail })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .exec();

    res.status(200).json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Get customer appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer appointments',
      error: error.message
    });
  }
};

// Update customer's own appointment
export const updateCustomerAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { customerEmail } = req.query;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid Appointment Id" 
      });
    }

    // Find the appointment and verify it belongs to the customer
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.customerEmail !== customerEmail) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own appointments" 
      });
    }

    // Only allow editing if status is Pending
    if (appointment.status && appointment.status.toLowerCase() !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "Only pending appointments can be edited" 
      });
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedAppointment,
      message: "Appointment updated successfully"
    });

  } catch (error) {
    console.error('Update customer appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Delete customer's own appointment
export const deleteCustomerAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerEmail } = req.query;
    
    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid Appointment Id" 
      });
    }

    // Find the appointment and verify it belongs to the customer
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.customerEmail !== customerEmail) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own appointments" 
      });
    }

    // Only allow deleting if status is Pending
    if (appointment.status && appointment.status.toLowerCase() !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "Only pending appointments can be cancelled" 
      });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully"
    });

  } catch (error) {
    console.error('Delete customer appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Appointment Id" });
  }

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.log("error in fetching appointment", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  const appointment = req.body;

  // Validation
  if (!appointment.customerName || !appointment.customerEmail || !appointment.customerPhone) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide customer information (name, email, phone)" 
    });
  }

  if (!appointment.serviceType || !appointment.appointmentDate || !appointment.appointmentTime) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide service type, date, and time" 
    });
  }

  if (!appointment.boatDetails?.boatName || !appointment.boatDetails?.boatType) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide boat name and type" 
    });
  }

  if (!appointment.description) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide service description" 
    });
  }

  // Check for conflicting appointments
  const existingAppointment = await Appointment.findOne({
    appointmentDate: new Date(appointment.appointmentDate),
    appointmentTime: appointment.appointmentTime,
    status: { $in: ['Pending', 'Confirmed', 'In Progress'] }
  });

  if (existingAppointment) {
    return res.status(400).json({ 
      success: false, 
      message: "Time slot is already booked. Please choose another time." 
    });
  }

  const newAppointment = new Appointment(appointment);

  try {
    await newAppointment.save();
    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    console.error("Error in Create appointment", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const appointment = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Appointment Id" });
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, appointment, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.status(200).json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error("Error in Update appointment", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Appointment Id" });
  }

  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    if (!deletedAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.status(200).json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error in Delete appointment", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get available time slots for a specific date
export const getAvailableTimeSlots = async (req, res) => {
  const { date } = req.params;
  
  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required" });
  }

  try {
    const appointmentDate = new Date(date);
    
    // Get all time slots
    const allTimeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
    ];
    
    // Get booked time slots for the date
    const bookedAppointments = await Appointment.find({
      appointmentDate: appointmentDate,
      status: { $in: ['Pending', 'Confirmed', 'In Progress'] }
    });
    
    const bookedTimeSlots = bookedAppointments.map(apt => apt.appointmentTime);
    
    // Filter available time slots
    const availableTimeSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
    
    res.status(200).json({ 
      success: true, 
      data: {
        date: appointmentDate,
        availableSlots: availableTimeSlots,
        bookedSlots: bookedTimeSlots
      }
    });
  } catch (error) {
    console.log("error in fetching available time slots", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Appointment Id" });
  }

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedAppointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    res.status(200).json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error("Error in Update appointment status", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get calendar data for a specific month
export const getCalendarData = async (req, res) => {
  const { year, month } = req.params;
  
  if (!year || !month) {
    return res.status(400).json({ success: false, message: "Year and month are required" });
  }

  try {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ success: false, message: "Invalid year or month" });
    }

    // Create date range for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // Get all appointments for the month
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ['Pending', 'Confirmed', 'In Progress'] }
    });

    // Process appointments to get booked dates
    const bookedDates = new Set();
    const dateSlotCount = {};

    appointments.forEach(appointment => {
      const dateStr = appointment.appointmentDate.toISOString().split('T')[0];
      bookedDates.add(dateStr);
      
      if (!dateSlotCount[dateStr]) {
        dateSlotCount[dateStr] = 0;
      }
      dateSlotCount[dateStr]++;
    });

    // Define total available slots per day (12 slots: 9 AM to 8 PM)
    const totalSlotsPerDay = 12;
    const fullyBookedDates = [];
    const partiallyBookedDates = [];

    bookedDates.forEach(dateStr => {
      const slotCount = dateSlotCount[dateStr] || 0;
      if (slotCount >= totalSlotsPerDay) {
        fullyBookedDates.push(dateStr);
      } else if (slotCount > 0) {
        partiallyBookedDates.push(dateStr);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        year: yearNum,
        month: monthNum,
        bookedDates: Array.from(bookedDates),
        partiallyBookedDates: partiallyBookedDates,
        fullyBookedDates: fullyBookedDates,
        totalAppointments: appointments.length
      }
    });
  } catch (error) {
    console.log("error in fetching calendar data", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get appointment statistics (Employee/Admin only)
export const getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments();
    const pendingVisits = await Appointment.countDocuments({ 
      status: { $in: ['Pending', 'Confirmed'] } 
    });
    const completedVisits = await Appointment.countDocuments({ status: 'Completed' });
    const cancelledVisits = await Appointment.countDocuments({ status: 'Cancelled' });

    res.status(200).json({
      success: true,
      data: {
        total: totalAppointments,
        pendingVisits: pendingVisits,
        completed: completedVisits,
        cancelled: cancelledVisits,
        byStatus: stats
      }
    });

  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment statistics',
      error: error.message
    });
  }
};

import BoatRepair from '../models/boatRepairModel.js';
import User from '../models/userModel.js';
import Payment from '../models/Payment.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Helper function to check permissions
const checkPermission = (user, requiredRole) => {
  if (!user || user.role !== requiredRole) {
    throw new Error('Not authorized to perform this action');
  }
};

// @desc    Create new boat repair request
// @route   POST /api/boat-repairs
// @access  Private (Customer)
export const createBoatRepair = async (req, res, next) => {
  try {
    checkPermission(req.user, 'customer');

    const {
      serviceType,
      problemDescription,
      serviceDescription,
      boatDetails,
      photos,
      scheduledDateTime,
      calendlyEventId,
      calendlyEventUri,
      serviceLocation,
      customerNotes,
      payment,
      diagnosticFee
    } = req.body;

    // Create the repair request
    const boatRepair = await BoatRepair.create({
      customer: req.user.id,
      serviceType,
      problemDescription,
      serviceDescription,
      boatDetails,
      photos: photos || [],
      scheduledDateTime: new Date(scheduledDateTime),
      calendlyEventId,
      calendlyEventUri,
      serviceLocation,
      customerNotes,
      status: 'pending',
      // Add advance payment information
      payment: payment ? {
        status: 'paid',
        amount: payment.amount || diagnosticFee || 0,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        paidAt: payment.paidAt || new Date()
      } : {
        status: 'pending',
        amount: 0
      },
      cost: diagnosticFee || 0 // Set initial cost to diagnostic fee
    });

    // Payment record is already created in createPaymentIntent, no need to create again
    // Just update the existing payment record with the repair booking ID
    if (payment && payment.amount > 0) {
      console.log('Updating existing Payment record with repair booking ID:', {
        paymentId: payment.paymentId,
        bookingId: boatRepair.bookingId,
        userEmail: req.user.email,
        userName: req.user.name
      });
      
      // Find and update the existing payment record
      const existingPayment = await Payment.findOne({ paymentId: payment.paymentId });
      if (existingPayment) {
        existingPayment.serviceId = boatRepair.bookingId;
        existingPayment.serviceDescription = `${serviceType} - Advance Payment (Diagnostic Fee)`;
        await existingPayment.save();
        console.log('Payment record updated successfully');
      } else {
        console.log('Payment record not found with paymentId:', payment.paymentId);
      }
    }

    // Populate customer info for response
    const populatedRepair = await BoatRepair.findById(boatRepair._id)
      .populate('customer', 'name phone email');

    res.status(201).json({
      success: true,
      message: 'Boat repair request created successfully',
      data: populatedRepair,
      bookingId: boatRepair.bookingId
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all boat repairs (for employees/admins)
// @route   GET /api/boat-repairs
// @access  Private (Employee/Admin)
export const getAllBoatRepairs = async (req, res, next) => {
  try {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      throw new Error('Not authorized to view all boat repairs');
    }

    const repairs = await BoatRepair.find({})
      .populate('customer', 'name phone email')
      .populate('assignedTechnician', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single boat repair by ID
// @route   GET /api/boat-repairs/:id
// @access  Private (Customer/Employee/Admin)
export const getBoatRepairById = async (req, res, next) => {
  try {
    const repair = await BoatRepair.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('assignedTechnician', 'name email')
      .populate('assignedBy', 'name email');

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Boat repair request not found'
      });
    }

    // Check if user has access to this repair (temporarily disabled for debugging)
    // if (
    //   repair.customer._id.toString() !== req.user.id &&
    //   (repair.assignedTechnician && repair.assignedTechnician._id.toString() !== req.user.id) &&
    //   req.user.role !== 'admin' &&
    //   req.user.role !== 'employee'
    // ) {
    //   throw new Error('Not authorized to view this repair request');
    // }

    // Add repairCosts virtual field for frontend compatibility
    const repairData = repair.toObject();
    const advancePayment = repair.payment?.amount || 0;
    const finalCost = repair.finalCost || repair.cost || 0;
    const remainingAmount = Math.max(0, finalCost - advancePayment);
    
    repairData.repairCosts = {
      advancePayment,
      finalCost,
      remainingAmount,
      paymentStatus: (() => {
        if (repair.finalCost && repair.finalCost > 0) {
          if (repair.finalPayment?.status === 'paid') {
            return 'fully_paid';
          }
          return 'invoice_sent';
        }
        return 'advance_paid';
      })(),
      invoiceSentAt: repair.finalCost ? new Date() : null,
      finalPaymentAt: repair.finalPayment?.status === 'paid' ? repair.finalPayment.paidAt : null
    };

    res.status(200).json({
      success: true,
      data: repairData
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get boat repair by booking ID
// @route   GET /api/boat-repairs/booking/:bookingId
// @access  Private (Customer/Employee/Admin)
export const getBoatRepairByBookingId = async (req, res, next) => {
  try {
    const repair = await BoatRepair.findOne({ bookingId: req.params.bookingId })
      .populate('customer', 'name phone email')
      .populate('assignedTechnician', 'name email')
      .populate('assignedBy', 'name email');

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Boat repair request not found'
      });
    }

    // Check if user has access to this repair
    if (
      repair.customer._id.toString() !== req.user.id &&
      (repair.assignedTechnician && repair.assignedTechnician._id.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      throw new Error('Not authorized to view this repair request');
    }

    res.status(200).json({
      success: true,
      data: repair
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's boat repairs
// @route   GET /api/boat-repairs/my-repairs
// @access  Private (Customer)
export const getMyBoatRepairs = async (req, res, next) => {
  try {
    checkPermission(req.user, 'customer');

    const repairs = await BoatRepair.find({ customer: req.user.id })
      .populate('assignedTechnician', 'name email')
      .sort({ createdAt: -1 });

    // Debug: Log repair data to see what's missing
    console.log('Found repairs for user:', req.user.id, 'count:', repairs.length);
    repairs.forEach((repair, index) => {
      console.log(`Repair ${index + 1}:`, {
        id: repair._id,
        status: repair.status,
        cost: repair.cost,
        totalCost: repair.totalCost
      });
    });

    // Add repairCosts virtual field for frontend compatibility
    const repairsWithCosts = repairs.map(repair => {
      const repairData = repair.toObject();
      const advancePayment = repair.payment?.amount || 0;
      const finalCost = repair.finalCost || repair.cost || 0;
      const remainingAmount = Math.max(0, finalCost - advancePayment);
      
      repairData.repairCosts = {
        advancePayment,
        finalCost,
        remainingAmount,
        paymentStatus: (() => {
          if (repair.finalCost && repair.finalCost > 0) {
            if (repair.finalPayment?.status === 'paid') {
              return 'fully_paid';
            }
            return 'invoice_sent';
          }
          return 'advance_paid';
        })(),
        invoiceSentAt: repair.finalCost ? new Date() : null,
        finalPaymentAt: repair.finalPayment?.status === 'paid' ? repair.finalPayment.paidAt : null
      };
      
      return repairData;
    });

    res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairsWithCosts
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update boat repair (for employees/admins)
// @route   PUT /api/boat-repairs/:id
// @access  Private (Employee/Admin)
export const updateBoatRepair = async (req, res, next) => {
  try {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      throw new Error('Not authorized to update boat repairs');
    }

    const {
      status,
      assignedTechnician,
      cost,
      internalNotes,
      priority,
      workPerformed
    } = req.body;

    const repair = await BoatRepair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Boat repair request not found'
      });
    }

    // Update fields
    if (status && status !== repair.status) {
      repair.status = status;
    }

    if (assignedTechnician) {
      const technician = await User.findById(assignedTechnician);
      if (!technician || technician.role !== 'employee') {
        return res.status(400).json({
          success: false,
          message: 'Assigned technician must be an employee'
        });
      }
      repair.assignedTechnician = assignedTechnician;
      repair.assignedBy = req.user.id;
      repair.assignedAt = new Date();
    }

    if (cost !== undefined) repair.cost = cost;
    if (internalNotes !== undefined) repair.internalNotes = internalNotes;
    if (priority !== undefined) repair.priority = priority;
    if (workPerformed !== undefined) repair.workPerformed = workPerformed;
    if (partsUsed !== undefined) repair.partsUsed = partsUsed;
    if (laborHours !== undefined) repair.laborHours = laborHours;
    if (laborRate !== undefined) repair.laborRate = laborRate;

    await repair.save();

    // Populate and return updated repair
    const updatedRepair = await BoatRepair.findById(repair._id)
      .populate('customer', 'name phone email')
      .populate('assignedTechnician', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Boat repair updated successfully',
      data: updatedRepair
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete boat repair
// @route   DELETE /api/boat-repairs/:id
// @access  Private (Admin)
export const deleteBoatRepair = async (req, res, next) => {
  try {
    checkPermission(req.user, 'admin');

    const repair = await BoatRepair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Boat repair request not found'
      });
    }

    await repair.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Boat repair request deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF confirmation
// @route   GET /api/boat-repairs/:id/pdf
// @access  Private (Customer/Employee/Admin)
export const generatePDFConfirmation = async (req, res, next) => {
  try {
    const repair = await BoatRepair.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('assignedTechnician', 'name email');

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Boat repair request not found'
      });
    }

    // Check if user has access to this repair
    if (
      repair.customer._id.toString() !== req.user.id &&
      (repair.assignedTechnician && repair.assignedTechnician._id.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      throw new Error('Not authorized to view this repair request');
    }

    // Create PDF with proper margins and layout
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    // Set response headers with cache busting
    res.setHeader('Content-Type', 'application/pdf');
    const timestamp = Date.now();
    res.setHeader('Content-Disposition', `attachment; filename="repair-confirmation-${repair.bookingId}-${timestamp}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Pipe PDF to response
    doc.pipe(res);

    // Page management
    let currentPage = 1;
    const maxPages = 2;
    const pageHeight = 750; // A4 height minus margins
    const pageBreakMargin = 50;

    // Helper function to check if we need a page break
    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - pageBreakMargin && currentPage < maxPages) {
        doc.addPage();
        currentPage++;
        currentY = 50;
        return true;
      }
      return false;
    };

    // Helper function to add section with better spacing
    const addSection = (title) => {
      checkPageBreak(35);
      currentY += 10; // Extra space before section
      doc.fontSize(14).fillColor('#0d9488').text(title, 50, currentY);
      currentY += 25; // More space after title
      return currentY;
    };

    // Helper function to add field with label and value (side-by-side)
    const addField = (label, value, color = '#374151') => {
      if (!value || value === 'N/A') return currentY; // Skip empty fields
      checkPageBreak(18);
      doc.fontSize(10).fillColor('#6b7280').text(label + ':', 50, currentY);
      doc.fontSize(10).fillColor(color).text(value, 200, currentY);
      currentY += 18; // More space between fields
      return currentY;
    };

    // Helper function to add multiline text (side-by-side layout)
    const addMultilineText = (label, text, maxWidth = 300) => {
      if (!text || text.trim() === '') return currentY; // Skip empty text
      const textHeight = doc.heightOfString(text, { width: maxWidth });
      checkPageBreak(textHeight + 25);
      doc.fontSize(10).fillColor('#6b7280').text(label + ':', 50, currentY);
      doc.fontSize(9).fillColor('#374151').text(text, 200, currentY, { width: maxWidth });
      currentY += Math.max(textHeight, 18) + 5; // Ensure minimum spacing
      return currentY;
    };

    let currentY = 50;




    // Company Header - Better Spaced
    console.log('🚢 Generating PDF with Marine Services Center branding...');
    doc.rect(50, currentY, 500, 40).fillColor('#f0fdfa').fill();
    doc.rect(50, currentY, 500, 40).strokeColor('#0d9488').lineWidth(1).stroke();
    
    // MSS logo
    doc.rect(55, currentY + 7, 26, 26).fillColor('#0d9488').fill();
    doc.fontSize(8).fillColor('white').text('MSS', 62, currentY + 15);
    
    // Company details - left aligned next to logo
    doc.fontSize(16).fillColor('#0d9488').text('Marine Services Center', 90, currentY + 8);
    doc.fontSize(9).fillColor('#374151').text('Professional Boat Services', 90, currentY + 22);
    doc.fontSize(8).fillColor('#6b7280').text('Email: info@boatservice.lk | Phone: +94 11 234 5678', 90, currentY + 32);
    
    currentY += 50;

    // Document Title - Left aligned, good size
    doc.fontSize(20).fillColor('#0d9488').text('Repair Service Confirmation', 50, currentY);
    currentY += 30;

    // Booking ID and Status (better spaced)
    doc.rect(50, currentY, 500, 25).fillColor('#fef3c7').fill();
    doc.fontSize(12).fillColor('#92400e').text(`Booking ID: ${repair.bookingId}`, 60, currentY + 7);
    doc.fontSize(11).fillColor('#92400e').text(`Status: ${repair.status.toUpperCase()}`, 350, currentY + 8);
    currentY += 35;

    // PAGE 1: Essential Information (Priority Content)
    
    // Customer Information Section
    addSection('Customer Information');
    addField('Full Name', repair.customer.name);
    addField('Phone Number', repair.customer.phone);
    addField('Email Address', repair.customer.email);

    // Boat Information Section
    addSection('Boat Information');
    addField('Boat Type', repair.boatDetails.boatType.replace('_', ' ').toUpperCase());
    addField('Make', repair.boatDetails.boatMake);
    addField('Model', repair.boatDetails.boatModel);
    addField('Year', repair.boatDetails.boatYear.toString());
    addField('Engine Type', repair.boatDetails.engineType?.replace('_', ' ').toUpperCase());
    addField('Engine Model', repair.boatDetails.engineModel);
    addField('Hull Material', repair.boatDetails.hullMaterial?.replace('_', ' ').toUpperCase());

    // Service Information Section
    addSection('Service Information');
    addField('Service Type', repair.serviceType.replace('_', ' ').toUpperCase());
    addMultilineText('Problem Description', repair.problemDescription);
    addMultilineText('Service Requirements', repair.serviceDescription);

    // Appointment Details Section
    addSection('Appointment Details');
    addField('Scheduled Date', repair.scheduledDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    addField('Scheduled Time', repair.scheduledDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
    
    // Service Location
    if (repair.serviceLocation) {
      if (repair.serviceLocation.type === 'customer_location' && repair.serviceLocation.address) {
        const address = repair.serviceLocation.address;
        const fullAddress = `${address.street || ''}, ${address.city || ''}, ${address.district || ''} ${address.postalCode || ''}`.trim();
        addField('Service Location', 'Customer Location');
        addField('Address', fullAddress);
      } else if (repair.serviceLocation.type === 'marina' && repair.serviceLocation.marinaName) {
        addField('Service Location', 'Marina');
        addField('Marina Name', repair.serviceLocation.marinaName);
        addField('Dock Number', repair.serviceLocation.dockNumber);
      } else if (repair.serviceLocation.type === 'service_center') {
        addField('Service Location', 'Our Service Center - Colombo Marina');
      }
    }

    // PAGE 2: Additional Information (Secondary Content)
    
    // Additional Requirements (Priority for Page 2)
    if (repair.customerNotes) {
      addSection('Additional Requirements');
      addMultilineText('Customer Notes', repair.customerNotes);
    }

    // Files Information Section
    if (repair.photos && repair.photos.length > 0) {
      addSection('Files Uploaded');
      addField('Number of Files', `${repair.photos.length} file(s)`);
      
      // List file names (limit to first 3 to save space)
      repair.photos.slice(0, 3).forEach((photo, index) => {
        addField(`File ${index + 1}`, photo.originalName);
      });
      if (repair.photos.length > 3) {
        addField('Additional Files', `${repair.photos.length - 3} more file(s)`);
      }
    }

    // Assigned Technician (if any)
    if (repair.assignedTechnician) {
      addSection('Assigned Technician');
      addField('Technician Name', repair.assignedTechnician.name);
      addField('Contact Email', repair.assignedTechnician.email);
    }

    // Calendly Event ID (if exists)
    if (repair.calendlyEventId) {
      addField('Calendly Event ID', repair.calendlyEventId);
    }

    // Footer - Dynamic positioning
    const footerY = Math.max(currentY + 20, pageHeight - 30);
    doc.rect(50, footerY, 500, 25).fillColor('#f9fafb').fill();
    doc.fontSize(8).fillColor('#6b7280').text(`Generated on: ${new Date().toLocaleString('en-US')}`, 55, footerY + 8);
    doc.fontSize(8).fillColor('#6b7280').text('Marine Services Center - Professional Boat Services', 55, footerY + 16);

    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};

// @desc    Update repair request (customer edit)
// @route   PUT /api/boat-repairs/:id/customer-edit
// @access  Private (Customer - owner only)
export const updateRepairByCustomer = async (req, res, next) => {
  try {
    const repair = await BoatRepair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    // Check if user is the owner
    if (repair.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this repair request'
      });
    }

    // Check if repair can be edited (until appointment date)
    if (repair.scheduledDateTime) {
      const appointmentDate = new Date(repair.scheduledDateTime);
      const today = new Date();
      
      if (appointmentDate <= today) {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit repair request. Appointment date has passed.'
        });
      }
    }

    // Check if repair is already cancelled
    if (repair.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit cancelled repair request.'
      });
    }

    const {
      serviceType,
      problemDescription,
      serviceDescription,
      boatDetails,
      photos,
      serviceLocation,
      customerNotes
    } = req.body;

    // Update allowed fields
    if (serviceType) repair.serviceType = serviceType;
    if (problemDescription) repair.problemDescription = problemDescription;
    if (serviceDescription) repair.serviceDescription = serviceDescription;
    if (boatDetails) repair.boatDetails = { ...repair.boatDetails, ...boatDetails };
    if (photos) repair.photos = photos;
    if (serviceLocation) repair.serviceLocation = { ...repair.serviceLocation, ...serviceLocation };
    if (customerNotes !== undefined) repair.customerNotes = customerNotes;

    // Note: Status update logging removed as statusUpdates field doesn't exist in model

    await repair.save();

    // Populate and return updated repair
    const updatedRepair = await BoatRepair.findById(repair._id)
      .populate('customer', 'name phone email')
      .populate('assignedTechnician', 'name email');

    res.status(200).json({
      success: true,
      message: 'Repair request updated successfully',
      data: updatedRepair
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cancel repair request (customer)
// @route   PATCH /api/boat-repairs/:id/cancel
// @access  Private (Customer - owner only)
export const cancelRepairByCustomer = async (req, res, next) => {
  try {
    const repair = await BoatRepair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    // Check if user is the owner
    if (repair.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this repair request'
      });
    }

    // Check if repair can be cancelled
    if (['completed', 'cancelled'].includes(repair.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel repair request. Service is already completed or cancelled.'
      });
    }

    // Check if cancellation is allowed (max 3 days before appointment)
    if (repair.scheduledDateTime) {
      const appointmentDate = new Date(repair.scheduledDateTime);
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      if (appointmentDate <= threeDaysFromNow) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel repair request. Cancellation must be made at least 3 days before the appointment.'
        });
      }
    }

    // Cancel Calendly appointment if exists
    if (repair.calendlyEventId) {
      try {
        // TODO: Implement Calendly cancellation API call
        // For now, we'll just log it
        console.log(`Would cancel Calendly event: ${repair.calendlyEventId}`);
        // const calendlyResponse = await cancelCalendlyEvent(repair.calendlyEventId);
      } catch (calendlyError) {
        console.error('Error cancelling Calendly appointment:', calendlyError);
        // Continue with cancellation even if Calendly fails
      }
    }

    // Update status to cancelled
    repair.status = 'cancelled';
    repair.statusUpdates.push({
      status: 'cancelled',
      updatedBy: req.user.id,
      updatedAt: new Date(),
      notes: 'Repair request cancelled by customer'
    });

    await repair.save();

    res.status(200).json({
      success: true,
      message: 'Repair request cancelled successfully',
      data: repair
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete repair request (customer)
// @route   DELETE /api/boat-repairs/:id/customer-delete
// @access  Private (Customer - owner only)
export const deleteRepairByCustomer = async (req, res, next) => {
  try {
    const repair = await BoatRepair.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    // Check if user is the owner
    if (repair.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this repair request'
      });
    }

    // Check if repair can be deleted (max 3 days before appointment)
    if (repair.scheduledDateTime) {
      const appointmentDate = new Date(repair.scheduledDateTime);
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      
      if (appointmentDate <= threeDaysFromNow) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete repair request. Deletion must be made at least 3 days before the appointment.'
        });
      }
    }
    // If no scheduled date, allow deletion

    // Cancel Calendly appointment if exists
    if (repair.calendlyEventId) {
      try {
        // TODO: Implement Calendly cancellation API call
        console.log(`Would cancel Calendly event: ${repair.calendlyEventId}`);
      } catch (calendlyError) {
        console.error('Error cancelling Calendly appointment:', calendlyError);
      }
    }

    // Delete the repair request
    await BoatRepair.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Repair request deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get repair statistics (for dashboard)
// @route   GET /api/boat-repairs/stats
// @access  Private (Employee/Admin)
export const getRepairStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      throw new Error('Not authorized to view repair statistics');
    }

    const stats = await BoatRepair.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRepairs = await BoatRepair.countDocuments();
    const pendingRepairs = await BoatRepair.countDocuments({ status: 'pending' });
    const completedRepairs = await BoatRepair.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        total: totalRepairs,
        pending: pendingRepairs,
        completed: completedRepairs,
        byStatus: stats
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==================== EMPLOYEE ENDPOINTS ====================

// @desc    Get all repair requests for employee management
// @route   GET /api/boat-repairs/employee/all
// @access  Private (Employee/Admin)
export const getAllRepairsForEmployee = async (req, res, next) => {
  try {
    // Check if user is employee or admin
    if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee or admin role required.'
      });
    }

    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get repairs with populated customer and technician data
    const repairs = await BoatRepair.find(query)
      .populate('customer', 'name email phone')
      .populate('assignedTechnician', 'name email employeeData.position')
      .populate('assignedBy', 'name email')
      .populate('receivedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await BoatRepair.countDocuments(query);

    // Add repairCosts virtual field for frontend compatibility
    const repairsWithCosts = repairs.map(repair => {
      // Convert to plain object to avoid Mongoose virtual conflicts
      const repairData = JSON.parse(JSON.stringify(repair));
      
      // Calculate repair costs
      const advancePayment = repair.payment?.amount || 0;
      const finalCost = repair.finalCost || repair.cost || 0;
      const remainingAmount = Math.max(0, finalCost - advancePayment);
      
      // Determine payment status
      let paymentStatus = 'advance_paid';
      if (repair.finalCost && repair.finalCost > 0) {
        if (repair.finalPayment?.status === 'paid') {
          paymentStatus = 'fully_paid';
        } else {
          paymentStatus = 'invoice_sent';
        }
      }
      
      // Create repairCosts object
      const repairCosts = {
        advancePayment: Number(advancePayment) || 0,
        finalCost: Number(finalCost) || 0,
        remainingAmount: Number(remainingAmount) || 0,
        paymentStatus: paymentStatus,
        invoiceSentAt: repair.finalCost ? new Date() : null,
        finalPaymentAt: repair.finalPayment?.status === 'paid' ? repair.finalPayment.paidAt : null
      };
      
      // Add repairCosts to repairData
      repairData.repairCosts = repairCosts;
      
      return repairData;
    });

    res.status(200).json({
      success: true,
      data: repairsWithCosts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get technicians list
// @route   GET /api/boat-repairs/technicians
// @access  Private (Employee/Admin)
export const getTechnicians = async (req, res, next) => {
  try {
    // Check if user is employee or admin
    if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee or admin role required.'
      });
    }

    // Get employees with technician, mechanic, or repair positions
    const technicians = await User.find({
      role: 'employee',
      'employeeData.position': { $regex: /technician|mechanic|repair/i }
    }).select('name email employeeData.position employeeData.employeeId');

    res.status(200).json({
      success: true,
      data: technicians
    });

  } catch (error) {
    console.error('Error fetching technicians:', error);
    next(error);
  }
};

// @desc    Assign technician to repair request
// @route   PUT /api/boat-repairs/:id/assign-technician
// @access  Private (Employee/Admin)
export const assignTechnician = async (req, res, next) => {
  try {
    // Check if user is employee or admin
    if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee or admin role required.'
      });
    }

    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Technician ID is required'
      });
    }

    // Verify technician exists and is valid
    const technician = await User.findById(technicianId);
    if (!technician || (technician.role !== 'employee' && technician.role !== 'admin')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid technician'
      });
    }

    // Find the repair request
    const repair = await BoatRepair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    // Update repair with technician assignment
    repair.assignedTechnician = technicianId;
    repair.assignedBy = req.user.id;
    repair.assignedAt = new Date();
    repair.status = 'assigned';

    // Add status update
    repair.statusUpdates.push({
      status: 'assigned',
      notes: `Technician assigned: ${technician.name}`
    });

    await repair.save();

    // Populate and return updated repair
    const updatedRepair = await BoatRepair.findById(repair._id)
      .populate('customer', 'name email phone')
      .populate('assignedTechnician', 'name email employeeData.position')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: updatedRepair
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Mark boat as received
// @route   PUT /api/boat-repairs/:id/mark-received
// @access  Private (Employee/Admin)
export const markBoatReceived = async (req, res, next) => {
  try {
    // Check if user is employee or admin
    if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee or admin role required.'
      });
    }

    // Find the repair request
    const repair = await BoatRepair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    // Check if boat is already received
    if (repair.boatReceivedAt) {
      return res.status(400).json({
        success: false,
        message: 'Boat has already been marked as received'
      });
    }

    // Mark boat as received
    repair.boatReceivedAt = new Date();
    repair.receivedBy = req.user.id;
    repair.status = 'in_progress';

    // Add status update
    repair.statusUpdates.push({
      status: 'in_progress',
      notes: 'Boat received and repair work started'
    });

    await repair.save();

    // Populate and return updated repair
    const updatedRepair = await BoatRepair.findById(repair._id)
      .populate('customer', 'name email phone')
      .populate('assignedTechnician', 'name email employeeData.position')
      .populate('receivedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Boat marked as received successfully',
      data: updatedRepair
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update repair status
// @route   PUT /api/boat-repairs/:id/update-status
// @access  Private (Employee/Admin)
export const updateRepairStatus = async (req, res, next) => {
  try {
    // Check if user is employee or admin
    if (!req.user || (req.user.role !== 'employee' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee or admin role required.'
      });
    }

    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'assigned', 'confirmed', 'in_progress', 'waiting_parts', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find the repair request
    const repair = await BoatRepair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair request not found'
      });
    }

    // Update status
    const oldStatus = repair.status;
    repair.status = status;

    // Add status update
    repair.statusUpdates.push({
      status: status,
      notes: notes || `Status changed from ${oldStatus} to ${status}`
    });

    await repair.save();

    // Populate and return updated repair
    const updatedRepair = await BoatRepair.findById(repair._id)
      .populate('customer', 'name email phone')
      .populate('assignedTechnician', 'name email employeeData.position')
      .populate('receivedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: updatedRepair
    });

  } catch (error) {
    next(error);
  }
};

// Migration function to fix existing repairs without advance payments
export const migrateRepairPayments = async (req, res, next) => {
  try {
    // Only allow admin to run migration
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find repairs that have no advance payment (regardless of finalCost)
    const repairsToFix = await BoatRepair.find({
      $or: [
        { 'payment.amount': { $exists: false } },
        { 'payment.amount': 0 },
        { 'payment.amount': null }
      ]
    }).populate('customer');

    console.log(`Found ${repairsToFix.length} repairs to migrate`);

    let migratedCount = 0;
    
    // Diagnostic fees based on service type
    const diagnosticFees = {
      'engine_repair': 2500,
      'hull_repair': 3000,
      'electrical': 2000,
      'maintenance': 1500,
      'emergency': 5000,
      'other': 2000
    };

    for (const repair of repairsToFix) {
      try {
        const diagnosticFee = diagnosticFees[repair.serviceType] || diagnosticFees['other'];
        
        // Set advance payment (diagnostic fee)
        repair.payment = {
          status: 'paid',
          amount: diagnosticFee,
          paidAt: repair.createdAt, // Use creation date as payment date
          paymentMethod: 'card'
        };

        // Update cost to include diagnostic fee
        repair.cost = diagnosticFee;

        await repair.save();

        // Create Payment record for advance payment
        const advancePayment = new Payment({
          paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          stripePaymentIntentId: `migrated-${repair._id}`,
          customerId: repair.customer._id,
          customerEmail: repair.customer.email,
          customerName: repair.customer.name,
          amount: diagnosticFee,
          currency: 'lkr',
          amountInCents: diagnosticFee * 100,
          status: 'succeeded',
          serviceType: 'boat_repair',
          serviceId: repair.bookingId,
          serviceDescription: `${repair.serviceType} - Advance Payment (Diagnostic Fee) - Migrated`,
          paidAt: repair.createdAt,
          paymentMethod: 'card'
        });

        await advancePayment.save();
        migratedCount++;

        console.log(`Migrated repair ${repair.bookingId} - Advance: ${diagnosticFee} LKR`);
      } catch (error) {
        console.error(`Error migrating repair ${repair.bookingId}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Migration completed. ${migratedCount} repairs migrated.`,
      migratedCount,
      totalFound: repairsToFix.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    next(error);
  }
};

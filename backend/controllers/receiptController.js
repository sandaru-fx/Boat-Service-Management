import PDFDocument from 'pdfkit';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

// Generate order receipt PDF
export const generateOrderReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order with populated data
    const order = await Order.findOne({ orderId })
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name partNumber image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get payment details
    const payment = await Payment.findOne({ paymentId: order.paymentId });

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.orderId}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Pipe PDF to response
    doc.pipe(res);

    // Helper variables
    let currentY = 50;
    const pageWidth = 595; // A4 width
    const pageHeight = 842; // A4 height
    const contentWidth = pageWidth - 100; // minus margins
    let isFirstPage = true;

    // Helper function to add text with wrapping
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 12, color = 'black', align = 'left', width = contentWidth } = options;
      doc.fontSize(fontSize).fillColor(color);
      
      if (align === 'center') {
        doc.text(text, x + (contentWidth - doc.widthOfString(text)) / 2, y, { width });
      } else if (align === 'right') {
        doc.text(text, x + contentWidth - doc.widthOfString(text), y, { width });
      } else {
        doc.text(text, x, y, { width });
      }
      
      return doc.heightOfString(text, { width });
    };

    // Helper function to add line
    const addLine = (y) => {
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).stroke();
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 50) => {
      if (currentY + requiredSpace > pageHeight - 50) {
        doc.addPage();
        currentY = 50;
        isFirstPage = false;
        return true;
      }
      return false;
    };

    // PAGE 1: Header, Order Info, Customer Info, Shipping Address
    // Header
    doc.fontSize(24).fillColor('#2c3e50').text('MARINE SERVICE CENTER', 50, currentY, { align: 'center' });
    currentY += 35;
    
    doc.fontSize(16).fillColor('#6c757d').text('Order Receipt', 50, currentY, { align: 'center' });
    currentY += 30;

    // Order Information
    doc.fontSize(14).fillColor('#2c3e50').text('ORDER INFORMATION', 50, currentY);
    currentY += 20;

    const orderInfo = [
      ['Order ID:', order.orderId],
      ['Order Date:', new Date(order.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })],
      ['Status:', order.status.charAt(0).toUpperCase() + order.status.slice(1)],
      ['Payment Status:', order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)]
    ];

    orderInfo.forEach(([label, value]) => {
      doc.fontSize(10).fillColor('#495057').text(label, 50, currentY);
      doc.text(value, 150, currentY);
      currentY += 15;
    });

    currentY += 20;
    addLine(currentY);
    currentY += 20;

    // Customer Information
    doc.fontSize(14).fillColor('#2c3e50').text('CUSTOMER INFORMATION', 50, currentY);
    currentY += 20;

    const customerInfo = [
      ['Name:', order.customerName],
      ['Email:', order.customerEmail],
      ['Phone:', order.customerPhone || 'Not provided']
    ];

    customerInfo.forEach(([label, value]) => {
      doc.fontSize(10).fillColor('#495057').text(label, 50, currentY);
      doc.text(value, 150, currentY);
      currentY += 15;
    });

    currentY += 20;
    addLine(currentY);
    currentY += 20;

    // Shipping Address
    doc.fontSize(14).fillColor('#2c3e50').text('SHIPPING ADDRESS', 50, currentY);
    currentY += 20;

    const address = order.shippingAddress;
    const addressLines = [
      address.street,
      `${address.city}, ${address.district}`,
      address.postalCode ? address.postalCode : '',
      'Sri Lanka'
    ].filter(line => line.trim());

    addressLines.forEach(line => {
      doc.fontSize(10).fillColor('#495057').text(line, 50, currentY);
      currentY += 15;
    });

    currentY += 20;
    addLine(currentY);
    currentY += 20;

    // Force new page for items and summary
    doc.addPage();
    currentY = 50;
    isFirstPage = false;

    // PAGE 2: Order Items, Summary, Payment Info, Footer
    // Order Items
    doc.fontSize(14).fillColor('#2c3e50').text('ORDER ITEMS', 50, currentY);
    currentY += 20;

    // Table headers
    doc.fontSize(10).fillColor('#ffffff');
    
    // Header background
    doc.rect(50, currentY, contentWidth, 25).fill('#20b2aa');
    
    // Header text
    doc.fillColor('#ffffff').text('Item', 60, currentY + 8);
    doc.text('Part Number', 200, currentY + 8);
    doc.text('Qty', 320, currentY + 8);
    doc.text('Price', 360, currentY + 8);
    doc.text('Total', 420, currentY + 8);
    
    currentY += 30;

    // Table rows with better spacing
    order.items.forEach((item, index) => {
      const rowY = currentY;
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, rowY, contentWidth, 25).fill('#f8f9fa');
      }
      
      // Row content
      doc.fillColor('#2c3e50').fontSize(10);
      doc.text(item.productName, 60, rowY + 8, { width: 130 });
      doc.text(item.partNumber, 200, rowY + 8, { width: 110 });
      doc.text(item.quantity.toString(), 320, rowY + 8);
      doc.text(`Rs. ${item.unitPrice.toFixed(2)}`, 360, rowY + 8);
      doc.text(`Rs. ${item.totalPrice.toFixed(2)}`, 420, rowY + 8);
      
      currentY += 25;
    });

    // Table bottom border
    addLine(currentY);
    currentY += 30;

    // Order Summary
    doc.fontSize(14).fillColor('#2c3e50').text('ORDER SUMMARY', 50, currentY);
    currentY += 20;

    const summaryItems = [
      ['Subtotal:', `Rs. ${order.subtotal.toFixed(2)}`],
      ['Shipping:', 'Free'],
      ['Total:', `Rs. ${order.totalAmount.toFixed(2)}`]
    ];

    summaryItems.forEach(([label, value]) => {
      doc.fontSize(11).fillColor('#495057').text(label, 350, currentY);
      doc.text(value, 450, currentY);
      currentY += 18;
    });

    // Highlight total
    doc.fontSize(13).fillColor('#2c3e50').text('Total:', 350, currentY);
    doc.fontSize(13).fillColor('#28a745').text(`Rs. ${order.totalAmount.toFixed(2)}`, 450, currentY);
    currentY += 30;

    // Payment Information
    if (payment) {
      addLine(currentY);
      currentY += 20;
      
      doc.fontSize(14).fillColor('#2c3e50').text('PAYMENT INFORMATION', 50, currentY);
      currentY += 20;

      const paymentInfo = [
        ['Payment ID:', payment.paymentId],
        ['Payment Method:', 'Credit Card (Stripe)'],
        ['Payment Date:', payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Pending'],
        ['Amount Paid:', `Rs. ${payment.amount.toFixed(2)}`]
      ];

      paymentInfo.forEach(([label, value]) => {
        doc.fontSize(10).fillColor('#495057').text(label, 50, currentY);
        doc.text(value, 200, currentY);
        currentY += 18;
      });
    }

    currentY += 40;

    // Footer
    addLine(currentY);
    currentY += 20;

    doc.fontSize(11).fillColor('#6c757d').text('Thank you for your business!', 50, currentY, { align: 'center' });
    currentY += 18;
    
    doc.text('For any inquiries, please contact us at:', 50, currentY, { align: 'center' });
    currentY += 18;
    
    doc.text('Email: info@marineservice.lk | Phone: +94 11 234 5678', 50, currentY, { align: 'center' });
    currentY += 18;
    
    doc.text('Colombo Marina, Sri Lanka', 50, currentY, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: error.message
    });
  }
};

import Order from '../models/Order.js';
import Product from '../models/productModel.js';
import Payment from '../models/Payment.js';
import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();
    
    const emailHtml = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: #007bff; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .total { font-weight: bold; font-size: 1.2em; color: #28a745; }
          .footer { background: #6c757d; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Marine Service Center</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your order!</h2>
            <p>Dear ${order.customerName},</p>
            <p>Your order has been confirmed and is being processed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              
              <h4>Items Ordered:</h4>
              ${order.items.map(item => `
                <div class="item">
                  <span>${item.productName} (${item.partNumber}) x ${item.quantity}</span>
                  <span>Rs. ${item.totalPrice}</span>
                </div>
              `).join('')}
              
              <div class="item total">
                <span>Total Amount:</span>
                <span>Rs. ${order.totalAmount}</span>
              </div>
            </div>
            
            <p>We will notify you when your order is ready for pickup or delivery.</p>
            <p>If you have any questions, please contact us:</p>
            <ul>
              <li>Email: info@marineservice.lk</li>
              <li>Phone: +94 11 234 5678</li>
              <li>Address: Colombo Marina, Sri Lanka</li>
            </ul>
            
            <p>Thank you for choosing Marine Service Center!</p>
          </div>
          
          <div class="footer">
            <p>Marine Service Center | Colombo Marina, Sri Lanka</p>
            <p>Email: info@marineservice.lk | Phone: +94 11 234 5678</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderId} - Marine Service Center`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent for order ${order.orderId}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (orderId, status, notes) => {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    const transporter = createTransporter();
    
    const emailHtml = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .status-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
          .footer { background: #6c757d; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
            <p>Marine Service Center</p>
          </div>
          
          <div class="content">
            <h2>Order Status Update</h2>
            <p>Dear ${order.customerName},</p>
            
            <div class="status-box">
              <h3>Order ID: ${order.orderId}</h3>
              <p><strong>New Status:</strong> ${status}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p>We will continue to keep you updated on your order progress.</p>
            <p>If you have any questions, please contact us:</p>
            <ul>
              <li>Email: info@marineservice.lk</li>
              <li>Phone: +94 11 234 5678</li>
              <li>Address: Colombo Marina, Sri Lanka</li>
            </ul>

            <p>Thank you for choosing Marine Service Center!</p>
          </div>
          
          <div class="footer">
            <p>Marine Service Center | Colombo Marina, Sri Lanka</p>
            <p>Email: info@marineservice.lk | Phone: +94 11 234 5678</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerEmail,
      subject: `Order Status Update - ${order.orderId} - Marine Service Center`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent for order ${orderId}`);
  } catch (error) {
    console.error('Error sending order status update email:', error);
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress: originalShippingAddress,
      customerEmail,
      customerName,
      customerPhone,
      customerNotes,
      deliveryMethod = 'delivery'
    } = req.body;

    let shippingAddress = originalShippingAddress;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // Only require shipping address for delivery orders
    if (deliveryMethod === 'delivery' && (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.district)) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required for delivery orders'
      });
    }

    // Set default store address for pickup orders
    if (deliveryMethod === 'pickup') {
      shippingAddress = {
        street: 'Colombo Marina, Store Location',
        city: 'Colombo',
        district: 'Colombo',
        postalCode: '00100'
      };
    }

    if (!customerEmail || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Customer email and name are required'
      });
    }

    // Validate stock availability and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productName}`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.productName}. Available: ${product.quantity}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        partNumber: product.partNumber,
        image: product.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal
      });
    }

    const shippingFee = 0; // Free shipping for now
    const totalAmount = subtotal + shippingFee;

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order
    console.log('Creating order for user:', req.user.id, 'Email:', customerEmail);
    const order = new Order({
      orderId,
      customerId: req.user.id,
      customerEmail,
      customerName,
      customerPhone,
      items: validatedItems,
      subtotal,
      shippingFee,
      totalAmount,
      shippingAddress,
      deliveryMethod,
      customerNotes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        items: order.items,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name partNumber image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Only authenticated users can view their orders
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view orders'
      });
    }

    let query = { customerId: req.user.id };
    console.log('Fetching orders for user:', req.user.id);

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.productId', 'name partNumber image')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log('Found orders:', orders.length);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user orders',
      error: error.message
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;
    
    // Set timestamp based on status
    const now = new Date();
    switch (status) {
      case 'confirmed':
        order.confirmedAt = now;
        break;
      case 'shipped':
        order.shippedAt = now;
        break;
      case 'delivered':
        order.deliveredAt = now;
        break;
      case 'cancelled':
        order.cancelledAt = now;
        break;
    }

    // Add to status history
    order.statusHistory.push({
      status,
      notes: notes || '',
      updatedBy: req.user?.id
    });

    await order.save();

    // Send status update email
    try {
      await sendOrderStatusUpdateEmail(order.orderId, status, notes);
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Don't fail the update if email fails
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: now
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Process order payment (link payment to order)
export const processOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Link payment to order
    order.paymentId = paymentId;
    order.paymentStatus = payment.status === 'succeeded' ? 'paid' : 'pending';
    
    if (payment.status === 'succeeded') {
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      
      // Update inventory
      await updateInventory(order.items);
      
      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the order if email fails
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status
      }
    });

  } catch (error) {
    console.error('Error processing order payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order payment',
      error: error.message
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search, customer } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status && status !== 'all') query.status = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
    
    // Search functionality
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Customer filter
    if (customer && customer !== 'all') {
      query.customerName = customer;
    }

    console.log('getAllOrders query:', query);
    console.log('getAllOrders params:', { page, limit, status, paymentStatus, search, customer });

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name partNumber image')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);
    console.log('getAllOrders found:', orders.length, 'orders, total:', total);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

// Get order statistics (admin only)
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    
    // Get additional stats
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        statusCounts,
        paymentStatusCounts
      }
    });

  } catch (error) {
    console.error('Error getting order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics',
      error: error.message
    });
  }
};

// Helper function to update inventory
const updateInventory = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { quantity: -item.quantity } }
    );
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered or already cancelled order'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      notes: reason || 'Order cancelled by customer',
      updatedBy: req.user?.id
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

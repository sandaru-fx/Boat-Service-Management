import nodemailer from 'nodemailer';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

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
export const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
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

    // Create email transporter
    const transporter = createTransporter();

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Marine Service Center</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #20b2aa; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .order-info { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #20b2aa; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #20b2aa; color: white; }
          .total { font-weight: bold; font-size: 1.1em; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Marine Service Center</h1>
            <h2>Order Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Dear ${order.customerName},</p>
            
            <p>Thank you for your order! We have received your order and payment has been confirmed.</p>
            
            <div class="order-info">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
            </div>

            <div class="order-info">
              <h3>Shipping Address</h3>
              <p>${order.shippingAddress.street}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.district}</p>
              ${order.shippingAddress.postalCode ? `<p>${order.shippingAddress.postalCode}</p>` : ''}
              <p>Sri Lanka</p>
            </div>

            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Part Number</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.partNumber}</td>
                    <td>${item.quantity}</td>
                    <td>Rs. ${item.unitPrice.toFixed(2)}</td>
                    <td>Rs. ${item.totalPrice.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="order-info">
              <h3>Order Summary</h3>
              <p>Subtotal: Rs. ${order.subtotal.toFixed(2)}</p>
              <p>Shipping: Free</p>
              <p class="total">Total: Rs. ${order.totalAmount.toFixed(2)}</p>
            </div>

            ${payment ? `
              <div class="order-info">
                <h3>Payment Information</h3>
                <p><strong>Payment ID:</strong> ${payment.paymentId}</p>
                <p><strong>Payment Method:</strong> Credit Card (Stripe)</p>
                <p><strong>Amount Paid:</strong> Rs. ${payment.amount.toFixed(2)}</p>
                <p><strong>Payment Date:</strong> ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Pending'}</p>
              </div>
            ` : ''}

            <h3>What's Next?</h3>
            <ol>
              <li><strong>Order Confirmation:</strong> Your order has been confirmed and is being processed.</li>
              <li><strong>Processing:</strong> We will prepare your items for shipping within 1-2 business days.</li>
              <li><strong>Shipping:</strong> Your order will be shipped within 2-3 business days.</li>
              <li><strong>Delivery:</strong> You will receive your items within 3-5 business days.</li>
            </ol>

            <p>You can track your order status by contacting us or visiting our website.</p>
            
            <p>If you have any questions, please don't hesitate to contact us:</p>
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

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderId} - Marine Service Center`,
      html: emailHtml
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation email',
      error: error.message
    });
  }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (orderId, newStatus, notes = '') => {
  try {
    // Get order details
    const order = await Order.findOne({ orderId })
      .populate('customerId', 'name email phone');

    if (!order) {
      console.error('Order not found for status update email:', orderId);
      return;
    }

    // Create email transporter
    const transporter = createTransporter();

    // Email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update - Marine Service Center</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #20b2aa; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #20b2aa; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Marine Service Center</h1>
            <h2>Order Status Update</h2>
          </div>
          
          <div class="content">
            <p>Dear ${order.customerName},</p>
            
            <p>Your order status has been updated.</p>
            
            <div class="status-box">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>New Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>

            <p>You can track your order status by contacting us or visiting our website.</p>
            
            <p>If you have any questions, please don't hesitate to contact us:</p>
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

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerEmail,
      subject: `Order Status Update - ${order.orderId} - Marine Service Center`,
      html: emailHtml
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent for order ${orderId}`);

  } catch (error) {
    console.error('Error sending order status update email:', error);
  }
};

import nodemailer from 'nodemailer';
import { passwordResetEmailTemplate, passwordChangedEmailTemplate } from '../utils/emailTemplates.js';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = passwordResetEmailTemplate(resetToken, userName);
    
    const mailOptions = {
      from: `"Boat Service Management" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send password changed confirmation email
export const sendPasswordChangedEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = passwordChangedEmailTemplate(userName);
    
    const mailOptions = {
      from: `"Boat Service Management" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password changed email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, error: error.message };
  }
};

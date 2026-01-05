import User from '../models/userModel.js';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendPasswordChangedEmail, testEmailConfiguration } from '../middleware/email.js';

// Forgot password - send reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);
    
    if (!emailResult.success) {
      // Reset the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, password, passwordConfirm } = req.body;
    
    // Validate input
    if (!token || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Token, password, and password confirmation are required'
      });
    }
    
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    // Hash the token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }
    
    // Update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();
    
    await user.save();
    
    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.name);
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password for logged-in users
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    
    // Validate input
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required'
      });
    }
    
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.passwordChangedAt = Date.now();
    
    await user.save();
    
    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.name);
    
    res.status(200).json({
      success: true,
      message: 'Password has been changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Test email configuration (admin only)
export const testEmail = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    const result = await testEmailConfiguration();
    
    res.status(200).json({
      success: result.success,
      message: result.success ? 'Email configuration is working' : 'Email configuration error',
      details: result
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

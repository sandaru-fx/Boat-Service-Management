import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// User Schema - defines how user data is stored
const userSchema = new mongoose.Schema({
  // Basic Information (for all roles)
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  // Sri Lankan National ID (both old and new format)
  nic: {
    type: String,
    required: [true, 'NIC is required'],
    unique: true,
    trim: true,
    match: [/^([0-9]{9}[vVxX]|[0-9]{12})$/, 'Please enter a valid Sri Lankan NIC (old: 9 digits + V/X, new: 12 digits)']
  },

  // Password (hashed)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },

  // Password confirmation (not stored, only for validation)
  passwordConfirm: {
    type: String,
    required: false, // Not required for existing users
    validate: {
      validator: function(el) {
        // Only validate if passwordConfirm is provided
        if (!el) return true;
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },

  // User Role
  role: {
    type: String,
    enum: ['customer', 'employee', 'admin'],
    default: 'customer'
  },

  // Blocking status
  isBlocked: {
    type: Boolean,
    default: false
  },

  // Address (separate fields as requested) - for customers and employees
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      match: [/^[0-9]{5}$/, 'Please enter a valid Sri Lankan postal code']
    }
  },

  // Phone Number
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid Sri Lankan phone number']
  },

  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Login Attempts (for lockout)
  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: {
    type: Date
  },

  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  twoFactorSecret: {
    type: String,
    select: false
  },

  // Employee-specific data (only for employees and admins)
  employeeData: {
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allows null for customers
      trim: true
    },
    hireDate: {
      type: Date
    },
    dateOfBirth: {
      type: Date
    },
    position: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please enter a valid Sri Lankan phone number']
      },
      relationship: {
        type: String,
        trim: true
      }
    }
  },

  // Admin-specific data (only for admins)
  adminData: {
    adminLevel: {
      type: String,
      enum: ['super', 'regular'],
      default: 'regular'
    },
    permissions: [{
      type: String,
      enum: [
        'user_manage',      // Manage users (create, update, delete)
        'payment_manage',   // Process payments and refunds
        'inventory_manage', // Manage spare parts inventory
        'booking_manage',   // Manage boat ride bookings
        'repair_manage',    // Manage repair services
        'sales_manage',     // Manage boat sales
        'reports_view',     // View financial reports
        'system_admin'      // Full system access
      ]
    }],
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },

  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  passwordChangedAt: Date
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    this.password = await bcrypt.hash(this.password, 12);
    // Remove passwordConfirm from database (it's only for validation)
    this.passwordConfirm = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin' && this.adminData && this.adminData.permissions) {
    return this.adminData.permissions.includes(permission) || 
           this.adminData.permissions.includes('system_admin');
  }
  return false;
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Method to check if user is employee
userSchema.methods.isEmployee = function() {
  return this.role === 'employee' || this.role === 'admin';
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

export default User;

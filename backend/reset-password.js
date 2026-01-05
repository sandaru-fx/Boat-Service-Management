import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Reset password function
const resetPassword = async () => {
  try {
    await connectDB();
    
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      role: String
    }));
    
    // Find your account
    const user = await User.findById('68d41e856259e0527acd2f1a');
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Set new password and change role to admin
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    user.password = hashedPassword;
    user.role = 'admin';
    user.adminData = {
      adminLevel: 'regular',
      permissions: [],
      lastLogin: new Date()
    };
    
    await user.save();
    
    console.log('✅ Password reset successful!');
    console.log('📧 Email:', user.email);
    console.log('🔑 New Password:', newPassword);
    console.log('👑 Role:', user.role);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetPassword();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    nic: '123456789V',
    phone: '0712345678',
    address: {
      street: '123 Admin St',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '10100'
    },
    adminData: {
      adminLevel: 'super',
      permissions: ['system_admin']
    }
  },
  {
    name: 'Employee User',
    email: 'employee@demo.com',
    password: 'password123',
    role: 'employee',
    nic: '987654321V',
    phone: '0771234567',
    address: {
      street: '456 Employee Rd',
      city: 'Kandy',
      district: 'Kandy',
      postalCode: '20000'
    },
    employeeData: {
      employeeId: 'EMP001',
      position: 'Senior Mechanic'
    }
  },
  {
    name: 'Customer User',
    email: 'customer@demo.com',
    password: 'password123',
    role: 'customer',
    nic: '456123789V',
    phone: '0701234567',
    address: {
      street: '789 Customer Ln',
      city: 'Galle',
      district: 'Galle',
      postalCode: '80000'
    }
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  await connectDB();

  try {
    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`⚠️ User ${user.email} already exists`);
        
        // Update password if exists to ensure demo login works
        existingUser.password = user.password;
        await existingUser.save();
        console.log(`🔄 Updated password for ${user.email}`);
      } else {
        await User.create(user);
        console.log(`✅ Created user ${user.email}`);
      }
    }
    console.log('🎉 Demo users seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

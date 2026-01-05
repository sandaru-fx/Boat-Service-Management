import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BoatRide from './models/boatRideModel.js';
import User from './models/userModel.js';

dotenv.config();

const sampleBoatRides = [
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerPhone: "0771234567",
    rideDate: new Date('2024-12-15'),
    rideTime: "14:00",
    duration: 2,
    passengers: 4,
    boatType: "Speedboat",
    journeyType: "Sunset Tour",
    basePrice: 200,
    passengerPrice: 50,
    totalPrice: 400,
    paymentStatus: "paid",
    paymentMethod: "stripe",
    status: "completed",
    specialRequests: "Anniversary celebration",
    createdAt: new Date('2024-10-10')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "0772345678",
    rideDate: new Date('2024-12-16'),
    rideTime: "10:00",
    duration: 3,
    passengers: 6,
    boatType: "Yacht",
    journeyType: "Adventure Tour",
    basePrice: 300,
    passengerPrice: 75,
    totalPrice: 750,
    paymentStatus: "paid",
    paymentMethod: "manual",
    status: "completed",
    specialRequests: "Family trip",
    createdAt: new Date('2024-10-11')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Mike Wilson",
    customerEmail: "mike@example.com",
    customerPhone: "0773456789",
    rideDate: new Date('2024-12-17'),
    rideTime: "16:00",
    duration: 1,
    passengers: 2,
    boatType: "Catamaran",
    journeyType: "Romantic Cruise",
    basePrice: 150,
    passengerPrice: 40,
    totalPrice: 230,
    paymentStatus: "paid",
    paymentMethod: "cash",
    status: "completed",
    specialRequests: "Proposal setup",
    createdAt: new Date('2024-10-12')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Emily Brown",
    customerEmail: "emily@example.com",
    customerPhone: "0774567890",
    rideDate: new Date('2024-12-18'),
    rideTime: "09:00",
    duration: 4,
    passengers: 8,
    boatType: "Fishing Boat",
    journeyType: "Deep Sea Fishing",
    basePrice: 400,
    passengerPrice: 60,
    totalPrice: 880,
    paymentStatus: "paid",
    paymentMethod: "stripe",
    status: "completed",
    specialRequests: "Fishing equipment needed",
    createdAt: new Date('2024-10-13')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "David Lee",
    customerEmail: "david@example.com",
    customerPhone: "0775678901",
    rideDate: new Date('2024-12-19'),
    rideTime: "12:00",
    duration: 2,
    passengers: 3,
    boatType: "Speedboat",
    journeyType: "Island Hopping",
    basePrice: 200,
    passengerPrice: 50,
    totalPrice: 350,
    paymentStatus: "pending",
    paymentMethod: "manual",
    status: "confirmed",
    specialRequests: "Snorkeling gear",
    createdAt: new Date('2024-10-14')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Lisa Davis",
    customerEmail: "lisa@example.com",
    customerPhone: "0776789012",
    rideDate: new Date('2024-12-20'),
    rideTime: "15:00",
    duration: 3,
    passengers: 5,
    boatType: "Yacht",
    journeyType: "Family Tour",
    basePrice: 300,
    passengerPrice: 75,
    totalPrice: 675,
    paymentStatus: "paid",
    paymentMethod: "stripe",
    status: "completed",
    specialRequests: "Children friendly",
    createdAt: new Date('2024-10-15')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Tom Anderson",
    customerEmail: "tom@example.com",
    customerPhone: "0777890123",
    rideDate: new Date('2024-12-21'),
    rideTime: "11:00",
    duration: 2,
    passengers: 4,
    boatType: "Catamaran",
    journeyType: "Snorkeling Adventure",
    basePrice: 150,
    passengerPrice: 40,
    totalPrice: 310,
    paymentStatus: "paid",
    paymentMethod: "manual",
    status: "completed",
    specialRequests: "Snorkeling equipment",
    createdAt: new Date('2024-10-16')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Anna Taylor",
    customerEmail: "anna@example.com",
    customerPhone: "0778901234",
    rideDate: new Date('2024-12-22'),
    rideTime: "17:00",
    duration: 1,
    passengers: 2,
    boatType: "Jet Ski",
    journeyType: "Sunset Tour",
    basePrice: 100,
    passengerPrice: 30,
    totalPrice: 160,
    paymentStatus: "paid",
    paymentMethod: "cash",
    status: "completed",
    specialRequests: "Romantic setup",
    createdAt: new Date('2024-10-17')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Chris Miller",
    customerEmail: "chris@example.com",
    customerPhone: "0779012345",
    rideDate: new Date('2024-12-23'),
    rideTime: "08:00",
    duration: 6,
    passengers: 10,
    boatType: "Fishing Boat",
    journeyType: "Deep Sea Fishing",
    basePrice: 400,
    passengerPrice: 60,
    totalPrice: 1000,
    paymentStatus: "paid",
    paymentMethod: "stripe",
    status: "completed",
    specialRequests: "Full day fishing",
    createdAt: new Date('2024-10-18')
  },
  {
    customerId: new mongoose.Types.ObjectId(),
    customerName: "Maria Garcia",
    customerEmail: "maria@example.com",
    customerPhone: "0770123456",
    rideDate: new Date('2024-12-24'),
    rideTime: "13:00",
    duration: 2,
    passengers: 6,
    boatType: "Speedboat",
    journeyType: "Adventure Tour",
    basePrice: 200,
    passengerPrice: 50,
    totalPrice: 500,
    paymentStatus: "pending",
    paymentMethod: "manual",
    status: "pending",
    specialRequests: "Group booking",
    createdAt: new Date('2024-10-19')
  }
];

async function seedBoatRides() {
  try {
    await mongoose.connect('mongodb://localhost:27017/boat-service-management');
    console.log('Connected to MongoDB');

    // Clear existing boat rides
    await BoatRide.deleteMany({});
    console.log('Cleared existing boat rides');

    // Insert sample boat rides
    await BoatRide.insertMany(sampleBoatRides);
    console.log(`Inserted ${sampleBoatRides.length} sample boat rides`);

    console.log('Boat rides seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding boat rides:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedBoatRides();

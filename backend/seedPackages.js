import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BoatPackage from './models/boatPackage.model.js';

dotenv.config();

const samplePackages = [
  {
    packageName: "Sunset Harbor Cruise",
    packageType: "Family Package",
    description: "Enjoy a peaceful 2-hour cruise around the harbor during golden hour. Perfect for families with children. Includes light snacks and beverages.",
    maxCapacity: 12,
    basePrice: 150,
    duration: "2 Hours",
    destinations: ["Marina Bay", "Harbor View"],
    cateringOptions: ["Light Snacks"],
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    isActive: true,
    status: "Available"
  },
  {
    packageName: "Deep Sea Fishing Adventure",
    packageType: "Fishing Trip",
    description: "Full day fishing expedition for experienced anglers. All equipment provided. Catch and release policy. Lunch included.",
    maxCapacity: 8,
    basePrice: 300,
    duration: "Full Day (8 Hours)",
    destinations: ["Ocean Adventure"],
    cateringOptions: ["Full Meal"],
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    isActive: true,
    status: "Available"
  },
  {
    packageName: "Luxury Yacht Experience",
    packageType: "Luxury Experience",
    description: "Premium yacht charter with professional crew. Perfect for special occasions, corporate events, or romantic getaways.",
    maxCapacity: 20,
    basePrice: 800,
    duration: "Half Day (4 Hours)",
    destinations: ["Marina Bay", "Sunset Dock", "Ocean Adventure"],
    cateringOptions: ["Premium Dining", "BBQ Package"],
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    isActive: true,
    status: "Available"
  },
  {
    packageName: "Island Hopping Tour",
    packageType: "Group Trip",
    description: "Visit multiple islands in one day. Great for groups and team building activities. Snorkeling equipment provided.",
    maxCapacity: 15,
    basePrice: 250,
    duration: "Full Day (8 Hours)",
    destinations: ["Island Hopping", "Marina Bay"],
    cateringOptions: ["BBQ Package", "Light Snacks"],
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    isActive: true,
    status: "Available"
  },
  {
    packageName: "Morning Wildlife Watch",
    packageType: "Family Package",
    description: "Early morning tour to spot dolphins, whales, and seabirds. Educational experience for children. Binoculars provided.",
    maxCapacity: 10,
    basePrice: 120,
    duration: "4 Hours",
    destinations: ["Ocean Adventure", "Harbor View"],
    cateringOptions: ["Light Snacks"],
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    isActive: true,
    status: "Available"
  },
  {
    packageName: "Corporate Team Building",
    packageType: "Event Package",
    description: "Customized team building activities on water. Includes team challenges, problem-solving exercises, and group meals.",
    maxCapacity: 25,
    basePrice: 400,
    duration: "Full Day (8 Hours)",
    destinations: ["Marina Bay", "Sunset Dock"],
    cateringOptions: ["Full Meal", "BBQ Package"],
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    isActive: true,
    status: "Available"
  }
];

const seedPackages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing packages
    await BoatPackage.deleteMany({});
    console.log('🗑️ Cleared existing packages');

    // Insert sample packages
    const insertedPackages = await BoatPackage.insertMany(samplePackages);
    console.log(`✅ Inserted ${insertedPackages.length} sample packages`);

    // Display inserted packages
    console.log('\n📦 Sample packages created:');
    insertedPackages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.packageName} - $${pkg.basePrice} (${pkg.maxCapacity} people)`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPackages();
}

export default seedPackages;

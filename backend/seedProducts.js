import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/productModel.js';

dotenv.config();

const sampleProducts = [
  {
    name: "Marine Engine Oil 15W-40",
    price: 2500,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "MEO-15W40-1L",
    company: "MarineLube",
    category: "Engine Parts",
    quantity: 50
  },
  {
    name: "Propeller 3-Blade 14x12",
    price: 15000,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    partNumber: "PROP-3B-14x12",
    company: "AquaProp",
    category: "Propulsion",
    quantity: 8
  },
  {
    name: "Bilge Pump 12V 1000GPH",
    price: 8500,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "BP-12V-1000",
    company: "MarineTech",
    category: "Electrical",
    quantity: 15
  },
  {
    name: "Anchor Chain 1/4 inch 100ft",
    price: 12000,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    partNumber: "AC-1/4-100",
    company: "AnchorPro",
    category: "Anchoring",
    quantity: 12
  },
  {
    name: "Navigation Light Set LED",
    price: 3500,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "NL-LED-SET",
    company: "NavLight",
    category: "Electrical",
    quantity: 25
  },
  {
    name: "Fuel Filter Element",
    price: 1800,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "FF-ELEM-001",
    company: "FuelTech",
    category: "Engine Parts",
    quantity: 30
  },
  {
    name: "Steering Cable 12ft",
    price: 4500,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    partNumber: "SC-12FT",
    company: "SteerPro",
    category: "Steering",
    quantity: 10
  },
  {
    name: "Battery 12V 100Ah Deep Cycle",
    price: 18000,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "BAT-12V-100AH",
    company: "PowerMarine",
    category: "Electrical",
    quantity: 6
  },
  {
    name: "Hull Paint White 1L",
    price: 3200,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "HP-WHT-1L",
    company: "MarinePaint",
    category: "Maintenance",
    quantity: 20
  },
  {
    name: "VHF Radio Handheld",
    price: 15000,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "VHF-HH-001",
    company: "CommTech",
    category: "Communication",
    quantity: 8
  },
  {
    name: "Life Jacket Adult Type II",
    price: 2500,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "LJ-ADT-II",
    company: "SafetyFirst",
    category: "Safety",
    quantity: 40
  },
  {
    name: "Fender 6x20 inch",
    price: 1800,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    partNumber: "FND-6x20",
    company: "ProtectMarine",
    category: "Docking",
    quantity: 35
  },
  {
    name: "GPS Chartplotter 7 inch",
    price: 45000,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "GPS-7IN",
    company: "NavTech",
    category: "Navigation",
    quantity: 4
  },
  {
    name: "Water Pump Impeller",
    price: 2200,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
    partNumber: "WP-IMP-001",
    company: "PumpTech",
    category: "Engine Parts",
    quantity: 18
  },
  {
    name: "Deck Cleat 8 inch",
    price: 1200,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    partNumber: "DC-8IN",
    company: "DeckHardware",
    category: "Hardware",
    quantity: 22
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${insertedProducts.length} sample products`);

    // Display inserted products
    console.log('\n🔧 Sample products created:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - LKR ${product.price} (${product.quantity} in stock)`);
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
  seedProducts();
}

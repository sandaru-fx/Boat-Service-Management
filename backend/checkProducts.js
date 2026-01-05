import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/productModel.js';

dotenv.config();

const checkProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count total products
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}`);

    // Get all products
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    if (products.length > 0) {
      console.log('\n🔧 Products in database:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - LKR ${product.price} (${product.quantity} in stock) - Category: ${product.category}`);
      });
    } else {
      console.log('\n❌ No products found in database');
    }

    // Check database name
    console.log(`\n🗄️ Database name: ${mongoose.connection.db.databaseName}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking products:', error);
    process.exit(1);
  }
};

checkProducts();

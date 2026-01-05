import mongoose from "mongoose";

const boatPackageSchema = new mongoose.Schema(
  {
    // Basic Package Information
    packageName: {
      type: String,
      required: true,
    },
    packageType: {
      type: String,
      required: true,
      enum: ['Group Trip', 'Family Package', 'Luxury Experience', 'Fishing Trip', 'Event Package', 'Individual Experience']
    },
    description: {
      type: String,
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    
    // Package Details
    duration: {
      type: String,
      required: true,
      enum: ['30 Minutes', '2 Hours', '4 Hours', 'Half Day (4 Hours)', 'Full Day (8 Hours)', 'Multi-Day']
    },
    destinations: [{
      type: String,
      enum: ['Marina Bay', 'Harbor View', 'Sunset Dock', 'Ocean Adventure', 'Island Hopping', 'Coastal Waters']
    }],
    
    // Additional Services
    cateringOptions: [{
      type: String,
      enum: ['Water Bottle', 'Light Snacks', 'Full Meal', 'BBQ Package', 'Premium Dining']
    }],
    
    // Media
    imageUrl: {
      type: String,
      default: ''
    },
    
    // Status Management
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['Available', 'Maintenance', 'Out of Service'],
      default: 'Available'
    },
    
    // Employee Management
    createdBy: {
      type: String,
      default: 'Employee'
    },
    lastUpdatedBy: {
      type: String,
      default: 'Employee'
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const BoatPackage = mongoose.model("BoatPackage", boatPackageSchema);

export default BoatPackage;

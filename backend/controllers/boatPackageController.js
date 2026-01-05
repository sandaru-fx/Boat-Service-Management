import mongoose from "mongoose";
import BoatPackage from "../models/boatPackage.model.js";

// Get all boat packages
export const getBoatPackages = async (req, res) => {
	try {
		const packages = await BoatPackage.find({}).sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: packages });
	} catch (error) {
		console.log("Error in fetching boat packages:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Get active boat packages only (for customers)
export const getActiveBoatPackages = async (req, res) => {
	try {
		const packages = await BoatPackage.find({ 
			isActive: true, 
			status: 'Available' 
		}).sort({ createdAt: -1 });
		res.status(200).json({ success: true, data: packages });
	} catch (error) {
		console.log("Error in fetching active boat packages:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Create new boat package (Employee only)
export const createBoatPackage = async (req, res) => {
	console.log('🎯 CREATE BOAT PACKAGE REQUEST RECEIVED');
	console.log('Request body:', req.body);
	
	const packageData = req.body;

	// Validate required fields
	const requiredFields = ['packageName', 'packageType', 'description', 'maxCapacity', 'basePrice', 'duration'];
	const missingFields = requiredFields.filter(field => !packageData[field]);

	if (missingFields.length > 0) {
		return res.status(400).json({ 
			success: false, 
			message: `Please provide all required fields: ${missingFields.join(', ')}` 
		});
	}

	// Validate capacity
	if (isNaN(packageData.maxCapacity) || packageData.maxCapacity <= 0) {
		return res.status(400).json({ 
			success: false, 
			message: "Please provide a valid maximum capacity" 
		});
	}

	// Validate price
	if (isNaN(packageData.basePrice) || packageData.basePrice <= 0) {
		return res.status(400).json({ 
			success: false, 
			message: "Please provide a valid base price" 
		});
	}

	const newPackage = new BoatPackage(packageData);

	try {
		const savedPackage = await newPackage.save();
		
		console.log('✅ Boat package created successfully');
		console.log('📦 Package ID:', savedPackage._id);
		console.log('📝 Package Name:', savedPackage.packageName);
		console.log('💰 Base Price:', savedPackage.basePrice);
		console.log('👥 Max Capacity:', savedPackage.maxCapacity);
		
		res.status(201).json({ 
			success: true, 
			data: savedPackage,
			message: "Boat package created successfully!"
		});
		
	} catch (error) {
		console.error("Error in Create boat package:", error.message);
		
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map(err => err.message);
			return res.status(400).json({ 
				success: false, 
				message: `Validation Error: ${validationErrors.join(', ')}` 
			});
		}
		
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Update boat package
export const updateBoatPackage = async (req, res) => {
	const { id } = req.params;
	const packageData = req.body;
	console.log('PUT /api/boat-packages/:id', { id, packageData });

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('Invalid Boat Package Id:', id);
		return res.status(404).json({ success: false, message: "Invalid Boat Package Id" });
	}

	try {
		const updatedPackage = await BoatPackage.findByIdAndUpdate(id, packageData, { new: true });
		if (!updatedPackage) {
			console.log('No boat package found for update:', id);
			return res.status(404).json({ success: false, message: "Boat package not found" });
		}
		
		console.log('✅ Boat package updated successfully:', id);
		res.status(200).json({ success: true, data: updatedPackage });
	} catch (error) {
		console.log('Error updating boat package:', error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Delete boat package
export const deleteBoatPackage = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Boat Package Id" });
	}

	try {
		const deletedPackage = await BoatPackage.findByIdAndDelete(id);
		if (!deletedPackage) {
			return res.status(404).json({ success: false, message: "Boat package not found" });
		}
		
		console.log('🗑️ Boat package deleted successfully:', id);
		res.status(200).json({ success: true, message: "Boat package deleted successfully" });
	} catch (error) {
		console.log("Error in deleting boat package:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Get boat package by ID
export const getBoatPackageById = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Boat Package Id" });
	}

	try {
		const pkg = await BoatPackage.findById(id);
		if (!pkg) {
			return res.status(404).json({ success: false, message: "Boat package not found" });
		}
		
		res.status(200).json({ success: true, data: pkg });
	} catch (error) {
		console.log("Error in fetching boat package:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

// Toggle boat package status (activate/deactivate)
export const toggleBoatPackageStatus = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Boat Package Id" });
	}

	try {
		const pkg = await BoatPackage.findById(id);
		if (!pkg) {
			return res.status(404).json({ success: false, message: "Boat package not found" });
		}

		pkg.isActive = !pkg.isActive;
		const updatedPackage = await pkg.save();
		
		console.log(`📦 Boat package ${id} status changed to: ${updatedPackage.isActive ? 'Active' : 'Inactive'}`);
		
		res.status(200).json({ 
			success: true, 
			data: updatedPackage,
			message: `Boat package ${updatedPackage.isActive ? 'activated' : 'deactivated'} successfully`
		});
	} catch (error) {
		console.log("Error in toggling boat package status:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

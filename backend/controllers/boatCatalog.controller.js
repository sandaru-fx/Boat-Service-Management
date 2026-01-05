// backend/controllers/boat.controller.js
import mongoose from "mongoose";
import Boat from "../models/boatCatalog.model.js";

// Get all boats
export const getBoats = async (req, res) => {
  try {
    const boats = await Boat.find({});
    res.status(200).json({ success: true, data: boats });
  } catch (error) {
    console.error("❌ Error in getBoats:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get boat by ID
export const getBoatById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid Boat Id" });
    }

    const boat = await Boat.findById(id);
    if (!boat) {
      return res.status(404).json({ success: false, message: "Boat not found" });
    }

    res.status(200).json({ success: true, data: boat });
  } catch (error) {
    console.error("❌ Error in getBoatById:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create new boat
export const createBoat = async (req, res) => {
  const boat = req.body;

  if (!boat.name || !boat.price || !boat.image || !boat.category) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide all required fields: name, price, image, and category" 
    });
  }

  try {
    const newBoat = new Boat(boat);
    await newBoat.save();
    res.status(201).json({ 
      success: true, 
      data: newBoat,
      message: "Boat created successfully" 
    });
  } catch (error) {
    console.error("❌ Error in createBoat:", error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: "Validation Error: " + validationErrors.join(', ') 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "A boat with this name already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server Error: " + error.message 
    });
  }
};

// Update boat
export const updatedBoat = async (req, res) => {
  const { id } = req.params;
  const boat = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Boat Id" });
  }

  try {
    const updatedBoat = await Boat.findByIdAndUpdate(id, boat, { new: true });
    res.status(200).json({ success: true, data: updatedBoat });
  } catch (error) {
    console.error("❌ Error in updatedBoat:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete boat
export const deleteBoat = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Boat Id" });
  }

  try {
    await Boat.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Boat deleted" });
  } catch (error) {
    console.error("❌ Error in deleteBoat:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// backend/controllers/review.controller.js
import mongoose from "mongoose";
import Review from "../models/review.model.js";

// Get reviews (optional filters by boatId or userEmail)
export const getReviews = async (req, res) => {
  try {
    const { boatId, userEmail, admin } = req.query;
    let filter = {};

    if (boatId && mongoose.Types.ObjectId.isValid(boatId)) {
      filter.boatId = boatId;
    }

    if (userEmail && admin !== "true") {
      filter.userEmail = userEmail;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    // Hide email for non-admin users
    const sanitizedReviews = reviews.map((review) => {
      const obj = review.toObject();
      if (admin !== "true") delete obj.userEmail;
      return obj;
    });

    res.status(200).json({ success: true, data: sanitizedReviews });
  } catch (error) {
    console.error("❌ Error in getReviews:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create review
export const createReview = async (req, res) => {
  try {
    const { boatId, userName, userEmail, rating, comment } = req.body;

    if (!boatId || !userName || !userEmail || rating === undefined || !comment) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(boatId)) {
      return res.status(400).json({ success: false, message: "Invalid boatId" });
    }

    const review = await Review.create({ boatId, userName, userEmail, rating, comment });

    const sanitizedReview = review.toObject();
    delete sanitizedReview.userEmail;

    res.status(201).json({ success: true, data: sanitizedReview });
  } catch (error) {
    console.error("❌ Error in createReview:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid review ID" });
    }
    await Review.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("❌ Error in deleteReview:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// backend/models/review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    boatId: { type: mongoose.Schema.Types.ObjectId, ref: "Boat", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
import express from "express";
import { createReview, deleteReview, getReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", createReview);
router.delete("/:id", deleteReview);

export default router;

import express from "express";
import { 
	createBoatBooking, 
	deleteBoatBooking, 
	getBoatBookings, 
	updateBoatBooking,
	getEmployeeDashboard,
	updateBookingStatus,
	getBookingsByStatus,
	getFlaggedBookings,
	sendTermsToCustomer,
	reviewBookingContent,
	getCustomerBookings,
	confirmBoatBookingPayment
} from "../controllers/boatBookingController.js";
import BoatBooking from "../models/boatBooking.model.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Search boat bookings (enhanced for new structure)
router.get("/search", async (req, res) => {
	const { q } = req.query;
	try {
		const bookings = await BoatBooking.find({ 
			$or: [
				{ customerName: { $regex: q || "", $options: "i" } },
				{ customerEmail: { $regex: q || "", $options: "i" } },
				{ customerPhone: { $regex: q || "", $options: "i" } },
				{ packageName: { $regex: q || "", $options: "i" } },
				{ specialRequests: { $regex: q || "", $options: "i" } }
			]
		}).populate('packageId').sort({ createdAt: -1 });
		res.json(bookings);
	} catch (err) {
		res.status(500).json({ error: "Search failed", details: err.message });
	}
});

// EMPLOYEE ROUTES
router.get("/employee/dashboard", getEmployeeDashboard);
router.get("/employee/bookings", getBookingsByStatus);
router.get("/employee/flagged", getFlaggedBookings);
router.put("/employee/bookings/:id/status", updateBookingStatus);
router.post("/employee/bookings/:id/terms", sendTermsToCustomer);
router.put("/employee/bookings/:id/review", reviewBookingContent);

// CUSTOMER ROUTES
router.get("/", getBoatBookings);
router.get("/my-bookings", authMiddleware, getCustomerBookings);
router.post("/", createBoatBooking);

// Clear all bookings (for testing) - MUST be before /:id routes
router.delete("/clear-all", authMiddleware, async (req, res) => {
	try {
		const result = await BoatBooking.deleteMany({});
		res.json({ 
			success: true, 
			message: `Deleted ${result.deletedCount} bookings`,
			deletedCount: result.deletedCount
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

router.put("/:id", updateBoatBooking);
router.delete("/:id", deleteBoatBooking);
router.post("/:id/payment/confirm", confirmBoatBookingPayment);

export default router;

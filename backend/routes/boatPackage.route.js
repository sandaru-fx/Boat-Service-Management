import express from "express";
import { 
	createBoatPackage, 
	deleteBoatPackage, 
	getBoatPackages, 
	updateBoatPackage,
	getBoatPackageById,
	getActiveBoatPackages,
	toggleBoatPackageStatus
} from "../controllers/boatPackageController.js";

const router = express.Router();

// Public routes (for customers)
router.get("/active", getActiveBoatPackages);
router.get("/:id", getBoatPackageById);

// Employee routes (for package management)
router.get("/", getBoatPackages);
router.post("/", createBoatPackage);
router.put("/:id", updateBoatPackage);
router.delete("/:id", deleteBoatPackage);
router.patch("/:id/toggle", toggleBoatPackageStatus);

export default router;

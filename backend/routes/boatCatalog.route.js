import express from "express";
import { createBoat, deleteBoat, getBoats, getBoatById, updatedBoat } from "../controllers/boatCatalog.controller.js";

const router = express.Router();

router.get("/", getBoats);
router.get("/:id", getBoatById);
router.post("/", createBoat);
router.put("/:id", updatedBoat);
router.delete("/:id", deleteBoat);

export default router;
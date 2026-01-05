import express from "express";
import { 
  createAppointment, 
  deleteAppointment, 
  getAppointments, 
  getAppointmentById, 
  updateAppointment,
  getAvailableTimeSlots,
  updateAppointmentStatus,
  getCalendarData,
  getCustomerAppointments,
  updateCustomerAppointment,
  deleteCustomerAppointment,
  getAppointmentStats
} from "../controllers/appointmentBooking.controller.js";

const router = express.Router();

// Basic CRUD operations
router.get("/", getAppointments);
router.get("/customer", getCustomerAppointments);
router.get("/available-slots/:date", getAvailableTimeSlots);
router.get("/calendar/:year/:month", getCalendarData);
router.get("/stats", getAppointmentStats);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.put("/customer/:id", updateCustomerAppointment);
router.delete("/:id", deleteAppointment);
router.delete("/customer/:id", deleteCustomerAppointment);
router.patch("/:id/status", updateAppointmentStatus);

export default router;

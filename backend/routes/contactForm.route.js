import express from "express";
import { 
  createContact, 
  deleteContact, 
  getContacts, 
  getContactById, 
  updateContact 
} from "../controllers/contactForm.controller.js";

const router = express.Router();

router.get("/", getContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;















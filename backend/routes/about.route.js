import express from "express";
import { 
  getAbout,
  createOrUpdateAbout,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  updateStatistics,
  updateCompanyInfo,
  updateCallToAction,
  updateSettings
} from "../controllers/about.controller.js";

const router = express.Router();

// Main About page routes
router.get("/", getAbout);
router.post("/", createOrUpdateAbout);
router.put("/", createOrUpdateAbout);

// Company Information
router.put("/company-info", updateCompanyInfo);

// Statistics
router.put("/statistics", updateStatistics);

// Team Members
router.post("/team-members", addTeamMember);
router.put("/team-members/:memberId", updateTeamMember);
router.delete("/team-members/:memberId", deleteTeamMember);

// Testimonials
router.post("/testimonials", addTestimonial);
router.put("/testimonials/:testimonialId", updateTestimonial);
router.delete("/testimonials/:testimonialId", deleteTestimonial);

// Achievements
router.post("/achievements", addAchievement);
router.put("/achievements/:achievementId", updateAchievement);
router.delete("/achievements/:achievementId", deleteAchievement);

// Call to Action
router.put("/call-to-action", updateCallToAction);

// Settings
router.put("/settings", updateSettings);

export default router;















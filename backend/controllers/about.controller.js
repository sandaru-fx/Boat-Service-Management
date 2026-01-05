import About from "../models/about.model.js";
import mongoose from "mongoose";

// Get About page content
export const getAbout = async (req, res) => {
  try {
    const about = await About.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (!about) {
      // Return default content if no about page exists
      return res.status(200).json({
        success: true,
        data: {
          companyInfo: {
            title: "About Marine Service Center",
            subtitle: "Your Trusted Marine Partner",
            description: "For over 15 years, we've been Sri Lanka's premier marine service provider, combining cutting-edge technology with unparalleled expertise to keep your vessel in perfect condition.",
            mission: "Providing exceptional marine services with expertise and reliability",
            vision: "To be Sri Lanka's leading marine service provider",
            values: ["Quality", "Safety", "Customer Satisfaction", "Innovation"]
          },
          statistics: [
            { number: "15+", label: "Years Experience", icon: "FaAward", color: "blue", order: 0 },
            { number: "5000+", label: "Boats Serviced", icon: "FaShip", color: "green", order: 1 },
            { number: "98%", label: "Customer Satisfaction", icon: "FaHeart", color: "red", order: 2 },
            { number: "24/7", label: "Emergency Service", icon: "FaShieldAlt", color: "orange", order: 3 }
          ],
          teamMembers: [
            {
              name: "Captain Rajesh",
              role: "Chief Marine Engineer",
              experience: "20+ years",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
              specialties: ["Engine Repair", "Emergency Response"],
              bio: "Expert marine engineer with over 20 years of experience",
              order: 0
            },
            {
              name: "Sarah Johnson",
              role: "Marine Technician",
              experience: "12+ years",
              image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
              specialties: ["Boat Maintenance", "Quality Control"],
              bio: "Dedicated technician specializing in boat maintenance and quality control",
              order: 1
            },
            {
              name: "David Kumar",
              role: "Emergency Specialist",
              experience: "8+ years",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
              specialties: ["24/7 Support", "Rapid Response"],
              bio: "Emergency response specialist available 24/7 for urgent marine services",
              order: 2
            }
          ],
          testimonials: [
            {
              name: "Michael Chen",
              boat: "Ocean Explorer",
              rating: 5,
              text: "Exceptional service! They saved my boat during an emergency at 2 AM. Professional, reliable, and truly care about their customers.",
              order: 0
            },
            {
              name: "Lisa Rodriguez",
              boat: "Sea Breeze",
              rating: 5,
              text: "The best marine service in Sri Lanka. Their attention to detail and quality of work is unmatched. Highly recommended!",
              order: 1
            },
            {
              name: "James Wilson",
              boat: "Marine Star",
              rating: 5,
              text: "Outstanding team! They not only fixed my engine but also provided valuable maintenance tips. True professionals.",
              order: 2
            }
          ],
          achievements: [
            {
              title: "Best Marine Service 2023",
              description: "Awarded by Sri Lanka Marine Association",
              icon: "FaTrophy",
              year: "2023",
              order: 0
            },
            {
              title: "ISO 9001 Certified",
              description: "Quality management system certified",
              icon: "FaCertificate",
              year: "2022",
              order: 1
            },
            {
              title: "Safety Excellence Award",
              description: "Zero accidents in the last 5 years",
              icon: "FaMedal",
              year: "2023",
              order: 2
            },
            {
              title: "Industry Leader",
              description: "Recognized as top marine service provider",
              icon: "FaFlag",
              year: "2023",
              order: 3
            }
          ],
          callToAction: {
            title: "Ready to Experience Excellence?",
            description: "Join thousands of satisfied customers who trust us with their vessels. Book your service today and discover why we're Sri Lanka's #1 marine service provider.",
            primaryButton: {
              text: "Book Service",
              link: "/appointments"
            },
            secondaryButton: {
              text: "Contact Us",
              link: "/contact"
            }
          },
          settings: {
            showTeam: true,
            showTestimonials: true,
            showAchievements: true,
            showStatistics: true,
            enableVideo: false,
            videoUrl: ""
          }
        }
      });
    }

    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error fetching about page:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create or Update About page content
export const createOrUpdateAbout = async (req, res) => {
  try {
    const aboutData = req.body;
    
    // Check if about page already exists
    let about = await About.findOne({ isActive: true });
    
    if (about) {
      // Update existing about page
      about = await About.findByIdAndUpdate(
        about._id,
        { ...aboutData, lastUpdated: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      // Create new about page
      about = new About(aboutData);
      await about.save();
    }

    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error creating/updating about page:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add Team Member
export const addTeamMember = async (req, res) => {
  try {
    const { teamMember } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      // Create new about page if it doesn't exist
      about = new About({});
    }
    
    // Set order if not provided
    if (teamMember.order === undefined) {
      teamMember.order = about.teamMembers.length;
    }
    
    about.teamMembers.push(teamMember);
    await about.save();
    
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    console.log("Error adding team member:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Team Member
export const updateTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { teamMember } = req.body;
    
    const about = await About.findOne({ isActive: true });
    
    if (!about) {
      return res.status(404).json({ success: false, message: "About page not found" });
    }
    
    const memberIndex = about.teamMembers.findIndex(member => member._id.toString() === memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }
    
    about.teamMembers[memberIndex] = { ...about.teamMembers[memberIndex], ...teamMember };
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating team member:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete Team Member
export const deleteTeamMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const about = await About.findOne({ isActive: true });
    
    if (!about) {
      return res.status(404).json({ success: false, message: "About page not found" });
    }
    
    about.teamMembers = about.teamMembers.filter(member => member._id.toString() !== memberId);
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error deleting team member:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add Testimonial
export const addTestimonial = async (req, res) => {
  try {
    const { testimonial } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = new About({});
    }
    
    if (testimonial.order === undefined) {
      testimonial.order = about.testimonials.length;
    }
    
    about.testimonials.push(testimonial);
    await about.save();
    
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    console.log("Error adding testimonial:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const { testimonial } = req.body;
    
    const about = await About.findOne({ isActive: true });
    
    if (!about) {
      return res.status(404).json({ success: false, message: "About page not found" });
    }
    
    const testimonialIndex = about.testimonials.findIndex(t => t._id.toString() === testimonialId);
    
    if (testimonialIndex === -1) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    
    about.testimonials[testimonialIndex] = { ...about.testimonials[testimonialIndex], ...testimonial };
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating testimonial:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete Testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;
    
    const about = await About.findOne({ isActive: true });
    
    if (!about) {
      return res.status(404).json({ success: false, message: "About page not found" });
    }
    
    about.testimonials = about.testimonials.filter(t => t._id.toString() !== testimonialId);
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error deleting testimonial:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add Achievement
export const addAchievement = async (req, res) => {
  try {
    const { achievement } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = new About({});
    }
    
    if (achievement.order === undefined) {
      achievement.order = about.achievements.length;
    }
    
    about.achievements.push(achievement);
    await about.save();
    
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    console.log("Error adding achievement:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Achievement
export const updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { achievement } = req.body;
    
    const about = await About.findOne({ isActive: true });
    
    if (!about) {
      return res.status(404).json({ success: false, message: "About page not found" });
    }
    
    const achievementIndex = about.achievements.findIndex(a => a._id.toString() === achievementId);
    
    if (achievementIndex === -1) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }
    
    about.achievements[achievementIndex] = { ...about.achievements[achievementIndex], ...achievement };
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating achievement:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete Achievement
export const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    
    const about = await About.findOne({ isActive: true });
    
    if (!about) {
      return res.status(404).json({ success: false, message: "About page not found" });
    }
    
    about.achievements = about.achievements.filter(a => a._id.toString() !== achievementId);
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error deleting achievement:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Statistics
export const updateStatistics = async (req, res) => {
  try {
    const { statistics } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = new About({});
    }
    
    about.statistics = statistics;
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating statistics:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Company Info
export const updateCompanyInfo = async (req, res) => {
  try {
    const { companyInfo } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = new About({});
    }
    
    about.companyInfo = { ...about.companyInfo, ...companyInfo };
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating company info:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Call to Action
export const updateCallToAction = async (req, res) => {
  try {
    const { callToAction } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = new About({});
    }
    
    about.callToAction = { ...about.callToAction, ...callToAction };
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating call to action:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Settings
export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    let about = await About.findOne({ isActive: true });
    
    if (!about) {
      about = new About({});
    }
    
    about.settings = { ...about.settings, ...settings };
    await about.save();
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.log("Error updating settings:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};















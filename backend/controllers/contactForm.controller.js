import mongoose from "mongoose";
import Contact from "../models/contactForm.model.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.log("error in fetching contacts", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getContactById = async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Contact Id" });
  }

  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.log("error in fetching contact", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createContact = async (req, res) => {
  const contact = req.body; // user will send this data

  if (!contact.companyName || !contact.email || !contact.address) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  const newContact = new Contact(contact);

  try {
    await newContact.save();
    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    console.error("Error in Create contact", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateContact = async (req, res) => {
  const { id } = req.params;
  const contact = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Contact Id" });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, contact, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.status(200).json({ success: true, data: updatedContact });
  } catch (error) {
    console.error("Error in Update contact", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Contact Id" });
  }

  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error in Delete contact", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};















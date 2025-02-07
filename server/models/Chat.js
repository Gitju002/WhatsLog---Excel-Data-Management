const mongoose = require("mongoose");

// Define schema for Chats
const chatSchema = new mongoose.Schema({
  serialNumber: { type: Number, unique: true, required: true }, // Auto-incremented
  date: { type: Date, required: true, default: Date.now }, // Timestamp of the message
  name: { type: String, required: true }, // Sender's name
  mobileNo: { type: String, required: true }, // Mobile number
  stream: { type: String }, // Field of study (optional)
  areaOfInterest: { type: String }, // Inquiry focus (optional)
  modeOfCommunication: { type: String }, // WhatsApp, phone, etc. (optional)
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Admin username who uploaded this
  deleted: { type: Boolean, default: false }, // Soft delete flag
});

// Export the Chat model
module.exports = mongoose.model("Chat", chatSchema);

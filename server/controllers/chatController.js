const fs = require("fs");
const Joi = require("joi");
const Chat = require("../models/Chat");

// Validation schema for creating a chat
const chatValidationSchema = Joi.object({
  date: Joi.date().required(),
  name: Joi.string().required(),
  mobileNo: Joi.string().length(10).required(),
  stream: Joi.string().optional(),
  areaOfInterest: Joi.string().optional(),
  modeOfCommunication: Joi.string().optional(),
});

// Create a new chat entry
const createChat = async (req, res, next) => {
  try {
    const { error } = chatValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const lastChat = await Chat.findOne().sort({ serialNumber: -1 });
    const newSerialNumber = lastChat ? lastChat.serialNumber + 1 : 1;

    const chat = new Chat({
      serialNumber: newSerialNumber,
      date: req.body.date,
      name: req.body.name,
      mobileNo: req.body.mobileNo,
      stream: req.body.stream || "",
      areaOfInterest: req.body.areaOfInterest || "",
      modeOfCommunication: req.body.modeOfCommunication || "",
      uploadedBy: req.user.id, // Admin username from JWT
    });

    const savedChat = await chat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    next(error); // Pass error to error handler middleware
  }
};

// Bulk Save Chats
const bulkSaveChats = async (req, res, next) => {
  try {
    const chats = req.body;
    console.log("Received Data Type:", typeof chats);
    console.log("Is Array:", Array.isArray(chats));
    if (!Array.isArray(chats) || chats.length === 0) {
      return res.status(400).json({ message: "No data provided." });
    }

    const lastChat = await Chat.findOne().sort({ serialNumber: -1 });
    let serialNumber = lastChat ? lastChat.serialNumber + 1 : 1;

    const chatsWithSerial = chats.map((chat) => ({
      ...chat,
      serialNumber: serialNumber++,
      uploadedBy: req.user.id,
    }));

    await Chat.insertMany(chatsWithSerial);
    res.status(201).json({ message: "Bulk data saved successfully." });
  } catch (error) {
    console.error("Server Error:", error);
    next(error);
  }
};

const getAllChats = async (req, res, next) => {
  try {
    const {
      serialNumber,
      name,
      mobileNo,
      areaOfInterest,
      modeOfCommunication,
      dateFrom,
      dateTo,
    } = req.query;

    const sortings = {};
    const filters = {};

    if (serialNumber) {
      sortings.serialNumber = serialNumber === "asc" ? 1 : -1;
    }

    if (name) {
      filters.name = { $regex: name, $options: "i" };
    }

    if (mobileNo) {
      filters.mobileNo = { $regex: mobileNo, $options: "i" };
    }

    if (areaOfInterest) {
      filters.areaOfInterest = { $regex: areaOfInterest, $options: "i" };
    }

    if (modeOfCommunication) {
      filters.modeOfCommunication = {
        $regex: modeOfCommunication,
        $options: "i",
      };
    }

    if (dateFrom || dateTo) {
      filters.date = {};
      if (dateFrom) {
        filters.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.date.$lte = new Date(dateTo);
      }
    }

    let query = { deleted: false };

    const orConditions = [];
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        orConditions.push({ [key]: filters[key] });
      }
    });

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    // Fetch non-deleted chats and sort by original serialNumber
    let chats = await Chat.find(query)
      .sort({ serialNumber: 1 }) // ✅ Sort by serialNumber first
      .populate("uploadedBy");

    // ✅ Recalculate serial numbers dynamically
    chats = chats.map((chat, index) => ({
      ...chat.toObject(), // Convert Mongoose document to plain object
      serialNumber: index + 1, // Assign new serial number dynamically
    }));

    res.json(chats);
  } catch (error) {
    next(error);
  }
};

const getChatById = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("Fetching chat with ID:", id); // ✅ Log ID for debugging

    // Validate MongoDB ObjectId (24-character hex string)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    // Fetch single chat entry, ensuring it's not soft-deleted
    const chat = await Chat.findOne({ _id: id, deleted: false }).populate(
      "uploadedBy"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or deleted" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    next(error);
  }
};

const updateChatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, mobileNo, areaOfInterest } = req.body;

    const chat = await Chat.findOne({
      _id: id,
      deleted: false,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat is not present" });
    }

    if (name) chat.name = name;
    if (mobileNo) chat.mobileNo = mobileNo;
    if (areaOfInterest) chat.areaOfInterest = areaOfInterest;

    const updatedChat = await chat.save();

    res.json({
      message: "User details updated successfully",
      data: updatedChat,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a chat entry
const deleteChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find chat by ID
    const chat = await Chat.findById(id);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Soft delete the chat
    chat.deleted = true;
    await chat.save();

    // Fetch all non-deleted chats sorted by serialNumber
    const nonDeletedChats = await Chat.find({ deleted: false }).sort({
      serialNumber: 1,
    });

    // ✅ Use bulkWrite to update serial numbers efficiently
    const bulkOps = nonDeletedChats.map((chat, index) => ({
      updateOne: {
        filter: { _id: chat._id },
        update: { $set: { serialNumber: index + 1 } }, // Assign new serial number
      },
    }));

    await Chat.bulkWrite(bulkOps);

    return res.json({
      success: true,
      message: "Chat deleted successfully and serial numbers updated.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChat,
  getAllChats,
  getChatById,
  deleteChat,
  updateChatById,
  bulkSaveChats,
};

const express = require("express");

const {
  createChat,
  getAllChats,
  deleteChat,
  updateChatById,
  bulkSaveChats,
} = require("../controllers/chatController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

// Admin-only: Create a new chat
router.post("/", protect, adminOnly, createChat);

// Admin/User: Fetch all chats (without filtering)
router.get("/all", protect, getAllChats);

// Admin/User: Fetch a chat by ID
router.get("/:id", protect, getAllChats);

// Admin-only: Bulk Save Chats
router.post("/bulk", protect, adminOnly, bulkSaveChats); // New route

// Admin-only: Update a chat entry
router.put("/update/:id", protect, adminOnly, updateChatById);

// Admin-only: Delete a chat entry
router.delete("/:id", protect, adminOnly, deleteChat);

module.exports = router;

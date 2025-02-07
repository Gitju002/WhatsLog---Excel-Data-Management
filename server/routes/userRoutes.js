const express = require("express");
const { loginUser, getProfile } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

// Define the login route
router.post("/login", loginUser);

// Get User Profile
router.get("/me", protect, getProfile);

module.exports = router;

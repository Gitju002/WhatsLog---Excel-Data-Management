const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/logMiddleware");
const helmet = require("helmet");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (process.env.WHITELIST.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  })
);

// Use Helmet for security headers
app.use(helmet());

// Log all requests
app.use(requestLogger);

// Parse JSON requests
app.use(express.json());

// Routes
app.use("/api/chats", chatRoutes);
app.use("/api/auth", userRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

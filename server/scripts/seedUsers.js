const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });

    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        username: "adminUser",
        passwordHash: await bcrypt.hash("adminPass123", salt),
        role: "admin",
      },
      {
        username: "regularUser",
        passwordHash: await bcrypt.hash("userPass123", salt),
        role: "user",
      },
    ];

    await User.insertMany(users);
    console.log("Users seeded successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding users:", error.message);
    mongoose.connection.close();
  }
};

seedUsers();

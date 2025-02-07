const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "User not found", status: "false" });
      }

      next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res
        .status(401)
        .json({ message: "Not authorized, token failed", status: "false" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token", status: "false" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = { protect, adminOnly };

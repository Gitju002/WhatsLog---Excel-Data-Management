const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message); // Log the error message

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "An unknown error occurred",
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // Hide stack in production
  });
};

module.exports = errorHandler;

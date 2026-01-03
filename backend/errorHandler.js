// Centralized error-handling middleware
module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.code || 500;

  // Log full error server-side (safe)
  console.error(" Backend Error:", err);

  res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Something went wrong",
    details: null,
    timestamp: new Date().toISOString(),
  });
};

export function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected error occurred",
    error: {
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
}

import { formatDisplayDate } from "../services/tripService.js";

export function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "An unexpected error occurred";

  if (err.code === 11000) {
    statusCode = 409;
    if (err.keyValue && err.keyValue.sl_no !== undefined && err.keyValue.date !== undefined) {
      message = `Sl.No ${err.keyValue.sl_no} already exists for ${formatDisplayDate(err.keyValue.date)}. Please enter a different Sl.No.`;
    } else if (err.keyValue && err.keyValue.sl_no !== undefined) {
      message = `Sl.No ${err.keyValue.sl_no} already exists. Please enter a different Sl.No.`;
    } else {
      message = "A record with this identifier already exists.";
    }
  } else if (message.includes("already exists")) {
    statusCode = 409;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    },
  });
}

import mongoose from "mongoose";
import { config } from "../config/environment.js";

const SERVICE_NAME = "SRS-transport-commission-management-api";

export function getLiveness(req, res) {
  res.status(200).json({
    status: "ok",
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export function getReadiness(req, res) {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isConfigValid = Boolean(config.mongoUri && config.jwtSecret);

  const dbStatus = isDbConnected ? "ok" : "error";
  const configStatus = isConfigValid ? "ok" : "error";

  const isReady = isDbConnected && isConfigValid;

  if (!isReady) {
    if (!isDbConnected) {
      console.error(
        `Health readiness check failed: MongoDB connection state is ${mongoose.connection.readyState}`
      );
    }
    if (!isConfigValid) {
      console.error("Health readiness check failed: Missing required application configuration");
    }

    return res.status(503).json({
      status: "error",
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
        },
        configuration: {
          status: configStatus,
        },
      },
    });
  }

  return res.status(200).json({
    status: "ok",
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: dbStatus,
      },
      configuration: {
        status: configStatus,
      },
    },
  });
}

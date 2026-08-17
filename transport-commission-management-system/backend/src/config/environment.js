import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/transport_system",
  jwtSecret: process.env.JWT_SECRET || "transport_commission_secret_key_2026",
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  initialAdminUsername: process.env.INITIAL_ADMIN_USERNAME || "admin",
  initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD || "admin123",
};

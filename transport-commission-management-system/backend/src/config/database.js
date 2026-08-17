import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./environment.js";
import { User } from "../models/User.js";

async function seedInitialAdmin() {
  const adminExists = await User.findOne({ role: "ADMIN" });
  if (!adminExists) {
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME || "admin";
    const rawAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
    const adminHash = await bcrypt.hash(rawAdminPassword, 10);
    const now = new Date().toISOString();

    await User.create({
      id: "usr_admin_" + Date.now(),
      username: adminUsername,
      password_hash: adminHash,
      name: "System Administrator",
      role: "ADMIN",
      active: true,
      created_at: now,
    });
    console.log(`Initial Admin account ready: ${adminUsername}`);
  }
}

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB successfully");

    await seedInitialAdmin();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

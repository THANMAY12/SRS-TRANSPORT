import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./environment.js";
import { User } from "../models/User.js";
import { Trip } from "../models/Trip.js";

async function seedDefaultUsers() {
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    const adminHash = await bcrypt.hash("admin123", 10);
    const workerHash = await bcrypt.hash("worker123", 10);
    const now = new Date().toISOString();

    await User.create({
      id: "usr_admin",
      username: "admin",
      password_hash: adminHash,
      name: "System Administrator",
      role: "ADMIN",
      active: true,
      created_at: now,
    });

    await User.create({
      id: "usr_worker1",
      username: "worker",
      password_hash: workerHash,
      name: "Ramesh Kumar (Worker)",
      role: "WORKER",
      active: true,
      created_at: now,
    });
  }
}

async function seedSampleTripsIfEmpty() {
  const count = await Trip.countDocuments();
  if (count === 0) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0];

    const sampleTrips = [
      {
        id: "trip_101",
        sl_no: 1,
        date: today,
        vehicle_number: "KA-01-AB-1234",
        from_location: "Bangalore",
        to_location: "Chennai",
        freight: 45000,
        transport: "VRL Logistics",
        booking: 48000,
        commission: 2000,
        advance_received_amount: 15000,
        advance_received_type: "PhonePe",
        advance_paid_amount: 10000,
        advance_paid_type: "Cash",
        remarks: "Urgent FMCG delivery",
        commission_due_date: today,
        advance_due_date: today,
        collection_due_date: today,
        vehicle_balance_cleared: true,
        company_balance_cleared: true,
        created_at: today,
        updated_at: today,
        created_by: "admin",
        updated_by: "admin",
      },
      {
        id: "trip_102",
        sl_no: 2,
        date: today,
        vehicle_number: "KA-04-CD-5678",
        from_location: "Bangalore",
        to_location: "Hyderabad",
        freight: 60000,
        transport: "SRS Transport",
        booking: 64000,
        commission: null, // Pending Commission
        advance_received_amount: 20000,
        advance_received_type: "Cash",
        advance_paid_amount: 15000,
        advance_paid_type: "PhonePe",
        remarks: "Textile goods parcel",
        commission_due_date: today,
        advance_due_date: today,
        collection_due_date: today,
        vehicle_balance_cleared: false,
        company_balance_cleared: false,
        created_at: today,
        updated_at: today,
        created_by: "worker",
        updated_by: "worker",
      },
      {
        id: "trip_103",
        sl_no: 3,
        date: yesterday,
        vehicle_number: "MH-12-EF-9012",
        from_location: "Mumbai",
        to_location: "Bangalore",
        freight: 85000,
        transport: "Navata Road Transport",
        booking: 90000,
        commission: 3500,
        advance_received_amount: 30000,
        advance_received_type: "PhonePe",
        advance_paid_amount: 25000,
        advance_paid_type: "", // Pending Vehicle Advance
        remarks: "Industrial machinery",
        commission_due_date: yesterday,
        advance_due_date: yesterday,
        collection_due_date: yesterday,
        vehicle_balance_cleared: false,
        company_balance_cleared: false,
        created_at: yesterday,
        updated_at: yesterday,
        created_by: "admin",
        updated_by: "admin",
      },
      {
        id: "trip_104",
        sl_no: 4,
        date: threeDaysAgo,
        vehicle_number: "TN-09-GH-3456",
        from_location: "Coimbatore",
        to_location: "Pune",
        freight: 52000,
        transport: "Associated Road Carriers",
        booking: 55000,
        commission: 2500,
        advance_received_amount: 20000,
        advance_received_type: "", // Pending Company Advance
        advance_paid_amount: 15000,
        advance_paid_type: "Cash",
        remarks: "Cotton yarn rolls",
        commission_due_date: threeDaysAgo,
        advance_due_date: threeDaysAgo,
        collection_due_date: threeDaysAgo,
        vehicle_balance_cleared: false,
        company_balance_cleared: false,
        created_at: threeDaysAgo,
        updated_at: threeDaysAgo,
        created_by: "worker",
        updated_by: "worker",
      },
      {
        id: "trip_105",
        sl_no: 5,
        date: fiveDaysAgo,
        vehicle_number: "KA-51-JK-7890",
        from_location: "Bangalore",
        to_location: "Kochi",
        freight: 70000,
        transport: "KPN Speed Parcel",
        booking: 75000,
        commission: 3000,
        advance_received_amount: 25000,
        advance_received_type: "PhonePe",
        advance_paid_amount: 20000,
        advance_paid_type: "Cash",
        remarks: "Electronics load",
        commission_due_date: fiveDaysAgo,
        advance_due_date: fiveDaysAgo,
        collection_due_date: fiveDaysAgo,
        vehicle_balance_cleared: false,
        company_balance_cleared: false,
        created_at: fiveDaysAgo,
        updated_at: fiveDaysAgo,
        created_by: "admin",
        updated_by: "admin",
      },
    ];

    await Trip.insertMany(sampleTrips);
  }
}

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB successfully");

    await seedDefaultUsers();
    await seedSampleTripsIfEmpty();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

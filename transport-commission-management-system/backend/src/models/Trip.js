import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sl_no: { type: Number, required: true, unique: true },
  date: { type: String, required: true },
  vehicle_number: { type: String, required: true },
  driver_phone: { type: String, default: "" },
  from_location: { type: String, required: true },
  to_location: { type: String, required: true },
  freight: { type: Number, default: 0 },
  transport: { type: String, required: true },
  booking: { type: Number, default: 0 },
  commission: { type: Number, default: null },
  commission_received_type: { type: String, default: "" },
  advance_received_amount: { type: Number, default: 0 },
  advance_received_type: { type: String, default: "" },
  advance_paid_amount: { type: Number, default: 0 },
  advance_paid_type: { type: String, default: "" },
  remarks: { type: String, default: "" },
  commission_due_date: { type: String },
  advance_due_date: { type: String },
  collection_due_date: { type: String },
  vehicle_balance_cleared: { type: Boolean, default: false },
  company_balance_cleared: { type: Boolean, default: false },
  vehicle_balance_cleared_date: { type: String },
  company_balance_cleared_date: { type: String },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
  created_by: { type: String, required: true },
  updated_by: { type: String, required: true },
});

export const Trip = mongoose.model("Trip", tripSchema);

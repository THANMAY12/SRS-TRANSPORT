import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  user_role: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  action: { type: String, required: true },
  trip_id: { type: String },
  old_value: { type: String },
  new_value: { type: String },
  timestamp: { type: String, required: true },
});

auditLogSchema.index({ date: 1, timestamp: -1 });
auditLogSchema.index({ username: 1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

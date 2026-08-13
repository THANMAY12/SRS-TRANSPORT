import { AuditLog } from "../models/AuditLog.js";

export async function addAuditLog(
  username,
  userRole,
  action,
  tripId,
  oldValue = "",
  newValue = ""
) {
  const id = "aud_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];
  const timestamp = now.toISOString();

  await AuditLog.create({
    id,
    username,
    user_role: userRole,
    date: dateStr,
    time: timeStr,
    action,
    trip_id: tripId || "",
    old_value: oldValue,
    new_value: newValue,
    timestamp,
  });
}

export async function getAuditLogs() {
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(500).lean();
  return logs.map((row) => ({
    id: row.id,
    username: row.username,
    userRole: row.user_role,
    date: row.date,
    time: row.time,
    action: row.action,
    tripId: row.trip_id,
    oldValue: row.old_value,
    newValue: row.new_value,
    timestamp: row.timestamp,
  }));
}

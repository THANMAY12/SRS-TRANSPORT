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

export async function getAuditLogs(params = {}) {
  const { datePreset, date, startDate, endDate, username, search, limit } = params;

  const query = {};

  // Date filtering
  const now = new Date();
  if (datePreset === "today") {
    query.date = now.toISOString().split("T")[0];
  } else if (datePreset === "yesterday") {
    const yesterday = new Date(now.getTime() - 86400000);
    query.date = yesterday.toISOString().split("T")[0];
  } else if (datePreset === "custom" && date) {
    query.date = String(date);
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = String(startDate);
    if (endDate) query.date.$lte = String(endDate);
  } else if (date) {
    query.date = String(date);
  }

  // Username filtering
  if (username && String(username).toLowerCase() !== "all") {
    query.username = { $regex: new RegExp(`^${username.trim()}$`, "i") };
  }

  // Search filter across fields
  if (search && String(search).trim()) {
    const q = String(search).trim();
    const regex = new RegExp(q, "i");
    query.$or = [
      { username: regex },
      { action: regex },
      { old_value: regex },
      { new_value: regex },
      { date: regex },
    ];
  }

  const queryLimit = limit ? parseInt(String(limit), 10) : 500;

  const logs = await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .limit(isNaN(queryLimit) ? 500 : queryLimit)
    .lean();

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

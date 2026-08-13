import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { addAuditLog } from "./auditLogService.js";

export async function getAllWorkers() {
  const resUsers = await User.find().lean();
  if (resUsers.length === 0) return [];

  return resUsers.map((row) => ({
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    active: Boolean(row.active),
    createdAt: row.created_at,
    lastLogin: row.last_login,
  }));
}

export async function createWorker(body, adminUser) {
  const { username, name, password, role } = body;

  const exists = await User.findOne({ username: username.trim() });
  if (exists) {
    throw new Error("Username already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newId = "usr_" + Date.now();
  const now = new Date().toISOString();
  const userRole = role === "ADMIN" ? "ADMIN" : "WORKER";

  await User.create({
    id: newId,
    username: username.trim(),
    password_hash: passwordHash,
    name: name.trim(),
    role: userRole,
    active: true,
    created_at: now,
  });

  await addAuditLog(
    adminUser.username,
    adminUser.role,
    "CREATE_USER",
    newId,
    "",
    `Created ${userRole}: ${username}`
  );

  return {
    id: newId,
    username,
    name,
    role: userRole,
    active: true,
    createdAt: now,
  };
}

export async function updateWorker(id, body, adminUser) {
  const { name, password, active, role } = body;

  const userObj = await User.findOne({ id });
  if (!userObj) {
    throw new Error("User not found");
  }
  const username = userObj.username;

  const updates = {};
  if (password) {
    updates.password_hash = await bcrypt.hash(password, 10);
  }
  if (name) {
    updates.name = name;
  }
  if (active !== undefined) {
    updates.active = active;
  }
  if (role) {
    updates.role = role;
  }

  await User.updateOne({ id }, updates);

  await addAuditLog(
    adminUser.username,
    adminUser.role,
    "UPDATE_USER",
    id,
    "",
    `Updated User ${username}`
  );
}

export async function deleteWorker(id, adminUser) {
  if (id === "usr_admin") {
    throw new Error("Cannot delete primary admin user");
  }

  await User.deleteOne({ id });

  await addAuditLog(
    adminUser.username,
    adminUser.role,
    "DELETE_USER",
    id,
    "",
    `Deleted User ID ${id}`
  );
}

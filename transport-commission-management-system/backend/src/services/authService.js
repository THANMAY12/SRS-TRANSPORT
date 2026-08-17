import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { addAuditLog } from "./auditLogService.js";
import jwt from "jsonwebtoken";
import { config } from "../config/environment.js";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: "12h" }
  );
}

export async function login(username, password) {
  const userObj = await User.findOne({ username: username.trim(), active: true }).lean();
  if (!userObj) {
    throw new Error("Invalid username or password");
  }

  const isValidPassword = await bcrypt.compare(password, userObj.password_hash);
  if (!isValidPassword) {
    throw new Error("Invalid username or password");
  }

  const nowStr = new Date().toISOString();
  await User.updateOne({ id: userObj.id }, { last_login: nowStr });

  userObj.last_login = nowStr;

  const token = generateToken(userObj);

  await addAuditLog(
    userObj.username,
    userObj.role,
    "LOGIN",
    undefined,
    "",
    `User ${userObj.username} logged in successfully`
  );

  return {
    token,
    user: {
      id: userObj.id,
      username: userObj.username,
      name: userObj.name,
      role: userObj.role,
      active: userObj.active,
      createdAt: userObj.created_at,
      lastLogin: nowStr,
    },
  };
}

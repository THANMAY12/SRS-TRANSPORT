import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  active: { type: Boolean, default: true },
  created_at: { type: String, required: true },
  last_login: { type: String },
});

export const User = mongoose.model("User", userSchema);

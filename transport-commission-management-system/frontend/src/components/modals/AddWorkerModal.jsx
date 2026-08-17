import React, { useState } from "react";
import { UserPlus, User, Lock, Shield } from "lucide-react";
import { Modal } from "../ui/Modal";

export const AddWorkerModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WORKER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !username || !password) {
      setError("Full Name, Username, and Password are required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ name, username, password, role });
      setName("");
      setUsername("");
      setPassword("");
      setRole("WORKER");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create worker account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create new system user"
      subtitle="Add a new worker or administrator user account with role permissions."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="modal_worker_name"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="modal_worker_name"
                type="text"
                required
                placeholder="e.g. Suresh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="modal_worker_username"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Username *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="modal_worker_username"
                type="text"
                required
                placeholder="e.g. suresh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="modal_worker_password"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="modal_worker_password"
                type="password"
                required
                placeholder="e.g. worker123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="modal_worker_role"
              className="block text-[11px] font-semibold text-slate-700 uppercase mb-1"
            >
              Role Permission
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <select
                id="modal_worker_role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              >
                <option value="WORKER">Worker (Trip entry & pending workflow updates)</option>
                <option value="ADMIN">Admin (Full administrative & reports access)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isSubmitting ? "Creating..." : "Create Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

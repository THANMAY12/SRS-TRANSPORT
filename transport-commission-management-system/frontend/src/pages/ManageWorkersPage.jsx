import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Printer,
} from "lucide-react";
import { api } from "../services/api";
import { formatDate } from "../lib/utils";

export const ManageWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WORKER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkers();
      setWorkers(data);
    } catch (err) {
      console.error("Failed to load workers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!username || !name || !password) {
      alert("Username, Name, and Password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createWorker({ username, name, password, role });
      setShowAddModal(false);
      setUsername("");
      setName("");
      setPassword("");
      setRole("WORKER");
      await fetchWorkers();
    } catch (err) {
      alert(err.message || "Failed to create worker account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.updateWorker(user.id, { active: !user.active });
      await fetchWorkers();
    } catch (err) {
      alert(err.message || "Failed to update user status");
    }
  };

  const handleDeleteWorker = async (id, name) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await api.deleteWorker(id);
      await fetchWorkers();
    } catch (err) {
      alert(err.message || "Failed to delete worker");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Worker Access Control
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Manage Workers & Credentials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add workers, manage role permissions, update passwords, and toggle
            active status.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            id="manage-workers-print-btn"
            onClick={() => window.print()}
            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Print Workers List Table"
          >
            <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Print View</span>
          </button>

          <button
            id="add-worker-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Worker</span>
          </button>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            User Accounts List ({workers.length})
          </h3>
          <button
            onClick={fetchWorkers}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {workers.map((w) => (
                <tr
                  key={w.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {w.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    @{w.username}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.role === "ADMIN"
                          ? "bg-purple-500/10 text-purple-600 border border-purple-500/30"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                      }`}
                    >
                      {w.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleStatus(w)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        w.active
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                      }`}
                    >
                      {w.active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{w.active ? "Active" : "Disabled"}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {formatDate(w.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    {w.lastLogin ? formatDate(w.lastLogin) : "Never"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {w.id !== "usr_admin" && (
                      <button
                        onClick={() => handleDeleteWorker(w.id, w.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add New Worker Account
            </h3>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. suresh"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. worker123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WORKER">
                    Worker (Trip entry & pending items update only)
                  </option>
                  <option value="ADMIN">
                    Admin (Full administrative & reports access)
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

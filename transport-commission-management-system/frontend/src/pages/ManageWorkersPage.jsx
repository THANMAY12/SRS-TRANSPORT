import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, RefreshCw } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Toast } from "../components/ui/Toast";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { AddWorkerModal } from "../components/modals/AddWorkerModal";
import { api } from "../services/api";
import { formatDate } from "../lib/utils";

export const ManageWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmWorker, setDeleteConfirmWorker] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkers();
      setWorkers(data);
    } catch (err) {
      console.error("Failed to load workers:", err);
      setToast({ type: "error", message: "Failed to load user accounts." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (workerData) => {
    try {
      await api.createWorker(workerData);
      setToast({
        type: "success",
        message: `Worker account @${workerData.username} created successfully!`,
      });
      await fetchWorkers();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to create worker account.",
      });
      throw err;
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.updateWorker(user.id, { active: !user.active });
      setToast({
        type: "success",
        message: `User status for @${user.username} updated to ${!user.active ? "Active" : "Disabled"}.`,
      });
      await fetchWorkers();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update user status.",
      });
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmWorker) return;
    setIsDeleting(true);
    try {
      await api.deleteWorker(deleteConfirmWorker.id);
      setToast({
        type: "success",
        message: `User account @${deleteConfirmWorker.username} deleted permanently.`,
      });
      setDeleteConfirmWorker(null);
      await fetchWorkers();
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to delete user account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { title: "Full Name" },
    { title: "Username" },
    { title: "Role" },
    { title: "Status" },
    { title: "Created Date" },
    { title: "Last Login" },
    { title: "Actions", align: "center" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        badgeText="Administration"
        title="Manage workers & credentials"
        subtitle="Add worker user accounts, assign roles, reset passwords, and toggle account active status."
        printId="manage-workers-print-btn"
        actions={
          <div className="flex items-center gap-2">
            <button
              id="add-worker-modal-btn"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Add New Worker</span>
            </button>
            <button
              onClick={fetchWorkers}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shrink-0"
              title="Refresh workers list"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        }
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Workers Table */}
      <DataTable
        columns={columns}
        data={workers}
        isLoading={isLoading}
        emptyMessage="No user accounts found."
        renderRow={(w) => (
          <tr
            key={w.id}
            className="hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <td className="py-2.5 px-3.5 font-semibold text-slate-900">{w.name}</td>
            <td className="py-2.5 px-3.5 font-mono font-semibold text-blue-700">
              @{w.username}
            </td>
            <td className="py-2.5 px-3.5">
              <StatusBadge
                type={w.role === "ADMIN" ? "admin" : "worker"}
                text={w.role}
                size="sm"
              />
            </td>
            <td className="py-2.5 px-3.5">
              <button
                onClick={() => handleToggleStatus(w)}
                className="transition-transform active:scale-95"
                title="Click to toggle account status"
              >
                <StatusBadge
                  type={w.active ? "active" : "disabled"}
                  text={w.active ? "Active" : "Disabled"}
                  size="sm"
                />
              </button>
            </td>
            <td className="py-2.5 px-3.5 whitespace-nowrap">{formatDate(w.createdAt)}</td>
            <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-400">
              {w.lastLogin ? formatDate(w.lastLogin) : "Never"}
            </td>
            <td className="py-2.5 px-3.5 text-center">
              {w.id !== "usr_admin" ? (
                <button
                  onClick={() => setDeleteConfirmWorker(w)}
                  className="p-1 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Delete user account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Primary admin</span>
              )}
            </td>
          </tr>
        )}
      />

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateWorker}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmWorker}
        onClose={() => setDeleteConfirmWorker(null)}
        onConfirm={handleDeleteConfirmed}
        title={`Delete user account @${deleteConfirmWorker?.username}?`}
        message={`Are you sure you want to delete user "${deleteConfirmWorker?.name}" (@${deleteConfirmWorker?.username})? They will lose system access immediately.`}
        confirmLabel="Delete User"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Users, Plus, Trash2, Shield, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getUsers, createUser, deleteUser, updateUserRole } from "../../services/userService";
import { useAuth } from "../../auth/AuthProvider";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Badge from "../../components/common/Badge";

export default function AdminUsers() {
  const { isMainAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const loadUsers = () => {
    setLoading(true);
    setError("");
    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load user records."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (u) => {
    if (!isMainAdmin) {
      alert("Only MAIN_ADMIN can manage user roles.");
      return;
    }
    const targetRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    setUpdatingRoleId(u.id);
    try {
      const updated = await updateUserRole(u.id, targetRole);
      setUsers((prev) => prev.map((usr) => (usr.id === u.id ? { ...usr, role: updated.role || targetRole } : usr)));
    } catch (err) {
      alert(err.message || "Failed to update user role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createUser(newUser);
      setUsers((prev) => [created, ...prev]);
      setCreateModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "USER" });
    } catch (err) {
      alert(err.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader message="Fetching registered user accounts..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadUsers} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>Manage Users & RBAC</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            View system accounts and manage role permissions across the application.
          </p>
        </div>

        <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add User Account
        </button>
      </div>

      {!isMainAdmin && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "var(--bg-tertiary)",
            borderLeft: "4px solid var(--color-warning, #f59e0b)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          <ShieldAlert size={20} style={{ color: "var(--color-warning, #f59e0b)", flexShrink: 0 }} />
          <span>
            <strong>Role Permission Notice:</strong> You are signed in as an <strong>ADMIN</strong>. Only a <strong>MAIN_ADMIN</strong> can promote users to ADMIN or demote ADMIN accounts to USER.
          </span>
        </div>
      )}

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="There are no registered user accounts." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>User Name</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Email Address</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Role</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Created Date</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {u.name}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <Badge
                        variant={
                          u.role === "MAIN_ADMIN"
                            ? "danger"
                            : u.role === "ADMIN"
                            ? "primary"
                            : "neutral"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        {isMainAdmin && u.role !== "MAIN_ADMIN" && u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={updatingRoleId === u.id}
                            className={`btn btn-xs ${u.role === "ADMIN" ? "btn-outline" : "btn-primary"}`}
                            title={u.role === "ADMIN" ? "Demote to USER" : "Promote to ADMIN"}
                          >
                            {updatingRoleId === u.id ? (
                              "Updating..."
                            ) : u.role === "ADMIN" ? (
                              <>
                                <ArrowDownRight size={14} /> Demote to USER
                              </>
                            ) : (
                              <>
                                <ArrowUpRight size={14} /> Promote to ADMIN
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="btn btn-ghost btn-icon"
                          style={{ color: "var(--color-danger)" }}
                          title="Delete User"
                          disabled={u.role === "MAIN_ADMIN" || u.id === currentUser?.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add New User Account" maxWidth="500px">
        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              required
              className="form-input"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role *</label>
            <select
              id="role"
              className="form-select"
              value={newUser.role}
              disabled={!isMainAdmin}
              onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="USER">USER</option>
              {isMainAdmin && <option value="ADMIN">ADMIN</option>}
            </select>
            {!isMainAdmin && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Only MAIN_ADMIN can assign ADMIN role.
              </span>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" onClick={() => setCreateModalOpen(false)} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to delete user account "${deleteTarget?.name}" (${deleteTarget?.email})?`}
        confirmLabel="Yes, Delete User"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
}


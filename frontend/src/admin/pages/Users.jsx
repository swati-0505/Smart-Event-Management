// Users.jsx
// Users management — service-driven, backend-ready.

import { useState, useEffect, useMemo } from "react";
import { Search, Mail, MoreVertical, UserPlus, RefreshCw, Check } from "lucide-react";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import { getUsers, createUser } from "../services/userService";

const ROLE_VARIANT = {
  Admin: "danger",
  Organizer: "warning",
  User: "info",
};

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "User" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchS =
        !s ||
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s);
      const matchR = roleFilter === "All" || u.role === roleFilter;
      return matchS && matchR;
    });
  }, [users, search, roleFilter]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setShowModal(false);
      setForm({ name: "", email: "", role: "User" });
    } catch (err) {
      console.error(err);
      alert("Failed to create user.");
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">Users</h1>
          <p className="mt-1 text-sm text-theme-muted">
            Manage system users and their roles.
          </p>
        </div>
        <button type="button" onClick={() => setShowModal(true)} className="btn-primary">
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5">
          <Search size={15} className="text-theme-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none"
        >
          <option>All</option>
          <option>Admin</option>
          <option>Organizer</option>
          <option>User</option>
        </select>
      </div>

      {loading && (
        <div className="card p-12 text-center text-sm text-theme-muted">
          Loading users...
        </div>
      )}

      {error && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={load} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <div className="col-span-full card p-12 text-center">
              <p className="text-sm text-theme-muted">No users found.</p>
            </div>
          )}
          {filtered.map((user, idx) => (
            <div
              key={user.id}
              className={`card card-interactive animate-fade-in-up stagger-${(idx % 6) + 1} p-5`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-md">
                  {user.name.charAt(0)}
                </div>
                <button type="button" className="btn-ghost">
                  <MoreVertical size={16} />
                </button>
              </div>
              <h3 className="mt-4 text-base font-bold text-theme-primary">
                {user.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-theme-muted">
                <Mail size={11} /> {user.email}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={ROLE_VARIANT[user.role] || "neutral"}>
                  {user.role}
                </Badge>
                <span className="text-xs text-theme-dim">Joined {user.joined}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Rahul Sharma"
              className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
            >
              <option>User</option>
              <option>Organizer</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={14} /> Add User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Users;
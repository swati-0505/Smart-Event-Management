// Users.jsx
// Fully responsive users page with proper touch targets.

import { useState, useEffect, useMemo } from "react";
import {
  Search, Mail, MoreVertical, UserPlus, RefreshCw, Check,
  Shield, Calendar, Trash2, Edit2, User as UserIcon,
} from "lucide-react";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import { getUsers, createUser } from "../services/userService";

const ROLE_VARIANT = {
  Admin: "danger",
  Organizer: "warning",
  User: "info",
};

const ROLE_ICON = {
  Admin: Shield,
  Organizer: UserPlus,
  User: UserIcon,
};

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
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
    <div className="space-y-4 sm:space-y-6">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
            Users
          </h1>
          <p className="mt-1 text-xs text-theme-muted sm:text-sm">
            Manage system users and their roles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary w-full text-xs sm:w-auto sm:text-sm"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* ============ FILTERS ============ */}
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex w-full items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 sm:max-w-sm">
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
          className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none sm:w-auto"
        >
          <option>All</option>
          <option>Admin</option>
          <option>Organizer</option>
          <option>User</option>
        </select>
      </div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card animate-pulse p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-theme-tertiary" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-theme-tertiary" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-theme-tertiary" />
                </div>
              </div>
              <div className="mt-4 h-3 w-1/3 rounded bg-theme-tertiary" />
            </div>
          ))}
        </div>
      )}

      {/* ============ ERROR ============ */}
      {error && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={load} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <UserIcon size={40} className="mx-auto text-theme-dim" />
          <p className="mt-3 text-sm text-theme-muted">No users found.</p>
        </div>
      )}

      {/* ============ USERS GRID ============ */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((user, idx) => {
            const RoleIcon = ROLE_ICON[user.role] || UserIcon;
            return (
              <div
                key={user.id}
                className={`card card-interactive animate-fade-in-up stagger-${(idx % 6) + 1} relative p-4 sm:p-5`}
              >
                {/* ✅ 40px touch target */}
                <div className="absolute right-2 top-2">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
                    aria-label="More options"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === user.id && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setOpenMenu(null)}
                        aria-label="Close menu"
                      />
                      <div className="animate-scale-in absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-lg">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-3 text-xs text-theme-secondary transition hover:bg-theme-hover"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 border-t border-theme px-3 py-3 text-xs text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-md">
                  {user.name.charAt(0)}
                </div>

                <h3 className="mt-3 line-clamp-1 text-sm font-bold text-theme-primary sm:text-base">
                  {user.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-theme-muted">
                  <Mail size={11} className="shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <Badge variant={ROLE_VARIANT[user.role] || "neutral"}>
                    {user.role}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-theme-dim">
                    <Calendar size={10} />
                    {user.joined}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ ADD USER MODAL ============ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New User"
        maxWidth="max-w-lg"
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

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <Check size={14} /> Add User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Users;
// Users.jsx
// Users management — uses useApiWithFallback for concise data loading.
import { useState, useEffect, useMemo } from "react";
import { Search, Mail, MoreVertical, UserPlus, Check } from "lucide-react";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import { getUsers, createUser } from "../services/userService";
import { toast } from "sonner";
const ROLE_VARIANT = {
  ADMIN: "danger",
  Admin: "danger",
  ORGANIZER: "warning",
  Organizer: "warning",
  USER: "info",
  User: "info",
};
function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "User",
  });
  // Load REAL users from backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      console.log("USERS FROM BACKEND:", data);
      // Backend is expected to return an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FAILED TO LOAD USERS:", err);
      setError(err.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchS =
        !s ||
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s);

      const matchR =
        roleFilter === "All" ||
        u.role?.toUpperCase() === roleFilter.toUpperCase();

      return matchS && matchR;
    });
  }, [users, search, roleFilter]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const createdUser = await createUser(form);

      console.log("USER CREATED:", createdUser);

      toast.success("User added successfully");

      setShowModal(false);
      setForm({
        name: "",
        email: "",
        role: "User",
      });

      // Reload real users from backend
      await loadUsers();
    } catch (error) {
      console.error("FAILED TO CREATE USER:", error);
      toast.error(error.message || "Failed to add user");
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">Users</h1>
          <p className="mt-1 text-sm text-theme-muted">
            Manage system users and their roles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
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
          {["All", "Admin", "Organizer", "User"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-12 text-center text-sm text-theme-muted">
          Loading users...
        </div>
      ) : (
        <>
          {usingFallback && (
            <div className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-2.5 text-[11px] font-bold text-amber-900">
              Demo data — connect backend to see real users.
            </div>
          )}

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
                  <span className="text-xs text-theme-dim">
                    Joined {user.joined || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", name: "name", type: "text", placeholder: "e.g., Rahul Sharma" },
            { label: "Email", name: "email", type: "email", placeholder: "user@example.com" },
          ].map((f) => (
            <div key={f.name}>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
                {f.label}
              </label>
              <input
                type={f.type}
                required
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
            >
              {["User", "Organizer", "Admin"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
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
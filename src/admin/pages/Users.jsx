// Users.jsx
// This component displays the users management page.
// It handles search and role filtering.

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { getUsers } from "../services/userService";

function Users() {
  // State for users list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and role filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Function to load users from service
  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get users
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Helper to get role badge class
  function getRoleClass(role) {
    switch (role) {
      case "ADMIN":
        return "admin-status-upcoming";
      case "USER":
        return "admin-status-confirmed";
      case "ORGANIZER":
        return "admin-status-pending";
      default:
        return "admin-status-pending";
    }
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          System
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Users
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Manage system users and their roles.
            </p>
          </div>
        </div>
      </header>

      {/* Search and filter bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-[#d7a63a]/20 bg-[#d7a63a]/[0.05] px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-[#d7a63a]/75" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-xs text-white/65 outline-none transition focus:border-[#d7a63a]/40 sm:w-auto"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="USER">User</option>
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-white/30">
            Loading users...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Users table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Name
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Created At
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-white/85">
                          {user.name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/55">
                        {user.email}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`admin-status ${getRoleClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/45">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-white/30">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Users;
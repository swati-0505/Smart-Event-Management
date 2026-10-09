import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/navigation/AdminSidebar";
import AdminNavbar from "../components/navigation/AdminNavbar";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminNavbar onOpenMobile={() => setMobileOpen(true)} />
        <main style={{ flex: 1, padding: "1.5rem 2rem 3rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

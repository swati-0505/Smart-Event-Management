// AdminLayout.jsx
// Main layout wrapper for admin panel.

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CommandPalette from "./CommandPalette";

function AdminLayout({
  currentPage,
  onPageChange,
  children,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  function handlePageChange(page) {
    onPageChange(page);
    setSidebarOpen(false);
  }

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e) {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-primary text-theme-primary">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
      />

      <Navbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onMenuClick={() => setSidebarOpen(true)}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <main className="min-h-screen pt-[72px] lg:ml-64">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default AdminLayout;
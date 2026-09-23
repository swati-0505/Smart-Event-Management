// AdminLayout.jsx
// Main admin layout: sidebar + navbar + content + command palette + AI widget.

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CommandPalette from "./CommandPalette";
import AIChatWidget from "../common/AIChatWidget";

function AdminLayout({
  currentPage,
  onPageChange,
  children,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onLogout,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  function handlePageChange(page) {
    onPageChange(page);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  // Ctrl+K / Cmd+K → Command Palette
  useEffect(() => {
    function handleKeyDown(e) {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showAIWidget = currentPage !== "ai-assistant";

  return (
    <div className="admin-root min-h-screen bg-theme-primary text-theme-primary overflow-x-hidden">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`content-with-sidebar min-h-screen min-w-0 transition-all duration-300 ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="w-full min-w-0 overflow-x-hidden px-4 py-6">
          {children}
        </main>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onPageChange={handlePageChange}
      />

      {showAIWidget && <AIChatWidget />}
    </div>
  );
}

export default AdminLayout;
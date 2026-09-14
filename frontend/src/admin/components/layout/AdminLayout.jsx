import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AIChatWidget from "../common/AIChatWidget";

function AdminLayout({
  currentPage,
  onPageChange,
  children,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Keep sidebar behavior correct on window resize
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
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop — only visible on mobile/tablet when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`content-with-sidebar min-h-screen min-w-0 transition-all duration-300 ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        {/* Page Content */}
        <main className="w-full min-w-0 overflow-x-hidden px-4 py-6">
          {children}
        </main>
      </div>

      {/* Floating AI Chat */}
      {showAIWidget && <AIChatWidget />}
    </div>
  );
}

export default AdminLayout;
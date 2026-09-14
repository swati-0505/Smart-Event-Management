// AdminLayout.jsx
// Main layout — responsive sidebar, swipe gestures, CommandPalette, AI chat.

import { useState, useEffect, useRef } from "react";
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
}) {
  // Sidebar state — open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });

  // Command Palette state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Handle page change — close sidebar on mobile
  function handlePageChange(page) {
    onPageChange(page);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  // Global Ctrl+K / Cmd+K listener for Command Palette
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

  // Auto-close sidebar on mobile when page changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [currentPage]);

  // Handle viewport resize
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

  // Touch swipe gestures for mobile sidebar
  useEffect(() => {
    function onTouchStart(e) {
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
    }

    function onTouchEnd(e) {
      const endX = e.changedTouches[0].screenX;
      const endY = e.changedTouches[0].screenY;
      const diffX = endX - touchStartX.current;
      const diffY = endY - touchStartY.current;

      // Only trigger on mostly-horizontal swipe
      if (Math.abs(diffY) > 60) return;

      // Swipe right from left edge → open
      if (diffX > 60 && touchStartX.current < 30 && !sidebarOpen) {
        setSidebarOpen(true);
      }
      // Swipe left → close
      if (diffX < -60 && sidebarOpen) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [sidebarOpen]);

  const showAIWidget = currentPage !== "ai-assistant";

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-primary text-theme-primary">
      {/* Backdrop overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — shifts on desktop */}
      <div
        className={[
          "transition-[padding-left] duration-300 ease-in-out",
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-0",
        ].join(" ")}
      >
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onMenuClick={() => setSidebarOpen((v) => !v)}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onPageChange={handlePageChange}
      />

      {/* Floating AI Chat */}
      {showAIWidget && <AIChatWidget />}
    </div>
  );
}

export default AdminLayout;
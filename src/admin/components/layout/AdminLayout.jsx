// AdminLayout.jsx
// Main layout — toggle button passed to Navbar (no overlap).

import { useState, useEffect, useRef } from "react";
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
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [currentPage]);

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

  // Touch swipe gestures
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

      if (Math.abs(diffY) > 60) return;
      if (diffX > 60 && touchStartX.current < 30 && !sidebarOpen) setSidebarOpen(true);
      if (diffX < -60 && sidebarOpen) setSidebarOpen(false);
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
    <div className="min-h-screen bg-theme-primary text-theme-primary">
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
        onPageChange={onPageChange}
        sidebarOpen={sidebarOpen}
      />

      {/* Main content */}
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
        />

        <main className="px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

      {showAIWidget && <AIChatWidget />}
    </div>
  );
}

export default AdminLayout;
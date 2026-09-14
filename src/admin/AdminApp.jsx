// AdminApp.jsx
// Main admin application with page navigation and theme control.

import { useState, useEffect } from "react";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import Events from "./pages/Events";
import Registrations from "./pages/Registrations";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";

function AdminApp() {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("admin-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", theme === "light");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function renderPage() {
    switch (currentPage) {
      case "calendar":
        return <CalendarPage />;
      case "events":
        return <Events searchQuery={searchQuery} />;
      case "registrations":
        return <Registrations searchQuery={searchQuery} />;
      case "users":
        return <Users searchQuery={searchQuery} />;
      case "reports":
        return <Reports searchQuery={searchQuery} />;
      case "ai-assistant":
        return <AIAssistant searchQuery={searchQuery} />;
      case "settings":
        return (
          <Settings
            searchQuery={searchQuery}
            theme={theme}
            onThemeChange={setTheme}
          />
        );
      case "home":
      default:
        return <Home searchQuery={searchQuery} onPageChange={setCurrentPage} />;
    }
  }

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      {renderPage()}
    </AdminLayout>
  );
}

export default AdminApp;
// AdminApp.jsx
// Main admin application component.
// Manages page navigation, search state, and theme.

import { useState, useEffect } from "react";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Venues from "./pages/Venues";
import Registrations from "./pages/Registrations";
import Payments from "./pages/Payments";
import Feedback from "./pages/Feedback";
import Users from "./pages/Users";
import AIAssistant from "./pages/AIAssistant";
import AgentActivity from "./pages/AgentActivity";
import Settings from "./pages/Settings";

function AdminApp() {
  // State for current page and search query
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Theme state (dark is default)
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("admin-theme");
    return savedTheme || "dark";
  });

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", theme === "light");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  // Toggle theme function
  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // Function to render the current page
  function renderPage() {
    switch (currentPage) {
      case "events":
        return <Events searchQuery={searchQuery} />;

      case "venues":
        return <Venues searchQuery={searchQuery} />;

      case "registrations":
        return <Registrations searchQuery={searchQuery} />;

      case "payments":
        return <Payments searchQuery={searchQuery} />;

      case "feedback":
        return <Feedback searchQuery={searchQuery} />;

      case "users":
        return <Users searchQuery={searchQuery} />;

      case "ai-assistant":
        return <AIAssistant searchQuery={searchQuery} />;

      case "agent-activity":
        return <AgentActivity searchQuery={searchQuery} />;

      case "settings":
        return <Settings searchQuery={searchQuery} />;

      case "dashboard":
      default:
        return <Dashboard searchQuery={searchQuery} />;
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
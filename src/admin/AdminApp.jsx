import { useState, useEffect } from "react";
import AdminLayout from "./components/layout/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
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
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("admin-token");
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", theme === "light");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function handleLoginSuccess() {
    setIsLoggedIn(true);
  }

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

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminLayout
      currentPage={currentPage}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      theme={theme}
      toggleTheme={toggleTheme}
    >
      {renderPage()}
    </AdminLayout>
  );
}

export default AdminApp;
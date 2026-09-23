// AdminApp.jsx
// Main admin app — auth gate + page routing + theme control.

import { useState, useEffect } from "react";
import AdminLayout from "./components/layout/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import Events from "./pages/Events";
import Registrations from "./pages/Registrations";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Speakers from "./pages/Speakers";
import Venues from "./pages/Venues";
import Tickets from "./pages/Tickets";
import Communications from "./pages/Communications";
import Feedback from "./pages/Feedback";

// Page registry — cleaner than switch
const PAGES = {
  calendar: CalendarPage,
  events: Events,
  registrations: Registrations,
  users: Users,
  speakers: Speakers,
  venues: Venues,
  tickets: Tickets,
  communications: Communications,
  feedback: Feedback,
  reports: Reports,
  "ai-assistant": AIAssistant,
  settings: Settings,
};

const AUTH_KEYS = [
  "admin-auth-token",
  "admin-name",
  "admin-email",
  "admin-role",
];

function AdminApp() {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("admin-theme") || "light"
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("admin-auth-token")
  );

  // Sync theme on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", theme === "light");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleLogout = () => {
    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
    setIsLoggedIn(false);
  };

  // Auth gate
  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const Page = PAGES[currentPage] || Home;

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
    >
      <Page onPageChange={setCurrentPage} />
    </AdminLayout>
  );
}

export default AdminApp;
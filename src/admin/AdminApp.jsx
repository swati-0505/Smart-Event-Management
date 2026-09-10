// AdminApp.jsx
// Main admin application component.
// Manages page navigation, search, theme, and global admin settings.

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
  // =========================================================
  // PAGE & SEARCH
  // =========================================================

  const [currentPage, setCurrentPage] = useState("dashboard");

  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================
  // GLOBAL THEME
  // =========================================================

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("admin-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return "dark";
  });

  // =========================================================
  // ADMIN SETTINGS
  // =========================================================

  const [adminSettings, setAdminSettings] = useState(() => {
    const savedSettings = localStorage.getItem("admin-settings");

    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        // If saved data is corrupted, use defaults.
      }
    }

    return {
      siteName: "SmartEvent",
      siteUrl: "https://smartevent.com",

      maintenanceMode: false,

      emailNotifications: true,
      pushNotifications: false,

      language: "en",

      twoFactorAuth: true,
    };
  });

  // =========================================================
  // APPLY THEME
  // =========================================================

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("light-mode", theme === "light");

    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  // =========================================================
  // SAVE ADMIN SETTINGS
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      "admin-settings",
      JSON.stringify(adminSettings)
    );
  }, [adminSettings]);

  // =========================================================
  // THEME TOGGLE
  // =========================================================

  function toggleTheme() {
    setTheme((previousTheme) =>
      previousTheme === "dark" ? "light" : "dark"
    );
  }

  // =========================================================
  // UPDATE SETTINGS
  // =========================================================

  function updateSettings(updates) {
    setAdminSettings((previousSettings) => ({
      ...previousSettings,
      ...updates,
    }));
  }

  // =========================================================
  // CHANGE THEME FROM SETTINGS PAGE
  // =========================================================

  function handleSettingsThemeChange(newTheme) {
    if (newTheme !== "dark" && newTheme !== "light") {
      return;
    }

    setTheme(newTheme);
  }

  // =========================================================
  // PAGE RENDER
  // =========================================================

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
        return (
          <Settings
            theme={theme}
            onThemeChange={handleSettingsThemeChange}
            settings={adminSettings}
            onSettingsChange={updateSettings}
          />
        );

      case "dashboard":
      default:
        return <Dashboard searchQuery={searchQuery} />;
    }
  }

  // =========================================================
  // APP
  // =========================================================

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
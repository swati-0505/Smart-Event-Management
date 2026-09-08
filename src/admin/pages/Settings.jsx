// Settings.jsx
// Admin settings page for configuration.

import { useState } from "react";
import { Bell, Globe, Lock, Moon, Save, Shield } from "lucide-react";

function Settings() {
  // State for settings
  const [settings, setSettings] = useState({
    siteName: "SmartEvent",
    siteUrl: "https://smartevent.com",
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: false,
    theme: "dark",
    language: "en",
    twoFactorAuth: true,
  });

  // Handle input changes
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Handle save
  function handleSave(event) {
    event.preventDefault();
    // Later: Save to backend API
    alert("Settings saved successfully!");
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          System
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Configure system settings and preferences.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Globe size={16} className="text-[#d7a63a]" />
            General Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Site URL
              </label>
              <input
                type="url"
                name="siteUrl"
                value={settings.siteUrl}
                onChange={handleChange}
                className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Maintenance Mode</p>
                <p className="text-xs text-white/30">Temporarily disable site access</p>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="h-4 w-4 accent-[#d7a63a]"
              />
            </div>
          </form>
        </section>

        {/* Notification Settings */}
        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Bell size={16} className="text-[#d7a63a]" />
            Notification Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Email Notifications</p>
                <p className="text-xs text-white/30">Receive email updates</p>
              </div>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="h-4 w-4 accent-[#d7a63a]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Push Notifications</p>
                <p className="text-xs text-white/30">Receive browser notifications</p>
              </div>
              <input
                type="checkbox"
                name="pushNotifications"
                checked={settings.pushNotifications}
                onChange={handleChange}
                className="h-4 w-4 accent-[#d7a63a]"
              />
            </div>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Moon size={16} className="text-[#d7a63a]" />
            Appearance
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Theme
              </label>
              <select
                name="theme"
                value={settings.theme}
                onChange={handleChange}
                className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Language
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Shield size={16} className="text-[#d7a63a]" />
            Security Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Two-Factor Authentication</p>
                <p className="text-xs text-white/30">Extra security layer</p>
              </div>
              <input
                type="checkbox"
                name="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onChange={handleChange}
                className="h-4 w-4 accent-[#d7a63a]"
              />
            </div>

            <div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/60 transition hover:bg-white/[0.05]"
              >
                <Lock size={14} />
                Change Password
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-md bg-[#d7a63a] px-6 py-3 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#e3b957]"
        >
          <Save size={16} />
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
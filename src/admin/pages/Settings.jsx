// Settings.jsx
// Admin settings page for configuration.

import { useEffect, useState } from "react";
import {
  Bell,
  Globe,
  Lock,
  Moon,
  Save,
  Shield,
} from "lucide-react";

function Settings({
  theme,
  onThemeChange,
  settings,
  onSettingsChange,
}) {
  // =========================================================
  // LOCAL FORM STATE
  // =========================================================

  const [formSettings, setFormSettings] = useState(settings);

  // =========================================================
  // SAVE STATUS
  // =========================================================

  const [saveMessage, setSaveMessage] = useState("");

  // =========================================================
  // KEEP FORM IN SYNC WITH GLOBAL SETTINGS
  // =========================================================

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormSettings((previousSettings) => ({
      ...previousSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // =========================================================
  // HANDLE THEME CHANGE
  // =========================================================

  function handleThemeChange(event) {
    const newTheme = event.target.value;

    onThemeChange(newTheme);
  }

  // =========================================================
  // HANDLE SAVE
  // =========================================================

  function handleSave(event) {
    event.preventDefault();

    onSettingsChange(formSettings);

    setSaveMessage("Settings saved successfully!");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  }

  // =========================================================
  // MAINTENANCE MODE TOGGLE
  // =========================================================

  function handleMaintenanceToggle(event) {
    const enabled = event.target.checked;

    setFormSettings((previousSettings) => ({
      ...previousSettings,
      maintenanceMode: enabled,
    }));
  }

  // =========================================================
  // TWO FACTOR AUTHENTICATION TOGGLE
  // =========================================================

  function handleTwoFactorToggle(event) {
    const enabled = event.target.checked;

    setFormSettings((previousSettings) => ({
      ...previousSettings,
      twoFactorAuth: enabled,
    }));
  }

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          System
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-theme-primary sm:text-[34px]">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-theme-muted">
              Configure system settings and preferences.
            </p>
          </div>
        </div>
      </header>

      {/* =====================================================
          SETTINGS GRID
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ===================================================
            GENERAL SETTINGS
        ==================================================== */}

        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-theme-primary">
            <Globe size={16} className="text-theme-accent" />

            General Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-4">

            {/* Site Name */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                Site Name
              </label>

              <input
                type="text"
                name="siteName"
                value={formSettings.siteName}
                onChange={handleChange}
                className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
              />
            </div>

            {/* Site URL */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                Site URL
              </label>

              <input
                type="url"
                name="siteUrl"
                value={formSettings.siteUrl}
                onChange={handleChange}
                className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
              />
            </div>

            {/* =================================================
                MAINTENANCE MODE
            ================================================== */}

            <div className="flex items-center justify-between gap-4 pt-2">
              <div>
                <p className="text-sm text-theme-secondary">
                  Maintenance Mode
                </p>

                <p className="text-xs text-theme-muted">
                  Temporarily disable site access
                </p>
              </div>

              <div className="neo-toggle-container maintenance-toggle">
                <input
                  className="neo-toggle-input"
                  id="maintenance-toggle"
                  name="maintenanceMode"
                  type="checkbox"
                  checked={formSettings.maintenanceMode}
                  onChange={handleMaintenanceToggle}
                />

                <label
                  className="neo-toggle"
                  htmlFor="maintenance-toggle"
                  aria-label="Toggle Maintenance Mode"
                >
                  <div className="neo-track">
                    <div className="neo-background-layer"></div>
                    <div className="neo-grid-layer"></div>

                    <div className="neo-spectrum-analyzer">
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                    </div>

                    <div className="neo-track-highlight"></div>
                  </div>

                  <div className="neo-thumb">
                    <div className="neo-thumb-ring"></div>

                    <div className="neo-thumb-core">
                      <div className="neo-thumb-icon">
                        <div className="neo-thumb-wave"></div>
                        <div className="neo-thumb-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="neo-gesture-area"></div>

                  <div className="neo-interaction-feedback">
                    <div className="neo-ripple"></div>
                    <div className="neo-progress-arc"></div>
                  </div>

                  <div className="neo-status">
                    <div className="neo-status-indicator">
                      <div className="neo-status-dot"></div>
                      <div className="neo-status-text"></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </section>

        {/* ===================================================
            NOTIFICATION SETTINGS
        ==================================================== */}

        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-theme-primary">
            <Bell size={16} className="text-theme-accent" />

            Notification Settings
          </h2>

          <div className="space-y-5">

            {/* =================================================
                EMAIL NOTIFICATIONS
            ================================================== */}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-theme-secondary">
                  Email Notifications
                </p>

                <p className="text-xs text-theme-muted">
                  Receive email updates
                </p>
              </div>

              <div className="neo-toggle-container email-toggle">
                <input
                  className="neo-toggle-input"
                  id="email-toggle"
                  name="emailNotifications"
                  type="checkbox"
                  checked={formSettings.emailNotifications}
                  onChange={handleChange}
                />

                <label
                  className="neo-toggle"
                  htmlFor="email-toggle"
                  aria-label="Toggle Email Notifications"
                >
                  <div className="neo-track">
                    <div className="neo-background-layer"></div>
                    <div className="neo-grid-layer"></div>

                    <div className="neo-spectrum-analyzer">
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                    </div>

                    <div className="neo-track-highlight"></div>
                  </div>

                  <div className="neo-thumb">
                    <div className="neo-thumb-ring"></div>

                    <div className="neo-thumb-core">
                      <div className="neo-thumb-icon">
                        <div className="neo-thumb-wave"></div>
                        <div className="neo-thumb-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="neo-gesture-area"></div>

                  <div className="neo-interaction-feedback">
                    <div className="neo-ripple"></div>
                    <div className="neo-progress-arc"></div>
                  </div>

                  <div className="neo-status">
                    <div className="neo-status-indicator">
                      <div className="neo-status-dot"></div>
                      <div className="neo-status-text"></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* =================================================
                PUSH NOTIFICATIONS
            ================================================== */}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-theme-secondary">
                  Push Notifications
                </p>

                <p className="text-xs text-theme-muted">
                  Receive browser notifications
                </p>
              </div>

              <div className="neo-toggle-container push-toggle">
                <input
                  className="neo-toggle-input"
                  id="push-toggle"
                  name="pushNotifications"
                  type="checkbox"
                  checked={formSettings.pushNotifications}
                  onChange={handleChange}
                />

                <label
                  className="neo-toggle"
                  htmlFor="push-toggle"
                  aria-label="Toggle Push Notifications"
                >
                  <div className="neo-track">
                    <div className="neo-background-layer"></div>
                    <div className="neo-grid-layer"></div>

                    <div className="neo-spectrum-analyzer">
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                    </div>

                    <div className="neo-track-highlight"></div>
                  </div>

                  <div className="neo-thumb">
                    <div className="neo-thumb-ring"></div>

                    <div className="neo-thumb-core">
                      <div className="neo-thumb-icon">
                        <div className="neo-thumb-wave"></div>
                        <div className="neo-thumb-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="neo-gesture-area"></div>

                  <div className="neo-interaction-feedback">
                    <div className="neo-ripple"></div>
                    <div className="neo-progress-arc"></div>
                  </div>

                  <div className="neo-status">
                    <div className="neo-status-indicator">
                      <div className="neo-status-dot"></div>
                      <div className="neo-status-text"></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            APPEARANCE SETTINGS
        ==================================================== */}

        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-theme-primary">
            <Moon size={16} className="text-theme-accent" />

            Appearance
          </h2>

          <div className="space-y-4">

            {/* Theme */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                Theme
              </label>

              <select
                name="theme"
                value={theme}
                onChange={handleThemeChange}
                className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
              >
                <option value="dark">
                  Dark Mode
                </option>

                <option value="light">
                  Light Mode
                </option>
              </select>
            </div>

            {/* Language */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
                Language
              </label>

              <select
                name="language"
                value={formSettings.language}
                onChange={handleChange}
                className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none transition focus:border-theme-accent/40"
              >
                <option value="en">
                  English
                </option>

                <option value="hi">
                  Hindi
                </option>

                <option value="te">
                  Telugu
                </option>

                <option value="ta">
                  Tamil
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* ===================================================
            SECURITY SETTINGS
        ==================================================== */}

        <section className="admin-section p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-theme-primary">
            <Shield size={16} className="text-theme-accent" />

            Security Settings
          </h2>

          <div className="space-y-5">

            {/* =================================================
                TWO FACTOR AUTHENTICATION
            ================================================== */}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-theme-secondary">
                  Two-Factor Authentication
                </p>

                <p className="text-xs text-theme-muted">
                  Extra security layer
                </p>
              </div>

              <div className="neo-toggle-container security-toggle">
                <input
                  className="neo-toggle-input"
                  id="security-toggle"
                  name="twoFactorAuth"
                  type="checkbox"
                  checked={formSettings.twoFactorAuth}
                  onChange={handleTwoFactorToggle}
                />

                <label
                  className="neo-toggle"
                  htmlFor="security-toggle"
                  aria-label="Toggle Two-Factor Authentication"
                >
                  <div className="neo-track">
                    <div className="neo-background-layer"></div>
                    <div className="neo-grid-layer"></div>

                    <div className="neo-spectrum-analyzer">
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                      <div className="neo-spectrum-bar"></div>
                    </div>

                    <div className="neo-track-highlight"></div>
                  </div>

                  <div className="neo-thumb">
                    <div className="neo-thumb-ring"></div>

                    <div className="neo-thumb-core">
                      <div className="neo-thumb-icon">
                        <div className="neo-thumb-wave"></div>
                        <div className="neo-thumb-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="neo-gesture-area"></div>

                  <div className="neo-interaction-feedback">
                    <div className="neo-ripple"></div>
                    <div className="neo-progress-arc"></div>
                  </div>

                  <div className="neo-status">
                    <div className="neo-status-indicator">
                      <div className="neo-status-dot"></div>
                      <div className="neo-status-text"></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Change Password */}

            <div>
              <button
                type="button"
                onClick={() => {
                  alert("Change Password feature will be connected to the backend.");
                }}
                className="inline-flex items-center gap-2 rounded-md border border-theme px-3 py-2 text-xs text-theme-secondary transition hover:bg-theme-primary/5"
              >
                <Lock size={14} />

                Change Password
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          SAVE BUTTON
      ====================================================== */}

      <div className="mt-6 flex items-center justify-end gap-4">

        {/* Save message */}

        {saveMessage && (
          <p className="text-xs font-medium text-theme-accent">
            {saveMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-md bg-theme-accent px-6 py-3 text-sm font-semibold text-theme-primary transition hover:bg-theme-accent-hover"
        >
          <Save size={16} />

          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
// Settings.jsx
// Fully responsive settings page.
// Mobile: stacked cards + sticky save | Desktop: 2-col grid

import { useState, useEffect } from "react";
import {
  Globe, Bell, Lock, Save, Shield, Palette,
  Mail, Smartphone, AlertTriangle, RefreshCw, Check,
} from "lucide-react";
import { getSettings, updateSettings } from "../services/settingsService";

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setError("Failed to load settings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Reusable toggle ---------- */
  function Toggle({ name, checked, onChange, variant = "" }) {
    return (
      <label className={`toggle-switch ${variant}`}>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} />
        <span className="toggle-slider" />
      </label>
    );
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-xs text-theme-muted sm:text-sm">
            Loading settings...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse p-5 sm:p-6">
              <div className="h-5 w-32 rounded bg-theme-tertiary" />
              <div className="mt-4 space-y-3">
                <div className="h-10 w-full rounded-xl bg-theme-tertiary" />
                <div className="h-10 w-full rounded-xl bg-theme-tertiary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
          Settings
        </h1>
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={load} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ============ HEADER ============ */}
      <div>
        <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-xs text-theme-muted sm:text-sm">
          Manage system preferences and configuration.
        </p>
      </div>

      {/* ============ GRID ============ */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* ---- Preferences ---- */}
        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5">
            <Palette size={16} className="text-indigo-600 sm:hidden" />
            <Palette size={18} className="hidden text-indigo-600 sm:block" />
            <h2 className="text-sm font-bold text-theme-primary sm:text-base">
              Preferences
            </h2>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
              Language
            </label>
            <select
              name="language"
              value={settings.language}
              onChange={handleChange}
              className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>

        {/* ---- General ---- */}
        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5">
            <Globe size={16} className="text-indigo-600 sm:hidden" />
            <Globe size={18} className="hidden text-indigo-600 sm:block" />
            <h2 className="text-sm font-bold text-theme-primary sm:text-base">
              General
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-theme-secondary">
                Site URL
              </label>
              <input
                type="url"
                name="siteUrl"
                value={settings.siteUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <AlertTriangle size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-primary sm:text-sm">
                    Maintenance Mode
                  </p>
                  <p className="truncate text-[10px] text-theme-muted sm:text-xs">
                    Disable public access
                  </p>
                </div>
              </div>
              <Toggle
                name="maintenance"
                checked={settings.maintenance}
                onChange={handleChange}
                variant="toggle-orange"
              />
            </div>
          </div>
        </div>

        {/* ---- Notifications ---- */}
        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5">
            <Bell size={16} className="text-indigo-600 sm:hidden" />
            <Bell size={18} className="hidden text-indigo-600 sm:block" />
            <h2 className="text-sm font-bold text-theme-primary sm:text-base">
              Notifications
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-primary sm:text-sm">
                    Email Notifications
                  </p>
                  <p className="truncate text-[10px] text-theme-muted sm:text-xs">
                    Updates via email
                  </p>
                </div>
              </div>
              <Toggle
                name="emailNotif"
                checked={settings.emailNotif}
                onChange={handleChange}
                variant="toggle-green"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Smartphone size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-primary sm:text-sm">
                    Push Notifications
                  </p>
                  <p className="truncate text-[10px] text-theme-muted sm:text-xs">
                    Browser alerts
                  </p>
                </div>
              </div>
              <Toggle
                name="pushNotif"
                checked={settings.pushNotif}
                onChange={handleChange}
                variant="toggle-green"
              />
            </div>
          </div>
        </div>

        {/* ---- Security ---- */}
        <div className="card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-5">
            <Shield size={16} className="text-indigo-600 sm:hidden" />
            <Shield size={18} className="hidden text-indigo-600 sm:block" />
            <h2 className="text-sm font-bold text-theme-primary sm:text-base">
              Security
            </h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-primary sm:text-sm">
                    Two-Factor Auth
                  </p>
                  <p className="truncate text-[10px] text-theme-muted sm:text-xs">
                    Extra security layer
                  </p>
                </div>
              </div>
              <Toggle
                name="twoFactor"
                checked={settings.twoFactor}
                onChange={handleChange}
                variant="toggle-red"
              />
            </div>
            <button
              type="button"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-4 text-xs font-semibold text-theme-secondary transition hover:border-indigo-300 hover:text-indigo-600 sm:text-sm"
            >
              <Lock size={14} /> Change Password
            </button>
          </div>
        </div>
      </div>

      {/* ============ SAVE BUTTON ============ */}
      <div className="sticky bottom-4 z-20 flex justify-end sm:static sm:bottom-auto">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full text-xs shadow-lg disabled:opacity-50 sm:w-auto sm:text-sm sm:shadow-none"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default Settings;
// Settings.jsx
// Admin settings — service-driven, backend-ready.

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

  function Toggle({ name, checked, onChange, variant = "" }) {
    return (
      <label className={`toggle-switch ${variant}`}>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} />
        <span className="toggle-slider" />
      </label>
    );
  }

  if (loading) {
    return (
      <div className="card p-12 text-center text-sm text-theme-muted">
        Loading settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button type="button" onClick={load} className="btn-primary">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">Settings</h1>
        <p className="mt-1 text-sm text-theme-muted">
          Manage system preferences and configuration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preferences */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Palette size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-theme-primary">Preferences</h2>
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

        {/* General */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-theme-primary">General</h2>
          </div>
          <div className="space-y-4">
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
            <div className="flex items-center justify-between rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-theme-muted">Disable public access</p>
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

        {/* Notifications */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-theme-primary">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary">
                    Email Notifications
                  </p>
                  <p className="text-xs text-theme-muted">Updates via email</p>
                </div>
              </div>
              <Toggle
                name="emailNotif"
                checked={settings.emailNotif}
                onChange={handleChange}
                variant="toggle-green"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Smartphone size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary">
                    Push Notifications
                  </p>
                  <p className="text-xs text-theme-muted">Browser alerts</p>
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

        {/* Security */}
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Shield size={18} className="text-indigo-600" />
            <h2 className="text-base font-bold text-theme-primary">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-theme bg-theme-tertiary p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme-primary">
                    Two-Factor Auth
                  </p>
                  <p className="text-xs text-theme-muted">Extra security layer</p>
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-4 py-2.5 text-sm font-semibold text-theme-secondary transition hover:border-indigo-300 hover:text-indigo-600"
            >
              <Lock size={14} /> Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default Settings;
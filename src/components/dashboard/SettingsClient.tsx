'use client';

import React, { useState } from 'react';
import { Save, Info, Sliders, CheckCircle } from 'lucide-react';

interface SettingsType {
  siteName: string;
  logo: string;
  primaryColor: string;
  newsletterEnabled: boolean;
  audioEnabled: boolean;
  aiSummaryEnabled: boolean;
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
  };
  seoDefaults: {
    title: string;
    description: string;
  };
  analyticsScript: string;
}

interface SettingsClientProps {
  initialSettings: SettingsType;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SettingsType>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const field = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }));
    } else if (name.startsWith('seo.')) {
      const field = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        seoDefaults: { ...prev.seoDefaults, [field]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (field: 'newsletterEnabled' | 'audioEnabled' | 'aiSummaryEnabled') => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccessMsg('Settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure site metrics, default metadata, and styling variables.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
        {/* Success Alert banner */}
        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg flex items-center gap-2 text-sm font-bold animate-pulse">
            <CheckCircle className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Global Settings Section */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-3">
            <Sliders className="h-4.5 w-4.5 text-primary" /> Global Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Brand Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  required
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
                />
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="h-9 w-9 rounded-md border border-border cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Toggle Toggles Section */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-3">
            Feature Toggles
          </h3>

          <div className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <div>
                <p className="font-bold text-foreground">Newsletter Subscription</p>
                <p className="text-xs text-muted-foreground">Enable subscriber collection inputs and forms.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('newsletterEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.newsletterEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.newsletterEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-bold text-foreground">AI Summaries</p>
                <p className="text-xs text-muted-foreground">Display takeaways blocks generated by Google Gemini.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('aiSummaryEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.aiSummaryEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.aiSummaryEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 last:pb-0">
              <div>
                <p className="font-bold text-foreground">Audio Articles</p>
                <p className="text-xs text-muted-foreground">Enable text-to-speech audio players for readers.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('audioEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.audioEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.audioEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* SEO Customization Defaults Section */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-3">
            SEO Defaults
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Meta Title Template</label>
              <input
                type="text"
                name="seo.title"
                value={settings.seoDefaults.title}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Meta Description</label>
              <textarea
                name="seo.description"
                value={settings.seoDefaults.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Link Directories Section */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-3">
            Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Twitter / X</label>
              <input
                type="url"
                name="social.twitter"
                value={settings.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">LinkedIn</label>
              <input
                type="url"
                name="social.linkedin"
                value={settings.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">GitHub</label>
              <input
                type="url"
                name="social.github"
                value={settings.socialLinks.github}
                onChange={handleChange}
                placeholder="https://github.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Custom Script Block */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-3">
            Analytics scripts
          </h3>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Head Analytics Embed Code</label>
            <textarea
              name="analyticsScript"
              value={settings.analyticsScript}
              onChange={handleChange}
              placeholder="<!-- Google Analytics / Plausible script embed -->"
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono focus:outline-hidden focus:border-primary resize-none"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Will be injected safely into pages. Don't add arbitrary executable JS codes.</span>
            </div>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 font-bold bg-primary text-black hover:bg-primary/95 transition-all rounded-lg shadow-md cursor-pointer disabled:opacity-40"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

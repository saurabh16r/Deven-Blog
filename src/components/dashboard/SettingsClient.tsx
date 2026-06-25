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
    <div className="space-y-6 text-sm">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black tracking-tight">Settings</h1>
          <p className="text-muted text-xs font-sans font-medium">Configure site metrics, default metadata, and styling variables.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl font-sans">
        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-600 rounded-lg flex items-center gap-2 font-bold font-sans">
            <CheckCircle className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Global Settings Section */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted flex items-center gap-1.5 border-b border-border pb-3 select-none">
            <Sliders className="h-4.5 w-4.5 text-primary" /> Global Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Brand Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  required
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-primary text-foreground"
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

        {/* Features Toggle Section */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted border-b border-border pb-3 select-none">
            Feature Toggles
          </h3>

          <div className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <div>
                <p className="font-bold text-foreground">Newsletter Subscription</p>
                <p className="text-xs text-muted font-medium">Enable subscriber collection inputs and forms.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('newsletterEnabled')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.newsletterEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                  settings.newsletterEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-bold text-foreground">AI Summaries</p>
                <p className="text-xs text-muted font-medium">Display takeaways blocks generated by Google Gemini.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('aiSummaryEnabled')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.aiSummaryEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                  settings.aiSummaryEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 last:pb-0">
              <div>
                <p className="font-bold text-foreground">Audio Articles</p>
                <p className="text-xs text-muted font-medium">Enable text-to-speech audio players for readers.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('audioEnabled')}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.audioEnabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-background transition-transform ${
                  settings.audioEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* SEO Customization Defaults Section */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted border-b border-border pb-3 select-none">
            SEO Defaults
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Meta Title Template</label>
              <input
                type="text"
                name="seo.title"
                value={settings.seoDefaults.title}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Meta Description</label>
              <textarea
                name="seo.description"
                value={settings.seoDefaults.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 focus:outline-hidden focus:border-primary resize-none text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Social Link Directories Section */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted border-b border-border pb-3 select-none">
            Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Twitter / X</label>
              <input
                type="url"
                name="social.twitter"
                value={settings.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">LinkedIn</label>
              <input
                type="url"
                name="social.linkedin"
                value={settings.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">GitHub</label>
              <input
                type="url"
                name="social.github"
                value={settings.socialLinks.github}
                onChange={handleChange}
                placeholder="https://github.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-primary text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Custom Script Block */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted border-b border-border pb-3 select-none">
            Analytics scripts
          </h3>
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Head Analytics Embed Code</label>
            <textarea
              name="analyticsScript"
              value={settings.analyticsScript}
              onChange={handleChange}
              placeholder="<!-- Google Analytics embed -->"
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 font-mono text-xs focus:outline-hidden focus:border-primary resize-none text-foreground"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted select-none">
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
            className="inline-flex items-center justify-center px-6 py-3 font-bold bg-primary hover:bg-primary-hover text-primary-foreground transition-colors rounded-lg cursor-pointer disabled:opacity-40"
          >
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

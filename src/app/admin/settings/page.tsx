import React from 'react';
import connectDB from '@/lib/db';
import { Setting } from '@/lib/models';
import SettingsClient from '@/components/dashboard/SettingsClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  let settings = null;

  try {
    await connectDB();
    const dbSettings = await Setting.findOne().lean();
    if (dbSettings) {
      settings = JSON.parse(JSON.stringify(dbSettings));
    }
  } catch (error) {
    console.warn('Database connection failed loading settings inside SSR, falling back to mock default settings.', error);
  }

  if (!settings) {
    settings = {
      siteName: 'FounderBrief',
      logo: '',
      primaryColor: '#FFC247',
      newsletterEnabled: true,
      audioEnabled: true,
      aiSummaryEnabled: true,
      socialLinks: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com', github: 'https://github.com' },
      seoDefaults: {
        title: 'FounderBrief - The smartest startup insights',
        description: 'Actionable startup breakdowns delivered weekly.'
      },
      analyticsScript: ''
    };
  }

  return <SettingsClient initialSettings={settings} />;
}

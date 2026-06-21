import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Setting } from '@/lib/models';

const defaultSettings = {
  _id: 'default',
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

export async function GET() {
  try {
    await connectDB();
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(defaultSettings);
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.warn('Database error, returning mock settings', error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    try {
      await connectDB();
      let settings = await Setting.findOne();
      if (!settings) {
        settings = new Setting(body);
      } else {
        Object.assign(settings, body);
      }
      await settings.save();
      return NextResponse.json(settings);
    } catch {
      Object.assign(defaultSettings, body);
      return NextResponse.json(defaultSettings);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import mongoose, { Schema } from 'mongoose';

const SettingSchema = new Schema({
  siteName: { type: String, default: 'FounderBrief' },
  logo: { type: String, default: '' },
  primaryColor: { type: String, default: '#FFC247' },
  newsletterEnabled: { type: Boolean, default: true },
  audioEnabled: { type: Boolean, default: true },
  aiSummaryEnabled: { type: Boolean, default: true },
  socialLinks: {
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  seoDefaults: {
    title: { type: String, default: 'FounderBrief - The smartest startup insights' },
    description: { type: String, default: 'Actionable startup breakdowns delivered weekly.' }
  },
  analyticsScript: { type: String, default: '' }
});

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

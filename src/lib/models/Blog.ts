import mongoose, { Schema } from 'mongoose';

const BlogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },

  
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  
  isTrending: { type: Boolean, default: false },
  trendingRank: { type: Number, default: 0 },
  featuredTrending: { type: Boolean, default: false },
  
  views: { type: Number, default: 0 },
  readingTime: { type: Number, default: 5 },
  
  aiSummaryEnabled: { type: Boolean, default: true },
  audioEnabled: { type: Boolean, default: false },
  
  aiSummary: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  ogImage: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

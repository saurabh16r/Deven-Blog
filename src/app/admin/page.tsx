import React from 'react';
import connectDB from '@/lib/db';
import { Blog, Subscriber } from '@/lib/models';
import { FileText, Users, Eye, ArrowUpRight, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  let stats = {
    totalBlogs: 0,
    totalSubscribers: 0,
    totalViews: 0,
    publishedCount: 0
  };
  let recentActivity: any[] = [];
  let recentSubs: any[] = [];

  await connectDB();
  const blogCount = await Blog.countDocuments();
  const subCount = await Subscriber.countDocuments();
  const publishedCount = await Blog.countDocuments({ published: true });
  
  // Sum views
  const viewStats = await Blog.aggregate([
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]);
  const totalViews = viewStats[0]?.totalViews || 0;

  stats = {
    totalBlogs: blogCount,
    totalSubscribers: subCount,
    totalViews,
    publishedCount
  };

  const latestBlogs = await Blog.find().sort({ createdAt: -1 }).limit(4).lean();
  recentActivity = JSON.parse(JSON.stringify(latestBlogs));

  const latestSubs = await Subscriber.find().sort({ subscribedAt: -1 }).limit(4).lean();
  recentSubs = JSON.parse(JSON.stringify(latestSubs));

  // Subscriber Growth Chart line coordinates (monochrome/gold accents)
  const linePoints = "M 50 120 L 130 102 L 210 85 L 290 68 L 370 41 L 450 25";

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-black tracking-tight">Overview</h1>
          <p className="text-muted text-sm font-sans font-medium">Welcome back. Here is what is happening with Deven.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg shadow-xs"
        >
          Create New Article
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Views Card */}
        <div className="bg-background border border-border p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted">Total Views</span>
            <h3 className="text-3xl font-serif font-black text-foreground">{stats.totalViews.toLocaleString()}</h3>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 font-sans">
              <TrendingUp className="h-3 w-3" /> +18.4% MoM
            </span>
          </div>
          <div className="h-10 w-10 border border-border text-muted rounded-lg flex items-center justify-center">
            <Eye className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
        </div>

        {/* Total Subscribers Card */}
        <div className="bg-background border border-border p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted">Total Subscribers</span>
            <h3 className="text-3xl font-serif font-black text-foreground">{stats.totalSubscribers.toLocaleString()}</h3>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 font-sans">
              <TrendingUp className="h-3 w-3" /> +24.8% MoM
            </span>
          </div>
          <div className="h-10 w-10 border border-border text-muted rounded-lg flex items-center justify-center">
            <Users className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
        </div>

        {/* Total Articles Card */}
        <div className="bg-background border border-border p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted">Total Articles</span>
            <h3 className="text-3xl font-serif font-black text-foreground">{stats.totalBlogs}</h3>
            <span className="text-[10px] text-muted font-bold font-sans">
              {stats.publishedCount} Published • {stats.totalBlogs - stats.publishedCount} Drafts
            </span>
          </div>
          <div className="h-10 w-10 border border-border text-muted rounded-lg flex items-center justify-center">
            <FileText className="h-4.5 w-4.5 stroke-[1.5]" />
          </div>
        </div>

      </div>

      {/* SVG Growth Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subscriber Growth Chart (SVG Line Chart) */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Subscriber Growth</h3>
            <p className="text-xs text-muted font-medium">Steady subscriber scale across the first half of 2026.</p>
          </div>
          
          <div className="relative w-full h-48 border border-border bg-background rounded-lg p-2.5">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              
              {/* Gold/charcoal path line */}
              <path
                d={linePoints}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Subtle accent color fill */}
              <path
                d={`${linePoints} L 450 120 L 50 120 Z`}
                fill="var(--primary)"
                opacity="0.04"
              />

              {/* Data points dots */}
              <circle cx="50" cy="120" r="3.5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1" />
              <circle cx="130" cy="102" r="3.5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1" />
              <circle cx="210" cy="85" r="3.5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1" />
              <circle cx="290" cy="68" r="3.5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1" />
              <circle cx="370" cy="41" r="3.5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1" />
              <circle cx="450" cy="25" r="3.5" fill="var(--primary)" stroke="var(--background)" strokeWidth="1" />

              {/* Labels */}
              <text x="50" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Jan</text>
              <text x="130" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Feb</text>
              <text x="210" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Mar</text>
              <text x="290" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Apr</text>
              <text x="370" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">May</text>
              <text x="450" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Jun</text>
            </svg>
          </div>
        </div>

        {/* Views Growth Chart (SVG Bar Chart) */}
        <div className="bg-background border border-border p-6 rounded-lg space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Traffic Analysis</h3>
            <p className="text-xs text-muted font-medium">Monthly readership views trajectory during launch.</p>
          </div>

          <div className="relative w-full h-48 border border-border bg-background rounded-lg p-2.5">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />

              {/* Bar mappings - neutral layout */}
              <rect x="35" y="105" width="28" height="25" rx="2" fill="var(--border)" />
              <rect x="115" y="90" width="28" height="40" rx="2" fill="var(--border)" />
              <rect x="195" y="75" width="28" height="55" rx="2" fill="var(--border)" />
              <rect x="275" y="60" width="28" height="70" rx="2" fill="var(--border)" />
              <rect x="355" y="40" width="28" height="90" rx="2" fill="var(--primary)" />
              <rect x="435" y="20" width="28" height="110" rx="2" fill="var(--primary)" />

              {/* Labels */}
              <text x="50" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Jan</text>
              <text x="130" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Feb</text>
              <text x="210" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Mar</text>
              <text x="290" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Apr</text>
              <text x="370" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">May</text>
              <text x="450" y="142" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="bold">Jun</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Grid: Recent Blogs & Recent Subscribers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent Blog Posts */}
        <div className="lg:col-span-8 bg-background border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Blog Posts</h3>
            <Link href="/admin/blogs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Manage Articles <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="divide-y divide-border">
            {recentActivity.map((article: any) => (
              <div key={article._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-foreground truncate">{article.title}</h4>
                  <div className="flex items-center space-x-3 text-xs text-muted font-semibold">
                    <span className="text-primary font-bold">{article.category}</span>
                    <span>•</span>
                    <span>{article.views} views</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    article.published 
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                      : 'bg-neutral-500/10 text-muted border border-neutral-500/20'
                  }`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    href={`/admin/blogs/${article._id}`}
                    className="p-1.5 border border-border rounded-md hover:bg-surface text-muted hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Recent Subscriber Signups */}
        <div className="lg:col-span-4 bg-background border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Signups</h3>
            <Link href="/admin/subscribers" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentSubs.map((sub: any) => (
              <div key={sub._id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col space-y-0.5">
                <p className="text-sm font-bold text-foreground truncate">{sub.email}</p>
                <p className="text-[10px] text-muted font-medium font-sans">
                  Subscribed on {new Date(sub.subscribedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

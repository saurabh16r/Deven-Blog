'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ArticleCard from '../blog/ArticleCard';
import { motion } from 'framer-motion';
import { Flame, Clock, Calendar, Eye, Send, ArrowRight, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface BlogType {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  featured: boolean;
  isTrending: boolean;
  trendingRank: number;
  featuredTrending: boolean;
  views: number;
  readingTime: number;
  createdAt: string;
}

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface HomeClientProps {
  initialBlogs: BlogType[];
  initialCategories: CategoryType[];
}

export default function HomeClient({ initialBlogs, initialCategories }: HomeClientProps) {
  const [blogs, setBlogs] = useState<BlogType[]>(initialBlogs);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // 1. Identify Featured Story
  const featuredStory = blogs.find(b => b.featured) || blogs[0];

  // 2. Identify Trending Stories (Rank 1 to 5)
  const trendingStories = blogs
    .filter(b => b.isTrending)
    .sort((a, b) => a.trendingRank - b.trendingRank)
    .slice(0, 5);

  const featuredTrending = trendingStories.find(b => b.featuredTrending) || trendingStories[0];
  const sideTrending = trendingStories.filter(b => b._id !== (featuredTrending?._id || ''));

  // 3. Filter Latest Articles by Category
  const latestArticles = blogs.filter(b => {
    if (selectedCategory === 'All') return true;
    return b.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setStatus('success');
      setEmail('');
      setMessage('Welcome aboard! You\'re officially on the list.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-24 border-b border-border bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        {/* Editorial Grid Backing */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-widest bg-primary/10 text-primary uppercase border border-primary/20">
              ✦ Startup Media Platform
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight leading-none text-foreground max-w-4xl mx-auto">
              The smartest startup insights in <span className="text-primary underline decoration-primary decoration-wavy underline-offset-8">5 minutes</span>.
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Actionable startup breakdowns, AI trends, growth strategies, fundraising lessons, and founder stories delivered weekly.
            </p>
          </motion.div>

          {/* Hero Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-md mx-auto space-y-3"
          >
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background/80 border border-border rounded-lg px-4 py-3 text-sm focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary text-black font-extrabold text-sm px-6 py-3 rounded-lg hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Get Weekly Insights'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {status === 'success' && (
              <p className="text-sm text-green-500 font-bold flex items-center justify-center gap-1">
                <Check className="h-4 w-4" /> {message}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500 font-bold">{message}</p>
            )}

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime.
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-6 border-t border-border/40 max-w-lg mx-auto"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Join founders, operators, marketers, and creators building the future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Story Section */}
      {featuredStory && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="flex flex-col space-y-4 mb-8">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Featured Story</span>
            <h2 className="text-2xl sm:text-4xl font-sans font-extrabold tracking-tight">Highlight Insight</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface rounded-2xl overflow-hidden border border-border p-6 sm:p-8">
            <div className="lg:col-span-7 relative aspect-video w-full rounded-xl overflow-hidden shadow-sm bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredStory.coverImage}
                alt={featuredStory.title}
                className="object-cover w-full h-full hover:scale-101 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-black">
                {featuredStory.category}
              </span>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(featuredStory.createdAt)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{featuredStory.readingTime} min read</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-sans font-extrabold text-foreground hover:text-primary transition-colors leading-tight">
                <Link href={`/articles/${featuredStory.slug}`}>{featuredStory.title}</Link>
              </h3>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-4">
                {featuredStory.excerpt}
              </p>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center font-bold text-xs">
                    FB
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">FounderBrief Editorial</p>
                    <p className="text-[10px] text-muted-foreground">Weekly Contributor</p>
                  </div>
                </div>

                <Link
                  href={`/articles/${featuredStory.slug}`}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-foreground text-background hover:bg-primary hover:text-black transition-colors rounded-lg"
                >
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending This Week Section */}
      {trendingStories.length > 0 && (
        <section className="py-16 bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-2 mb-8">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary flex items-center gap-1.5">
                <Flame className="h-4 w-4 fill-primary" /> Trending This Week
              </span>
              <h2 className="text-2xl sm:text-4xl font-sans font-extrabold tracking-tight">
                The most-read founder insights, startup breakdowns, and AI stories this week.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Large Trending Post */}
              {featuredTrending && (
                <div className="lg:col-span-7 flex flex-col justify-between p-6 bg-background rounded-2xl border border-border shadow-xs group relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-sans font-extrabold text-primary opacity-60">#1</span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface border border-border">
                        {featuredTrending.category}
                      </span>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-surface mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredTrending.coverImage}
                        alt={featuredTrending.title}
                        className="object-cover w-full h-full transform group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                      <Link href={`/articles/${featuredTrending.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {featuredTrending.title}
                      </Link>
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {featuredTrending.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1"><Eye className="h-3.5 w-3.5" /> <span>{featuredTrending.views} views</span></span>
                    <span>{featuredTrending.readingTime} min read</span>
                  </div>
                </div>
              )}

              {/* Right Side: List of 4 Trending Posts */}
              <div className="lg:col-span-5 flex flex-col space-y-4 justify-between">
                {sideTrending.map((story) => (
                  <div
                    key={story._id}
                    className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border shadow-xs hover:border-primary/30 transition-all group relative"
                  >
                    <span className="text-3xl font-sans font-extrabold text-primary opacity-50 w-8 text-center shrink-0">
                      #{story.trendingRank}
                    </span>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{story.category}</span>
                      <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        <Link href={`/articles/${story.slug}`}>
                          <span className="absolute inset-0 z-10" />
                          {story.title}
                        </Link>
                      </h4>
                      <div className="flex items-center space-x-3 text-[10px] text-muted-foreground">
                        <span>{story.readingTime} min read</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1"><Eye className="h-3 w-3" /> <span>{story.views} views</span></span>
                      </div>
                    </div>
                    <div className="h-14 w-20 rounded-md overflow-hidden bg-surface shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={story.coverImage} alt="" className="object-cover w-full h-full" />
                    </div>
                  </div>
                ))}

                <Link
                  href="/articles"
                  className="w-full text-center px-4 py-3 bg-foreground text-background hover:bg-primary hover:text-black font-extrabold text-sm rounded-xl transition-all shadow-xs block"
                >
                  View All Articles
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Filtering Section */}
      <section id="categories" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-2 mb-8 text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Browse by Category</span>
          <h2 className="text-2xl sm:text-4xl font-sans font-extrabold tracking-tight">Explore the insights catalog</h2>
        </div>

        {/* Category Pills Selector */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-10">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-primary text-black shadow-md'
                : 'bg-surface hover:bg-surface-hover text-foreground border border-border'
            }`}
          >
            All Insights
          </button>
          {initialCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-primary text-black shadow-md'
                  : 'bg-surface hover:bg-surface-hover text-foreground border border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Latest Articles Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {latestArticles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>

        {latestArticles.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/30">
            <p className="text-muted-foreground text-sm font-semibold">No insights found in this category.</p>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section id="newsletter-section" className="py-16 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Newsletter</span>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight leading-tight text-foreground">
            Get founder insights delivered weekly.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join ambitious founders, operators, and developers receiving actionable breakdown strategies and trends direct to their inbox every Tuesday.
          </p>

          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-hidden focus:border-primary shadow-xs"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary text-black font-extrabold text-sm px-6 py-3 rounded-lg hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                <Send className="h-4 w-4" />
              </button>
            </form>

            {status === 'success' && (
              <p className="text-sm text-green-500 font-bold mt-3 flex items-center justify-center gap-1">
                <Check className="h-4 w-4" /> {message}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500 font-bold mt-3">{message}</p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

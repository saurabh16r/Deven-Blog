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

  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('newsletter-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden min-h-[92vh] flex items-center -mt-16 sm:-mt-20 bg-black bg-cover bg-center"
        style={{ backgroundImage: `url('/founder_hero_bg.png')` }}
      >
        {/* Dark Cinematic Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              90deg,
              rgba(0,0,0,0.92) 0%,
              rgba(0,0,0,0.80) 35%,
              rgba(0,0,0,0.50) 70%,
              rgba(0,0,0,0.20) 100%
            )`
          }}
        />

        {/* Hero Content Wrapper */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 sm:pb-24 z-10">
          <div className="max-w-[600px] flex flex-col justify-center text-left space-y-8">
            
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[84px] font-sans font-black tracking-tight leading-[0.95] text-white"
            >
              The Smartest Startup <br className="hidden sm:inline" />
              Insights, <br />
              <span className="text-[#FFC247]">In Just 5 Minutes.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#D1D5DB] text-lg sm:text-[20px] leading-[1.7] max-w-[520px] font-medium"
            >
              Actionable startup breakdowns, AI trends, growth strategies, fundraising lessons, and founder stories delivered weekly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <a
                href="#newsletter-section"
                onClick={handleCTAClick}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-extrabold bg-[#FFC247] text-black hover:bg-[#FFC247]/90 transition-all rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer text-center"
              >
                Get Weekly Insights
              </a>
              <a
                href="#categories"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-extrabold bg-white text-black hover:bg-white/90 transition-all rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer border border-neutral-200 text-center"
              >
                Explore Articles
              </a>
            </motion.div>

            {/* Trust Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex items-center space-x-2 text-sm text-neutral-400 font-medium"
            >
              <span className="text-[#FFC247] font-bold">✓</span>
              <span>No spam. Unsubscribe anytime.</span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Trust Logos Section */}
      <section className="bg-white border-b border-border py-8 sm:py-10 flex items-center justify-center min-h-[120px] sm:min-h-[140px] z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-5">
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
            Trusted by founders, operators, and teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16">
            {/* Stripe */}
            <div className="text-slate-900 opacity-40 hover:opacity-85 transition-all duration-300 select-none">
              <svg className="h-5 sm:h-6 text-current" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.37c0-5.78-2.82-9.76-8.22-9.76-5.46 0-8.88 4.22-8.88 9.87 0 6.64 4.02 9.87 9.4 9.87 4.22 0 7.37-1.95 8.78-4.7l-3.23-1.7c-.96 1.48-2.6 2.4-5.32 2.4-3.15 0-5.28-1.57-5.58-4.32h14.88c.1-.88.17-1.42.17-1.66zm-13.06-2.1c0-2.3 1.54-3.78 3.75-3.78 2.14 0 3.53 1.48 3.53 3.78H46.58zM31.25 4.95c-2.38 0-4.04 1.13-4.8 2.2V.4h-4.32v23.4h4.32v-8.88c.8 1.17 2.42 2.16 4.7 2.16 4.22 0 7.85-3.24 7.85-8.52-.02-5.44-3.53-8.6-7.75-8.6zm-1.04 12.87c-2.48 0-4.06-1.78-4.06-4.52s1.58-4.5 4.06-4.5c2.44 0 4.02 1.76 4.02 4.5s-1.58 4.52-4.02 4.52zM17.37 8.7V5.2h-3.92V.68l-4.3 1.34v3.18H6.5v3.5h2.65v10c0 3.32 1.83 5.1 5.08 5.1 1.63 0 2.94-.36 3.65-.77l-1.06-3.22c-.44.22-.98.34-1.74.34-1.48 0-2.16-.76-2.16-2.38V8.7h4.45zM2.87 8.35c0-1.28 1.03-1.8 2.82-1.8 1.94 0 3.54.54 4.53 1.12V4.28c-1.12-.42-2.73-.68-4.57-.68-4.48 0-7.23 2.24-7.23 6.13 0 5.63 7.74 4.72 7.74 7.15 0 1.44-1.25 1.9-3.07 1.9-2.26 0-4.22-.76-5.48-1.55v3.66c1.4.67 3.35.97 5.25.97 4.67 0 7.73-2.2 7.73-6.14 0-5.83-7.73-4.82-7.73-7.38z" fill="currentColor"/>
              </svg>
            </div>
            {/* Notion */}
            <div className="text-slate-900 opacity-40 hover:opacity-85 transition-all duration-300 select-none flex items-center space-x-1.5 font-black text-lg sm:text-xl font-sans tracking-tight">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                <path d="M7 7v10M7 7l5 5 5-5M17 7v10" />
              </svg>
              <span>Notion</span>
            </div>
            {/* Linear */}
            <div className="text-slate-900 opacity-40 hover:opacity-85 transition-all duration-300 select-none flex items-center space-x-1.5 font-extrabold text-lg sm:text-xl font-sans tracking-tight">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                <polygon points="12 6.5 17.5 10 17.5 14 12 17.5 6.5 14 6.5 10" />
              </svg>
              <span>Linear</span>
            </div>
            {/* Reforge */}
            <div className="text-slate-900 opacity-40 hover:opacity-85 transition-all duration-300 select-none font-bold text-base sm:text-lg tracking-wider font-sans">
              REFORGE
            </div>
            {/* Deel */}
            <div className="text-slate-900 opacity-40 hover:opacity-85 transition-all duration-300 select-none font-sans font-black text-xl sm:text-2xl tracking-tighter">
              deel.
            </div>
          </div>
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
                    D
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Deven Editorial</p>
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ArticleCard from '../blog/ArticleCard';
import { motion } from 'framer-motion';
import { Clock, Calendar, Mail, ArrowRight, Check, AlertCircle } from 'lucide-react';
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
  const [blogs] = useState<BlogType[]>(initialBlogs);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // 1. Identify Featured Story (explicitly featured or first)
  const featuredStory = blogs.find(b => b.featured) || blogs[0];

  // 2. Identify Secondary Stories (next two blogs, excluding featured)
  const remainingBlogs = blogs.filter(b => b._id !== featuredStory?._id);
  const secondaryStories = remainingBlogs.slice(0, 2);

  // 3. Identify Bottom Cards (next three blogs)
  const bottomStories = remainingBlogs.slice(2, 5);

  // 4. Filter Articles by Category when filtering
  const filteredArticles = blogs.filter(b => {
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
      <section className="relative py-20 sm:py-32 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl font-serif font-black tracking-tight leading-[1.1] text-foreground"
          >
            The smartest startup insights for ambitious founders.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Deep dives into AI, startup growth, fundraising, product strategy, and operational excellence. Delivered every week.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md mx-auto pt-4"
          >
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background dark:bg-[#171717] border border-border dark:border-[#2C2C2F] rounded-lg px-4 py-3 text-sm focus:outline-hidden focus:border-primary shadow-xs font-sans text-foreground placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm px-6 py-3 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Get Weekly Insights'}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-green-600 font-bold mt-3 flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" /> {message}
              </p>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500 font-bold mt-3 flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {message}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <section id="categories" className="py-8 bg-background border-b border-border scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`text-sm font-semibold tracking-wide cursor-pointer transition-all pb-2 shrink-0 ${
                selectedCategory === 'All'
                  ? 'text-foreground border-b-2 border-primary font-bold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-sm font-semibold tracking-wide cursor-pointer transition-all pb-2 shrink-0 ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'text-foreground border-b-2 border-primary font-bold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Briefings / Editorial Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {selectedCategory === 'All' ? (
          <div className="space-y-16">
            {/* Editorial Title */}
            <div className="flex justify-between items-baseline border-b border-border pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-foreground">
                Latest Briefings
              </h2>
              <Link href="/articles" className="text-xs uppercase font-extrabold tracking-wider text-muted hover:text-foreground transition-colors flex items-center gap-1">
                View Archive <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Top Grid: 1 Featured (Left 2/3) + 2 Secondary (Right 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Featured Story */}
              {featuredStory && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-surface">
                    <Link href={`/articles/${featuredStory.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredStory.coverImage}
                        alt={featuredStory.title}
                        className="object-cover w-full h-full hover:scale-101 transition-transform duration-500"
                        loading="eager"
                      />
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-xs text-muted font-semibold">
                      <span className="text-primary font-bold uppercase tracking-wider">
                        {featuredStory.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(featuredStory.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredStory.readingTime} min read
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-4xl font-serif font-black text-foreground hover:text-primary transition-colors leading-tight">
                      <Link href={`/articles/${featuredStory.slug}`}>{featuredStory.title}</Link>
                    </h3>

                    <p className="text-muted text-sm sm:text-base leading-relaxed line-clamp-3 font-medium">
                      {featuredStory.excerpt}
                    </p>
                  </div>
                </div>
              )}

              {/* Secondary Stories Stack */}
              <div className="space-y-8 divide-y divide-border lg:divide-y-0">
                {secondaryStories.map((story, idx) => (
                  <div key={story._id} className={`space-y-4 ${idx > 0 ? 'pt-8 lg:pt-0 border-t border-border lg:border-t-0' : ''}`}>
                    <div className="relative aspect-video sm:aspect-21/9 lg:aspect-video w-full rounded-lg overflow-hidden border border-border bg-surface">
                      <Link href={`/articles/${story.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="object-cover w-full h-full hover:scale-101 transition-transform duration-500"
                          loading="lazy"
                        />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 text-xs text-muted font-semibold">
                        <span className="text-primary font-bold uppercase tracking-wider">{story.category}</span>
                        <span>•</span>
                        <span>{story.readingTime} min read</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-serif font-black text-foreground hover:text-primary transition-colors leading-snug">
                        <Link href={`/articles/${story.slug}`}>{story.title}</Link>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Row: 3 Article Cards */}
            {bottomStories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border">
                {bottomStories.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Filtered Category Grid */
          <div className="space-y-12">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-foreground">
                Insights in {selectedCategory}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-20 border border-dashed border-border rounded-xl bg-surface/10">
                <p className="text-muted text-sm font-semibold">No briefings found in this category.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Newsletter Signup Section */}
      <section id="newsletter-section" className="py-20 sm:py-28 bg-surface border-t border-b border-border">
        <div className="max-w-xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-background border border-border text-muted mb-2">
            <Mail className="h-5 w-5 stroke-[1.5]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black text-foreground tracking-tight">
            Get founder insights delivered weekly.
          </h2>

          <p className="text-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Join ambitious founders, operators, and developers receiving weekly actionable startup analyses directly in their inbox.
          </p>

          <div className="max-w-md mx-auto pt-2">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="work@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-background dark:bg-[#171717] border border-border dark:border-[#2C2C2F] rounded-lg px-4 py-3 text-sm focus:outline-hidden focus:border-primary shadow-xs font-sans text-foreground placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-foreground text-background hover:bg-foreground/90 font-bold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-green-600 font-bold mt-3 flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" /> {message}
              </p>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500 font-bold mt-3 flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {message}
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

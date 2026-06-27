'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ArticleCard from '../blog/ArticleCard';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle } from 'lucide-react';

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
          <div className="space-y-12">
            {/* Editorial Title */}
            <div className="flex justify-between items-baseline border-b border-border pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-foreground">
                Latest Briefings
              </h2>
              <Link href="/articles" className="text-sm font-bold tracking-wide text-muted hover:text-foreground transition-colors">
                View All →
              </Link>
            </div>

            {/* Clean Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 9).map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
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

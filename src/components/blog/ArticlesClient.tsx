'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ArticleCard from './ArticleCard';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';

interface BlogType {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  readingTime: number;
  createdAt: string;
}

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

interface ArticlesClientProps {
  initialBlogs: BlogType[];
  categories: CategoryType[];
  totalCount: number;
  currentPage: number;
  limit: number;
  currentSearch: string;
  currentCategory: string;
  currentSort: string;
}

export default function ArticlesClient({
  initialBlogs,
  categories,
  totalCount,
  currentPage,
  limit,
  currentSearch,
  currentCategory,
  currentSort,
}: ArticlesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);

  // Sync state with search query updates
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: { search?: string; category?: string; sort?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
      params.set('page', '1'); // Reset to page 1 on new search
    }
    
    if (updates.category !== undefined) {
      if (updates.category && updates.category !== 'All') params.set('category', updates.category);
      else params.delete('category');
      params.set('page', '1'); // Reset to page 1 on new category
    }

    if (updates.sort !== undefined) {
      params.set('sort', updates.sort);
      params.set('page', '1'); // Reset to page 1 on new sort
    }

    if (updates.page !== undefined) {
      params.set('page', String(updates.page));
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Title and Intro */}
        <div className="space-y-3 mb-10 text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Insights Directory</span>
          <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight">
            All Startup Insights
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
            Filter and search through our curated analyses of startup operations, growth, fundraising, and AI trends.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between border-b border-border pb-8 mb-10">
          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search articles by title, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-primary shadow-xs"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </form>

          {/* Sorting Control */}
          <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Sort By
            </span>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-surface border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-primary font-semibold"
            >
              <option value="latest">Latest Insights</option>
              <option value="views">Most Views</option>
              <option value="trending">🔥 Trending Rank</option>
            </select>
          </div>
        </div>

        {/* Category Side-scroll Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => updateFilters({ category: 'All' })}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentCategory === 'All'
                ? 'bg-primary text-black shadow-xs'
                : 'bg-surface hover:bg-surface-hover text-foreground border border-border'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateFilters({ category: cat.name })}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentCategory === cat.name
                  ? 'bg-primary text-black shadow-xs'
                  : 'bg-surface hover:bg-surface-hover text-foreground border border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading Transition Indicator */}
        {isPending ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Grid Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {initialBlogs.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>

            {/* Empty State */}
            {initialBlogs.length === 0 && (
              <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface/30">
                <h3 className="text-lg font-bold mb-2">No insights found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Try adjusting your search criteria or changing your category filters.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border mt-12 pt-6">
                <button
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-surface transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-xs font-bold text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-surface transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

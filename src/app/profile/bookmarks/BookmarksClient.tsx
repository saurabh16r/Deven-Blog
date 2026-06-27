'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  coverImage: string;
  readingTime: number;
}

interface BookmarkItem {
  _id: string;
  articleId: Article;
  savedAt: string;
}

export default function BookmarksClient({ initialBookmarks }: { initialBookmarks: BookmarkItem[] }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRemove = async (articleId: string) => {
    setLoadingId(articleId);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.bookmarked) {
          // Successfully removed, filter state
          setBookmarks((prev) => prev.filter((b) => b.articleId._id !== articleId));
        }
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-sm uppercase font-extrabold tracking-widest text-primary mb-1">
          Saved
        </h2>
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Bookmarks
        </h1>
        <p className="text-muted text-sm font-medium mt-1">
          A collection of briefings you have bookmarked to read later.
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="divide-y divide-border">
          {bookmarks.map((item) => (
            <div 
              key={item._id} 
              className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
            >
              {/* Left Details */}
              <div className="flex gap-4 items-start sm:items-center min-w-0">
                {/* Thumbnail */}
                <div className="h-16 w-24 rounded overflow-hidden border border-border bg-surface shrink-0">
                  <Link href={`/articles/${item.articleId.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.articleId.coverImage} 
                      alt="" 
                      className="object-cover h-full w-full hover:scale-102 transition-transform duration-200" 
                      loading="lazy"
                    />
                  </Link>
                </div>
                
                {/* Text details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {item.articleId.category}
                    </span>
                    <span className="text-muted text-[10px] hidden sm:inline">•</span>
                    <span className="text-muted text-[10px]">
                      Saved {formatDate(item.savedAt)}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                    <Link href={`/articles/${item.articleId.slug}`}>
                      {item.articleId.title}
                    </Link>
                  </h3>
                  <div className="text-[11px] font-semibold text-muted tracking-wide">
                    {item.articleId.readingTime || 5} min read
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4 sm:self-center shrink-0">
                <button
                  onClick={() => handleRemove(item.articleId._id)}
                  disabled={loadingId === item.articleId._id}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer transition-colors"
                >
                  {loadingId === item.articleId._id ? 'Removing...' : 'Remove'}
                </button>
                <span className="text-border hidden sm:inline">|</span>
                <Link
                  href={`/articles/${item.articleId.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-foreground hover:underline transition-all"
                >
                  <span>Read</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border py-16 px-4 rounded-lg text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center mx-auto text-muted">
            <Bookmark className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-foreground">
              No bookmarks saved
            </h3>
            <p className="text-muted text-sm max-w-sm mx-auto font-medium">
              Click the bookmark icon on any briefing detail page to save it for quick access later.
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex justify-center px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg"
          >
            Explore Briefings
          </Link>
        </div>
      )}
    </div>
  );
}

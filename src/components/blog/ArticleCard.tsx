'use client';

import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    category: string;
    readingTime: number;
    createdAt: string | Date;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { title, slug, excerpt, coverImage, category, readingTime, createdAt } = article;

  return (
    <Link
      href={`/articles/${slug}`}
      className="group flex flex-col h-full bg-background border border-border/40 dark:border-[#2C2C2F]/50 hover:border-[#FFC247]/40 dark:hover:border-[#FFC247]/30 rounded-[12px] p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-surface shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Card Content Details */}
      <div className="flex-1 flex flex-col pt-5 space-y-3">
        {/* Category & Metadata */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase select-none">
          <span className="text-[#FFC247] font-bold">
            {category}
          </span>
          <span className="text-muted">•</span>
          <span className="text-muted font-medium">
            {formatDate(createdAt)}
          </span>
          <span className="text-muted">•</span>
          <span className="text-muted font-medium">
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg sm:text-xl text-foreground group-hover:text-[#FFC247] transition-colors leading-snug line-clamp-3">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-[#6B6258] dark:text-[#D4D4D4] text-xs sm:text-sm leading-relaxed line-clamp-2 font-medium">
          {excerpt}
        </p>
      </div>
    </Link>
  );
}

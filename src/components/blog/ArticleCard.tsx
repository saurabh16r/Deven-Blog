'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
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
    <article className="group flex flex-col space-y-4 bg-transparent dark:bg-[#171717] border border-transparent dark:border-[#2C2C2F] rounded-lg dark:p-4 transition-all duration-200 dark:hover:bg-[#1D1D1F] dark:hover:border-[#3D3D42] dark:hover:-translate-y-0.5">
      {/* Cover Image Container */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-surface shrink-0">
        <Link href={`/articles/${slug}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
            alt={title}
            className="object-cover w-full h-full hover:scale-101 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Card Content Details */}
      <div className="flex-1 flex flex-col space-y-2.5">
        {/* Category & Metadata */}
        <div className="flex items-center space-x-3 text-xs font-semibold text-muted">
          <span className="text-primary font-bold uppercase tracking-wider">
            {category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(createdAt)}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{readingTime} min read</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-black text-xl text-foreground hover:text-primary transition-colors leading-snug">
          <Link href={`/articles/${slug}`}>
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-[#6B6258] dark:text-[#D4D4D4] text-sm leading-relaxed line-clamp-2 font-medium">
          {excerpt}
        </p>
      </div>
    </article>
  );
}

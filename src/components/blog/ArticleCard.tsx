'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
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
    <article className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300">
      {/* Cover Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Pill Tag */}
        <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-black shadow-sm">
          {category}
        </span>
      </div>

      {/* Card Content Details */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{readingTime} min read</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-sans font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
            <Link href={`/articles/${slug}`} className="focus:outline-hidden">
              <span className="absolute inset-0 z-10" />
              {title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {/* Card Footer Button */}
        <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs font-bold text-foreground group-hover:text-primary transition-colors">
          <span>Read Insight</span>
          <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
}

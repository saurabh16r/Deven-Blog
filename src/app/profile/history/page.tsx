import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User, ReadingHistory } from '@/lib/models';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ArrowRight, History } from 'lucide-react';

export const revalidate = 0;

export default async function ReadingHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  if (!dbUser) {
    redirect('/login');
  }

  // Fetch full chronological reading history
  const rawHistory = await ReadingHistory.find({ userId: dbUser._id })
    .populate('articleId')
    .sort({ lastReadAt: -1 })
    .lean();

  const history = rawHistory
    .filter((h: any) => h.articleId)
    .map((h: any) => ({
      _id: h._id.toString(),
      readPercentage: h.readPercentage,
      lastReadAt: h.lastReadAt,
      article: {
        _id: h.articleId._id.toString(),
        title: h.articleId.title,
        slug: h.articleId.slug,
        category: h.articleId.category,
        coverImage: h.articleId.coverImage,
        readingTime: h.articleId.readingTime || 5,
        excerpt: h.articleId.excerpt || '',
      }
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-sm uppercase font-extrabold tracking-widest text-primary mb-1">
          Activity
        </h2>
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Reading History
        </h1>
        <p className="text-muted text-sm font-medium mt-1">
          A chronological record of articles and briefings you have explored.
        </p>
      </div>

      {history.length > 0 ? (
        <div className="space-y-6">
          <div className="divide-y divide-border">
            {history.map((item) => (
              <div 
                key={item._id} 
                className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
              >
                {/* Left Details */}
                <div className="flex gap-4 items-start sm:items-center min-w-0">
                  {/* Thumbnail */}
                  <div className="h-16 w-24 rounded overflow-hidden border border-border bg-surface shrink-0">
                    <Link href={`/articles/${item.article.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.article.coverImage} 
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
                        {item.article.category}
                      </span>
                      <span className="text-muted text-[10px] hidden sm:inline">•</span>
                      <span className="text-muted text-[10px]">
                        Last read {formatDate(item.lastReadAt)}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      <Link href={`/articles/${item.article.slug}`}>
                        {item.article.title}
                      </Link>
                    </h3>
                    <div className="text-[11px] font-semibold text-muted tracking-wide flex gap-3">
                      <span>Progress: {item.readPercentage}%</span>
                      <span>•</span>
                      <span>{item.article.readingTime} min read</span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <Link
                  href={`/articles/${item.article.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-foreground hover:underline transition-all sm:self-center shrink-0"
                >
                  <span>Continue Reading</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border py-16 px-4 rounded-lg text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center mx-auto text-muted">
            <History className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-foreground">
              No history found
            </h3>
            <p className="text-muted text-sm max-w-sm mx-auto font-medium">
              We track the briefings you open so you can pick up where you left off. Start exploring today!
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex justify-center px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg"
          >
            Browse Articles
          </Link>
        </div>
      )}
    </div>
  );
}

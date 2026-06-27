import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User, ReadingHistory } from '@/lib/models';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ArrowRight, BookOpen, Clock, Award } from 'lucide-react';

export const revalidate = 0;

export default async function ProfileDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  if (!dbUser) {
    redirect('/login');
  }

  // Fetch user reading history items, populate the articles
  const rawHistory = await ReadingHistory.find({ userId: dbUser._id })
    .populate('articleId')
    .sort({ lastReadAt: -1 })
    .lean();

  // Filter out any history records where the article might have been deleted
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

  // Calculations
  const totalArticlesRead = history.length;
  const totalReadingTime = history.reduce((sum, item) => sum + (item.article.readingTime || 5), 0);

  // Find the article that was read last and is in progress (< 95% complete)
  const continueReadingItem = history.find(item => item.readPercentage < 95);
  // Otherwise default to the last read article
  const mainContinueItem = continueReadingItem || history[0];

  const recentlyRead = history.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Header Greeting */}
      <div>
        <h2 className="text-sm uppercase font-extrabold tracking-widest text-primary mb-1">
          Dashboard
        </h2>
        <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
          Welcome back, {dbUser.name.split(' ')[0]} 👋
        </h1>
        <p className="text-muted text-sm font-medium mt-1">
          Here is your Deven briefing overview.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Current Plan */}
        <div className="border border-border p-6 rounded-lg bg-surface/40 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted">
              Current Plan
            </span>
            <Award className="h-5 w-5 text-primary stroke-[1.5]" />
          </div>
          <div>
            <div className="text-2xl font-serif font-black capitalize text-foreground">
              {dbUser.plan} Member
            </div>
            <p className="text-xs text-muted font-medium mt-1">
              Status: {dbUser.subscriptionStatus === 'active' ? 'Active' : 'Free Account'}
            </p>
          </div>
        </div>

        {/* Card 2: Articles Read */}
        <div className="border border-border p-6 rounded-lg bg-surface/40 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted">
              Articles Read
            </span>
            <BookOpen className="h-5 w-5 text-[#6B6258] dark:text-[#9A9A9A] stroke-[1.5]" />
          </div>
          <div>
            <div className="text-3xl font-serif font-black text-foreground">
              {totalArticlesRead}
            </div>
            <p className="text-xs text-muted font-medium mt-1">
              Briefings unlocked and analyzed.
            </p>
          </div>
        </div>

        {/* Card 3: Reading Time */}
        <div className="border border-border p-6 rounded-lg bg-surface/40 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted">
              Reading Time
            </span>
            <Clock className="h-5 w-5 text-[#6B6258] dark:text-[#9A9A9A] stroke-[1.5]" />
          </div>
          <div>
            <div className="text-3xl font-serif font-black text-foreground">
              {totalReadingTime} <span className="text-base font-normal text-muted">mins</span>
            </div>
            <p className="text-xs text-muted font-medium mt-1">
              Spent reading startup breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Reading Section */}
      {mainContinueItem && (
        <div className="border border-border p-6 rounded-lg space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted block">
            Continue Reading
          </span>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="h-14 w-20 rounded border border-border bg-surface shrink-0 overflow-hidden hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={mainContinueItem.article.coverImage} 
                  alt="" 
                  className="object-cover h-full w-full"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {mainContinueItem.article.category}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors">
                  <Link href={`/articles/${mainContinueItem.article.slug}`}>
                    {mainContinueItem.article.title}
                  </Link>
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>Progress: {mainContinueItem.readPercentage}%</span>
                  <span>•</span>
                  <span>{mainContinueItem.article.readingTime} min read</span>
                </div>
              </div>
            </div>
            
            <Link
              href={`/articles/${mainContinueItem.article.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold rounded-lg transition-all"
            >
              <span>Resume</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Recently Read Articles */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted">
          Recently Read Articles
        </h3>
        
        {recentlyRead.length > 0 ? (
          <div className="divide-y divide-border border-t border-b border-border">
            {recentlyRead.map((item) => (
              <div key={item._id} className="py-4.5 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {item.article.category}
                    </span>
                    <span className="text-muted text-[10px]">•</span>
                    <span className="text-muted text-[10px]">Read {formatDate(item.lastReadAt)}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors truncate">
                    <Link href={`/articles/${item.article.slug}`}>
                      {item.article.title}
                    </Link>
                  </h4>
                </div>
                
                <Link
                  href={`/articles/${item.article.slug}`}
                  className="text-xs font-bold text-muted hover:text-foreground hover:underline shrink-0 transition-colors"
                >
                  Read Again
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 rounded-lg text-center text-sm text-muted">
            You haven&apos;t read any articles yet. Explore our latest breakdowns!
          </div>
        )}
      </div>
    </div>
  );
}

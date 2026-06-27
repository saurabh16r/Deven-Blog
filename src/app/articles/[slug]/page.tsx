import React from 'react';
import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { Blog, User, Bookmark } from '@/lib/models';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ShareButtons from '@/components/blog/ShareButtons';
import AISummary from '@/components/blog/AISummary';
import BookmarkButton from '@/components/blog/BookmarkButton';
import HistoryTracker from '@/components/blog/HistoryTracker';
import ArticleContentClient from '@/components/blog/ArticleContentClient';
import { formatDate, slugify, injectHeadingIds } from '@/lib/utils';
import { Share2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function scrambleHTML(html: string): string {
  if (!html) return '';
  return html.replace(/>([^<]+)</g, (match, text) => {
    const scrambled = text.replace(/[a-zA-Z0-9]/g, (char: string) => {
      if (/\s/.test(char)) return char;
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      return chars[Math.floor(Math.random() * chars.length)];
    });
    return `>${scrambled}<`;
  });
}

export default async function ArticleDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const session = await getServerSession(authOptions);
  
  let blog: any = null;
  let relatedArticles: any[] = [];
  let isBookmarked = false;
  let isLocked = false;
  let showPaywall = false;
  let paywallReason = 'visitor'; // 'visitor' or 'premium'

  await connectDB();
  
  // Find blog and increment views by 1
  const dbBlog = await Blog.findOneAndUpdate(
    { slug, published: true },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean();

  if (dbBlog) {
    blog = JSON.parse(JSON.stringify(dbBlog));
    
    // Fetch only 2 related articles
    const dbRelated = await Blog.find({
      published: true,
      slug: { $ne: slug },
      category: blog.category
    })
    .limit(2)
    .lean();

    relatedArticles = JSON.parse(JSON.stringify(dbRelated));

    // Fallback if not enough category matches
    if (relatedArticles.length < 2) {
      const extraRelated = await Blog.find({
        published: true,
        slug: { $ne: slug },
        category: { $ne: blog.category }
      })
      .limit(2 - relatedArticles.length)
      .lean();
      relatedArticles = [...relatedArticles, ...JSON.parse(JSON.stringify(extraRelated))];
    }

    // Check user authenticated paywall and bookmarks
    if (session?.user) {
      const dbUser = await User.findOne({ email: session.user.email }).lean();
      if (dbUser) {
        const existingBookmark = await Bookmark.findOne({ 
          userId: dbUser._id, 
          articleId: dbBlog._id 
        }).lean();
        isBookmarked = !!existingBookmark;
        
        // Show premium paywall if user is not premium
        if (dbUser.plan !== 'premium') {
          // If they just logged in from the paywall card, redirect them to pricing page
          if (search.login === '1') {
            redirect('/pricing');
          }
          
          isLocked = true;
          showPaywall = true;
          paywallReason = 'premium';
        }
      }
    } else {
      // Visitor limit: check cookie array of read slugs
      const cookieStore = await cookies();
      const rawReadSlugs = cookieStore.get('fb_read_slugs')?.value;
      let readSlugs: string[] = [];
      
      try {
        if (rawReadSlugs) {
          readSlugs = JSON.parse(decodeURIComponent(rawReadSlugs));
        }
      } catch (e) {
        readSlugs = [];
      }
      
      // Lock if 3rd unique article
      if (!readSlugs.includes(slug) && readSlugs.length >= 2) {
        isLocked = true;
        showPaywall = true;
        paywallReason = 'visitor';
      }
    }
  }

  if (!blog) {
    notFound();
  }

  // Inject IDs into the heading tags client side scrollspy
  const contentWithIds = injectHeadingIds(blog.content);

  // Split and scramble content if locked
  let freeContent = contentWithIds;
  let blurredContent = '';
  if (isLocked) {
    const paragraphs = contentWithIds.split('</p>');
    if (paragraphs.length > 2) {
      freeContent = paragraphs.slice(0, 2).map((p: string) => p + '</p>').join('');
      const remainingRaw = paragraphs.slice(2).map((p: string) => p + '</p>').join('');
      blurredContent = scrambleHTML(remainingRaw);
    } else {
      freeContent = contentWithIds.slice(0, Math.floor(contentWithIds.length * 0.25));
      blurredContent = scrambleHTML(contentWithIds.slice(Math.floor(contentWithIds.length * 0.25)));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <ReadingProgressBar />
      <Navbar />

      <main className="flex-grow py-12 sm:py-20">
        <article className="max-w-[760px] mx-auto px-4 w-full space-y-8">
          
          {/* Header Metadata Section */}
          <div className="space-y-4">
            <div className="text-xs uppercase font-extrabold tracking-widest text-primary flex items-center gap-1.5">
              <span>{blog.category}</span>
              <span>•</span>
              <span>{blog.readingTime} min read</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-[1.15] text-foreground">
              {blog.title}
            </h1>
          </div>

          {/* Author Block Row */}
          <div className="flex items-center justify-between border-y border-border py-4 my-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary text-black rounded-full flex items-center justify-center font-bold font-serif text-sm shrink-0 select-none">
                JD
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Jane Doe</p>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                  EDITOR-IN-CHIEF • {formatDate(blog.createdAt)}
                </p>
              </div>
            </div>

            {/* Top Share & Bookmark minimal buttons */}
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 border border-border hover:bg-surface rounded-full transition-colors cursor-pointer text-muted hover:text-foreground"
                title="Share briefing"
              >
                <Share2 className="h-4 w-4 stroke-[1.5]" />
              </button>
              <BookmarkButton articleId={blog._id} initialBookmarked={isBookmarked} />
            </div>
          </div>

          {/* Cover Image Block */}
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="object-cover w-full h-full"
                loading="eager"
              />
            </div>
            <p className="text-center text-xs italic text-muted leading-relaxed font-serif pt-1">
              Cover illustration for {blog.title}. Photo by Deven Editorial.
            </p>
          </div>

          {/* Collapsible AI Summary Widget */}
          <AISummary
            summaryText={blog.aiSummary}
            enabled={blog.aiSummaryEnabled}
          />

          {/* Article Content with Dynamic Client Paywall & Audio narration */}
          <ArticleContentClient
            slug={slug}
            initialLocked={isLocked}
            freeContent={freeContent}
            blurredContent={blurredContent}
            audioUrl={blog.audioUrl}
          />

          <HistoryTracker articleId={blog._id} slug={blog.slug} />


          {/* Tag Badges Footer */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-border mt-8 flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface border border-border text-muted text-xs font-semibold rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Share Section */}
          <div className="border-t border-border pt-6 mt-8">
            <ShareButtons title={blog.title} />
          </div>

          {/* Continue Reading / Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="border-t border-border mt-16 pt-12 space-y-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-muted block">
                Continue Reading
              </span>
              
              {/* Vertical Editorial List */}
              <div className="divide-y divide-border">
                {relatedArticles.map((related) => (
                  <div key={related._id} className="py-6 first:pt-0 last:pb-0 flex items-start justify-between gap-6 group">
                    
                    {/* Left text layout */}
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        {related.category}
                      </span>
                      <h3 className="font-serif font-black text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/articles/${related.slug}`}>
                          {related.title}
                        </Link>
                      </h3>
                      <p className="text-muted text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                        {related.excerpt}
                      </p>
                    </div>

                    {/* Right visual layout */}
                    <div className="h-16 w-24 sm:h-20 sm:w-28 rounded-lg overflow-hidden border border-border bg-surface shrink-0">
                      <Link href={`/articles/${related.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={related.coverImage} 
                          alt="" 
                          className="object-cover w-full h-full hover:scale-101 transition-transform" 
                          loading="lazy"
                        />
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </article>
      </main>

      <Footer />
    </div>
  );
}

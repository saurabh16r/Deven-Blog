import React from 'react';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ShareButtons from '@/components/blog/ShareButtons';
import AISummary from '@/components/blog/AISummary';
import AudioPlayer from '@/components/blog/AudioPlayer';
import { formatDate, slugify } from '@/lib/utils';
import { Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function injectHeadingIds(html: string): string {
  if (!html) return '';
  return html.replace(/<h2>(.*?)<\/h2>/g, (match, titleText) => {
    const cleanText = titleText.replace(/<[^>]*>/g, '');
    const id = slugify(cleanText);
    return `<h2 id="${id}" class="scroll-mt-24 font-serif font-black text-2xl border-b border-border pb-1 mt-8 mb-4 text-foreground">${titleText}</h2>`;
  });
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let blog: any = null;
  let relatedArticles: any[] = [];

  await connectDB();
  
  // Find blog and increment views by 1
  const dbBlog = await Blog.findOneAndUpdate(
    { slug, published: true },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean();

  if (dbBlog) {
    blog = JSON.parse(JSON.stringify(dbBlog));
    
    // Fetch only 2 related articles as per "Two related articles. Editorial list."
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
  }

  if (!blog) {
    notFound();
  }

  // Inject IDs into the heading tags client side scrollspy
  const contentWithIds = injectHeadingIds(blog.content);

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
              <button 
                className="p-2 border border-border hover:bg-surface rounded-full transition-colors cursor-pointer text-muted hover:text-foreground"
                title="Bookmark briefing"
              >
                <Bookmark className="h-4 w-4 stroke-[1.5]" />
              </button>
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
              Cover illustration for {blog.title}. Photo by FounderBrief Editorial.
            </p>
          </div>

          {/* Collapsible AI Summary Widget */}
          <AISummary
            summaryText={blog.aiSummary}
            enabled={blog.aiSummaryEnabled}
          />

          {/* Custom TTS Voice player */}
          <AudioPlayer
            audioUrl={blog.audioUrl}
          />

          {/* Editorial Content Body */}
          <div 
            className="ProseMirror editorial-text text-foreground/90 leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

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

import React from 'react';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import TableOfContents from '@/components/blog/TableOfContents';
import ShareButtons from '@/components/blog/ShareButtons';
import AISummary from '@/components/blog/AISummary';
import AudioPlayer from '@/components/blog/AudioPlayer';
import ArticleCard from '@/components/blog/ArticleCard';
import { formatDate, slugify } from '@/lib/utils';
import { Calendar, Clock, Eye, User } from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function injectHeadingIds(html: string): string {
  if (!html) return '';
  return html.replace(/<h2>(.*?)<\/h2>/g, (match, titleText) => {
    const cleanText = titleText.replace(/<[^>]*>/g, '');
    const id = slugify(cleanText);
    return `<h2 id="${id}" class="scroll-mt-24 font-bold text-2xl border-b border-border pb-1 mt-8 mb-4">${titleText}</h2>`;
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
    
    const dbRelated = await Blog.find({
      published: true,
      slug: { $ne: slug },
      category: blog.category
    })
    .limit(3)
    .lean();

    relatedArticles = JSON.parse(JSON.stringify(dbRelated));

    // Fallback if not enough category matches
    if (relatedArticles.length < 3) {
      const extraRelated = await Blog.find({
        published: true,
        slug: { $ne: slug },
        category: { $ne: blog.category }
      })
      .limit(3 - relatedArticles.length)
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

      <main className="flex-grow py-10 sm:py-16">
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Article Header Metadata */}
          <div className="max-w-3xl mx-auto text-center space-y-5 mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary text-black">
              {blog.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight leading-tight text-foreground">
              {blog.title}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {blog.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-y border-border py-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center space-x-1.5 font-semibold text-foreground">
                <User className="h-4 w-4" />
                <span>Deven Editorial</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>{blog.readingTime} min read</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Eye className="h-4 w-4" />
                <span>{blog.views} views</span>
              </span>
            </div>
          </div>

          {/* Hero Banner Cover */}
          <div className="w-full aspect-video sm:aspect-21/9 rounded-2xl overflow-hidden mb-12 shadow-sm border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
            
            {/* Left Column: TOC and Sharing Actions (Sticky) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-8">
              <div className="sticky top-28 space-y-8">
                <TableOfContents htmlContent={blog.content} />
                <hr className="border-border" />
                <ShareButtons title={blog.title} />
              </div>
            </aside>

            {/* Center Column: Interactive widgets + Content Body */}
            <div className="lg:col-span-7 space-y-6 max-w-3xl mx-auto lg:mx-0 w-full">
              
              {/* Premium AI Summary Widget */}
              <AISummary
                summaryText={blog.aiSummary}
                enabled={blog.aiSummaryEnabled}
              />

              {/* Custom TTS Voice player */}
              <AudioPlayer
                audioUrl={blog.audioUrl}
              />

              {/* Primary Content HTML Body */}
              <div 
                className="ProseMirror editorial-text text-foreground/90 leading-relaxed font-serif"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Tag Badges footer */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="pt-6 border-t border-border mt-8 flex flex-wrap gap-2">
                  {blog.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface border border-border text-muted-foreground text-xs font-semibold rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Share Action Block */}
            <div className="block lg:hidden border-t border-border pt-6 mt-8">
              <ShareButtons title={blog.title} />
            </div>
          </div>

          {/* Related Articles Footer Section */}
          {relatedArticles.length > 0 && (
            <div className="border-t border-border mt-16 pt-16">
              <div className="flex flex-col space-y-2 mb-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-primary">Next Read</span>
                <h2 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight">Related Startup Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <ArticleCard key={related._id} article={related} />
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

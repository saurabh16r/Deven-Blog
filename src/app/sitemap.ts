import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deven.com';
  
  let blogs = [];
  try {
    await connectDB();
    const dbBlogs = await Blog.find({ published: true }).select('slug updatedAt').lean();
    blogs = JSON.parse(JSON.stringify(dbBlogs));
  } catch (error) {
    console.error('Database connection failed in sitemap generation:', error);
  }

  const blogUrls = blogs.map((blog: any) => ({
    url: `${baseUrl}/articles/${blog.slug}`,
    lastModified: new Date(blog.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const routes = ['', '/articles'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...routes, ...blogUrls];
}

import React from 'react';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';
import { mockBlogs } from '@/app/api/blogs/route';
import BlogsClient from '@/components/dashboard/BlogsClient';

export const revalidate = 0;

export default async function AdminBlogsPage() {
  let blogs = [];

  try {
    await connectDB();
    const dbBlogs = await Blog.find().sort({ createdAt: -1 }).lean();
    blogs = JSON.parse(JSON.stringify(dbBlogs));
  } catch (error) {
    console.warn('Database connection failed in admin blogs SSR loader. Utilizing mock fallback.', error);
    blogs = JSON.parse(JSON.stringify(mockBlogs));
  }

  // Seeding default lists if db is empty
  if (blogs.length === 0) {
    blogs = JSON.parse(JSON.stringify(mockBlogs));
  }

  return <BlogsClient initialBlogs={blogs} />;
}

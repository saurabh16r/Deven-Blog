import React from 'react';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';
import BlogsClient from '@/components/dashboard/BlogsClient';

export const revalidate = 0;

export default async function AdminBlogsPage() {
  await connectDB();
  const dbBlogs = await Blog.find().sort({ createdAt: -1 }).lean();
  const blogs = JSON.parse(JSON.stringify(dbBlogs));

  return <BlogsClient initialBlogs={blogs} />;
}

import React from 'react';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Blog, Category } from '@/lib/models';
import { mockBlogs } from '@/app/api/blogs/route';
import BlogEditForm from '@/components/editor/BlogEditForm';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPage({ params }: PageProps) {
  const { id } = await params;
  let blog = null;
  let categories = [];

  try {
    await connectDB();
    const dbBlog = await Blog.findById(id).lean();
    if (dbBlog) {
      blog = JSON.parse(JSON.stringify(dbBlog));
    }
    
    const dbCats = await Category.find().sort({ name: 1 }).lean();
    categories = JSON.parse(JSON.stringify(dbCats));
  } catch (error) {
    console.warn('Database error in edit blog page SSR, loading mock fallback data', error);
    const mockB = mockBlogs.find(b => b._id === id);
    if (mockB) {
      blog = JSON.parse(JSON.stringify(mockB));
    }
  }

  // Fallback checks for mock IDs when DB is down
  if (!blog && id.startsWith('mock-')) {
    const mockB = mockBlogs.find(b => b._id === id);
    if (mockB) {
      blog = JSON.parse(JSON.stringify(mockB));
    }
  }

  if (categories.length === 0) {
    categories = [
      { _id: '1', name: 'Startups', slug: 'startups' },
      { _id: '2', name: 'AI', slug: 'ai' },
      { _id: '3', name: 'Growth', slug: 'growth' },
      { _id: '4', name: 'Marketing', slug: 'marketing' },
      { _id: '5', name: 'Fundraising', slug: 'fundraising' },
      { _id: '6', name: 'Operations', slug: 'operations' },
    ];
  }

  if (!blog) {
    notFound();
  }

  return <BlogEditForm blog={blog} categories={categories} />;
}

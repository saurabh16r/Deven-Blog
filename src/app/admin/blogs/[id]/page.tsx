import React from 'react';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import { Blog, Category } from '@/lib/models';
import BlogEditForm from '@/components/editor/BlogEditForm';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPage({ params }: PageProps) {
  const { id } = await params;

  await connectDB();
  const dbBlog = await Blog.findById(id).lean();
  if (!dbBlog) {
    notFound();
  }
  const blog = JSON.parse(JSON.stringify(dbBlog));
  
  const dbCats = await Category.find().sort({ name: 1 }).lean();
  const categories = JSON.parse(JSON.stringify(dbCats));

  return <BlogEditForm blog={blog} categories={categories} />;
}

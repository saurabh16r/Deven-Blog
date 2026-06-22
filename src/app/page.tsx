import React from 'react';
import connectDB from '@/lib/db';
import { Blog, Category } from '@/lib/models';
import HomeClient from '@/components/home/HomeClient';

// Ensure the page renders dynamically on every request
export const revalidate = 0;

export default async function HomePage() {
  await connectDB();
  const dbBlogs = await Blog.find({ published: true }).sort({ createdAt: -1 }).lean();
  const dbCategories = await Category.find().lean();
  
  // Serialize Mongoose Object IDs
  const blogs = JSON.parse(JSON.stringify(dbBlogs));
  const categories = JSON.parse(JSON.stringify(dbCategories));

  return <HomeClient initialBlogs={blogs} initialCategories={categories} />;
}

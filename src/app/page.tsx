import React from 'react';
import connectDB from '@/lib/db';
import { Blog, Category } from '@/lib/models';
import { mockBlogs } from '@/app/api/blogs/route';
import HomeClient from '@/components/home/HomeClient';

// Ensure the page renders dynamically on every request
export const revalidate = 0;

export default async function HomePage() {
  let blogs = [];
  let categories = [];

  try {
    await connectDB();
    const dbBlogs = await Blog.find({ published: true }).sort({ createdAt: -1 }).lean();
    const dbCategories = await Category.find().lean();
    
    // Serialize Mongoose Object IDs
    blogs = JSON.parse(JSON.stringify(dbBlogs));
    categories = JSON.parse(JSON.stringify(dbCategories));
  } catch (error) {
    console.warn('Database connection failed in homepage SSR, utilizing mock dataset.', error);
    blogs = JSON.parse(JSON.stringify(mockBlogs));
    categories = [
      { _id: '1', name: 'Startups', slug: 'startups' },
      { _id: '2', name: 'AI', slug: 'ai' },
      { _id: '3', name: 'Growth', slug: 'growth' },
      { _id: '4', name: 'Marketing', slug: 'marketing' },
      { _id: '5', name: 'Fundraising', slug: 'fundraising' },
      { _id: '6', name: 'Operations', slug: 'operations' },
    ];
  }

  // Ensure categories always have standard defaults if none exist in the database
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

  return <HomeClient initialBlogs={blogs} initialCategories={categories} />;
}

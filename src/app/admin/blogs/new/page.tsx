import React from 'react';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import BlogEditForm from '@/components/editor/BlogEditForm';

export const revalidate = 0;

export default async function AdminNewBlogPage() {
  let categories = [];

  try {
    await connectDB();
    const dbCats = await Category.find().sort({ name: 1 }).lean();
    categories = JSON.parse(JSON.stringify(dbCats));
  } catch (error) {
    console.warn('Database connection failed in admin new blog page, loading fallback categories.', error);
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

  return <BlogEditForm categories={categories} />;
}

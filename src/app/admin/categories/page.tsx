import React from 'react';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import CategoriesClient from '@/components/dashboard/CategoriesClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  let categories = [];

  try {
    await connectDB();
    const dbCats = await Category.find().sort({ name: 1 }).lean();
    categories = JSON.parse(JSON.stringify(dbCats));
  } catch (error) {
    console.warn('Database error in categories SSR dashboard, utilizing mocks.', error);
    categories = [
      { _id: '1', name: 'Startups', slug: 'startups' },
      { _id: '2', name: 'AI', slug: 'ai' },
      { _id: '3', name: 'Growth', slug: 'growth' },
      { _id: '4', name: 'Marketing', slug: 'marketing' },
      { _id: '5', name: 'Fundraising', slug: 'fundraising' },
      { _id: '6', name: 'Operations', slug: 'operations' },
    ];
  }

  // Set default mockup categories if empty
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

  return <CategoriesClient initialCategories={categories} />;
}

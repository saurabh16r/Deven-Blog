import React from 'react';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import CategoriesClient from '@/components/dashboard/CategoriesClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  await connectDB();
  const dbCats = await Category.find().sort({ name: 1 }).lean();
  const categories = JSON.parse(JSON.stringify(dbCats));

  return <CategoriesClient initialCategories={categories} />;
}

import React from 'react';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';
import BlogEditForm from '@/components/editor/BlogEditForm';

export const revalidate = 0;

export default async function AdminNewBlogPage() {
  await connectDB();
  const dbCats = await Category.find().sort({ name: 1 }).lean();
  const categories = JSON.parse(JSON.stringify(dbCats));

  return <BlogEditForm categories={categories} />;
}

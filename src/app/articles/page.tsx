import React from 'react';
import connectDB from '@/lib/db';
import { Blog, Category } from '@/lib/models';
import ArticlesClient from '@/components/blog/ArticlesClient';

export const revalidate = 0;

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: string;
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || 'All';
  const sort = params.sort || 'latest';
  const page = params.page ? parseInt(params.page) : 1;

  const limit = 9;
  const skip = (page - 1) * limit;

  await connectDB();
  const query: any = { published: true };
  if (category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  let sortQuery: any = { createdAt: -1 };
  if (sort === 'views') {
    sortQuery = { views: -1 };
  } else if (sort === 'trending') {
    sortQuery = { isTrending: -1, trendingRank: 1, createdAt: -1 };
  }

  const total = await Blog.countDocuments(query);
  const dbBlogs = await Blog.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean();
    
  const blogs = JSON.parse(JSON.stringify(dbBlogs));
  
  const dbCats = await Category.find().lean();
  const categories = JSON.parse(JSON.stringify(dbCats));

  return (
    <ArticlesClient
      initialBlogs={blogs}
      categories={categories}
      totalCount={total}
      currentPage={page}
      limit={limit}
      currentSearch={search}
      currentCategory={category}
      currentSort={sort}
    />
  );
}

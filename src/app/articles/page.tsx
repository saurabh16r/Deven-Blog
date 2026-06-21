import React from 'react';
import connectDB from '@/lib/db';
import { Blog, Category } from '@/lib/models';
import { mockBlogs } from '@/app/api/blogs/route';
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

  let blogs = [];
  let categories = [];
  let total = 0;
  const limit = 9;
  const skip = (page - 1) * limit;

  try {
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

    total = await Blog.countDocuments(query);
    const dbBlogs = await Blog.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();
      
    blogs = JSON.parse(JSON.stringify(dbBlogs));
    
    const dbCats = await Category.find().lean();
    categories = JSON.parse(JSON.stringify(dbCats));
  } catch (error) {
    console.warn('Database error in articles SSR page, loading mocks fallback', error);
    
    let filtered = mockBlogs.filter(b => b.published);
    if (category !== 'All') {
      filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(s) || 
        b.excerpt.toLowerCase().includes(s) ||
        b.content.toLowerCase().includes(s)
      );
    }

    if (sort === 'views') {
      filtered = filtered.sort((a, b) => b.views - a.views);
    } else if (sort === 'trending') {
      filtered = filtered.sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        return a.trendingRank - b.trendingRank;
      });
    } else {
      filtered = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    total = filtered.length;
    blogs = JSON.parse(JSON.stringify(filtered.slice(skip, skip + limit)));
    
    categories = [
      { _id: '1', name: 'Startups', slug: 'startups' },
      { _id: '2', name: 'AI', slug: 'ai' },
      { _id: '3', name: 'Growth', slug: 'growth' },
      { _id: '4', name: 'Marketing', slug: 'marketing' },
      { _id: '5', name: 'Fundraising', slug: 'fundraising' },
      { _id: '6', name: 'Operations', slug: 'operations' },
    ];
  }

  // Ensure default categories exist
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

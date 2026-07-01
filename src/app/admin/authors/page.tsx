import React from 'react';
import connectDB from '@/lib/db';
import { Author, Blog } from '@/lib/models';
import AuthorsClient from '@/components/dashboard/AuthorsClient';

export const revalidate = 0;

export default async function AdminAuthorsPage() {
  await connectDB();
  
  // Find all authors
  const dbAuthors = await Author.find().sort({ name: 1 }).lean();
  const authors = JSON.parse(JSON.stringify(dbAuthors));

  // Find article count per author
  const dbBlogCounts = await Blog.aggregate([
    { $group: { _id: '$authorId', count: { $sum: 1 } } }
  ]);
  const blogCounts = dbBlogCounts.reduce((acc: any, curr: any) => {
    if (curr._id) {
      acc[curr._id.toString()] = curr.count;
    }
    return acc;
  }, {});

  // Append count to authors
  const authorsWithCounts = authors.map((auth: any) => ({
    ...auth,
    articlesWritten: blogCounts[auth._id] || 0
  }));

  return <AuthorsClient initialAuthors={authorsWithCounts} />;
}

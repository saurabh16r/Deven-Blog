import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User, Bookmark } from '@/lib/models';
import BookmarksClient from './BookmarksClient';

export const revalidate = 0;

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  if (!dbUser) {
    redirect('/login');
  }

  // Fetch bookmarks
  const dbBookmarks = await Bookmark.find({ userId: dbUser._id })
    .populate('articleId')
    .sort({ savedAt: -1 })
    .lean();

  // Filter out orphaned records
  const initialBookmarks = dbBookmarks
    .filter((b: any) => b.articleId)
    .map((b: any) => ({
      _id: b._id.toString(),
      savedAt: b.savedAt.toISOString(),
      articleId: {
        _id: b.articleId._id.toString(),
        title: b.articleId.title,
        slug: b.articleId.slug,
        category: b.articleId.category,
        coverImage: b.articleId.coverImage,
        readingTime: b.articleId.readingTime || 5,
      }
    }));

  return <BookmarksClient initialBookmarks={initialBookmarks} />;
}

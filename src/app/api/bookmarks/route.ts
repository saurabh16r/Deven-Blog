import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Bookmark, User } from '@/lib/models';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookmarks = await Bookmark.find({ userId: dbUser._id })
      .populate('articleId')
      .sort({ savedAt: -1 })
      .lean();

    return NextResponse.json(bookmarks);
  } catch (error: any) {
    console.error('Fetch bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId } = await req.json();
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({ userId: dbUser._id, articleId });

    if (existing) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existing._id });
      
      // Update User bookmarks array
      await User.findByIdAndUpdate(dbUser._id, {
        $pull: { bookmarks: articleId }
      });

      return NextResponse.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      // Add bookmark
      await Bookmark.create({
        userId: dbUser._id,
        articleId,
        savedAt: new Date()
      });

      // Update User bookmarks array
      await User.findByIdAndUpdate(dbUser._id, {
        $addToSet: { bookmarks: articleId }
      });

      return NextResponse.json({ bookmarked: true, message: 'Bookmark saved' });
    }
  } catch (error: any) {
    console.error('Toggle bookmark error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}

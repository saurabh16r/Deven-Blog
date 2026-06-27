import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { ReadingHistory, User } from '@/lib/models';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, readPercentage } = await req.json();
    if (!articleId || readPercentage === undefined) {
      return NextResponse.json({ error: 'Article ID and read percentage are required' }, { status: 400 });
    }

    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find or create history entry
    const existing = await ReadingHistory.findOne({ userId: dbUser._id, articleId });

    if (existing) {
      // Update read percentage (only increase it, never decrease)
      const newPercentage = Math.min(100, Math.max(existing.readPercentage, readPercentage));
      existing.readPercentage = newPercentage;
      existing.lastReadAt = new Date();
      await existing.save();
    } else {
      // Create new reading history entry
      await ReadingHistory.create({
        userId: dbUser._id,
        articleId,
        readPercentage: Math.min(100, readPercentage),
        lastReadAt: new Date(),
      });

      // Increment articlesRead count on user document
      await User.findByIdAndUpdate(dbUser._id, {
        $inc: { articlesRead: 1 }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logging history error:', error);
    return NextResponse.json({ error: 'Failed to log history' }, { status: 500 });
  }
}

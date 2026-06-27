import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User, Bookmark, ReadingHistory, Subscription } from '@/lib/models';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, password, image } = await req.json();
    
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update image if provided
    if (image !== undefined) {
      user.image = image;
    }

    // Update password if provided (for email/credentials users)
    if (password && password.trim()) {
      if (user.provider !== 'credentials') {
        return NextResponse.json({ error: 'OAuth users cannot set/change passwords.' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user._id;

    // Delete user bookmarks, reading history, subscriptions, and user row
    await Bookmark.deleteMany({ userId });
    await ReadingHistory.deleteMany({ userId });
    await Subscription.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    return NextResponse.json({ message: 'Account deleted successfully.' });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 });
  }
}

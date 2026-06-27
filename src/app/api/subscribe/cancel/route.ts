import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User, Subscription } from '@/lib/models';

export async function POST(req: Request) {
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

    user.plan = 'free';
    user.subscriptionStatus = 'cancelled';
    await user.save();

    // Mark active subscriptions as cancelled
    await Subscription.updateMany(
      { userId: user._id, status: 'active' },
      { $set: { status: 'cancelled', endDate: new Date() } }
    );

    return NextResponse.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}

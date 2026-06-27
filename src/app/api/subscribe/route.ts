import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User, Subscription } from '@/lib/models';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Toggle/Upgrade to premium
    user.plan = 'premium';
    user.subscriptionStatus = 'active';
    await user.save();

    // Create Subscription record
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 days premium

    // Delete any existing active subscription for this user
    await Subscription.deleteMany({ userId: user._id });

    await Subscription.create({
      userId: user._id,
      plan: 'premium',
      status: 'active',
      paymentProvider: 'mock_razorpay',
      paymentId: 'mock_raz_sub_' + Math.random().toString(36).substring(7),
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      user: {
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      }
    });
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: 'Failed to create subscription.' }, { status: 500 });
  }
}

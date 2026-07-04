import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User, Subscription } from '@/lib/models';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === 'yourKeySecret') {
      return NextResponse.json({ error: 'Razorpay secret key is not configured.' }, { status: 500 });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment signature verification failed. Transaction was not authenticated.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Upgrade user
    user.plan = 'premium';
    user.subscriptionStatus = 'active';
    await user.save();

    // Create Subscription record
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 days premium

    // Clean up past subscriptions
    await Subscription.deleteMany({ userId: user._id });

    await Subscription.create({
      userId: user._id,
      plan: 'premium',
      status: 'active',
      paymentProvider: 'razorpay',
      paymentId: razorpay_payment_id,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and account upgraded successfully.',
      user: {
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      }
    });
  } catch (error: any) {
    console.error('Razorpay Verification API error:', error);
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}

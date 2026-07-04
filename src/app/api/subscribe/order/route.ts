import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import Razorpay from 'razorpay';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check configuration and return a descriptive error if variables are missing
    if (!keyId || !keySecret || keyId === 'rzp_test_yourKeyId' || keySecret === 'yourKeySecret') {
      return NextResponse.json({ 
        error: 'Razorpay keys are not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.' 
      }, { status: 500 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amount = 299 * 100; // Amount in paise (₹299.00 INR)
    const options = {
      amount,
      currency: 'INR',
      receipt: 'receipt_sub_' + Math.random().toString(36).substring(7),
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      user: {
        name: user.name,
        email: user.email,
      }
    });
  } catch (error: any) {
    console.error('Razorpay Order API error:', error);
    return NextResponse.json({ error: 'Failed to initiate Razorpay order.' }, { status: 500 });
  }
}

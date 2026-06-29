import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { PasswordResetOTP } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Please provide email and a 6-digit verification code.' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();

    // Find the latest active, unverified OTP for this email
    const record = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      active: true,
      verified: false,
    });

    if (!record) {
      return NextResponse.json(
        { error: 'No active verification request found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiry: 10 minutes limit
    const isExpired = Date.now() > record.createdAt.getTime() + 10 * 60 * 1000;
    if (isExpired) {
      record.active = false;
      await record.save();
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check attempts limit: Maximum 5 attempts allowed
    if (record.attempts >= 5) {
      record.active = false;
      await record.save();
      return NextResponse.json(
        { error: 'Too many invalid attempts. Please request a new code.' },
        { status: 400 }
      );
    }

    // Increment attempts
    record.attempts += 1;
    await record.save();

    // Verify OTP against hashed store
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Mark as verified on success
    record.verified = true;
    await record.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User, PasswordResetOTP } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and new password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();

    // Confirm that a verified, active OTP record exists for this email
    const record = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      active: true,
      verified: true,
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Password reset request has expired or is invalid. Please start over.' },
        { status: 400 }
      );
    }

    // Verify it is not older than 15 minutes
    const isExpired = Date.now() > record.createdAt.getTime() + 15 * 60 * 1000;
    if (isExpired) {
      await PasswordResetOTP.deleteMany({ email: normalizedEmail });
      return NextResponse.json(
        { error: 'Reset session has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password in the database
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { password: hashedPassword } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 400 }
      );
    }

    // Delete all OTP records for this email after a successful reset
    await PasswordResetOTP.deleteMany({ email: normalizedEmail });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

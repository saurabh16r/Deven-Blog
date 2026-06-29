import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User, PasswordResetOTP } from '@/lib/models';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();

    // Check if the user exists
    const user = await User.findOne({ email: normalizedEmail });

    // Success response message to prevent email enumeration
    const successResponse = {
      success: true,
      message: "If an account exists, we've sent a verification code.",
    };

    if (!user) {
      // Return generic success even if user doesn't exist
      return NextResponse.json(successResponse);
    }

    // Rate limit check: Maximum 3 requests every 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const requestsCount = await PasswordResetOTP.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (requestsCount >= 3) {
      return NextResponse.json(
        { error: 'Too many verification code requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    // Invalidate previous active OTPs
    await PasswordResetOTP.updateMany(
      { email: normalizedEmail, active: true },
      { $set: { active: false } }
    );

    // Generate secure random 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 12);

    // Create OTP record (expire in 15 minutes for rate limit window, verified within 10 minutes)
    await PasswordResetOTP.create({
      email: normalizedEmail,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    });

    // Send the email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
            background-color: #F9F5EF;
            color: #1F1A17;
            padding: 40px 20px;
            margin: 0;
          }
          .card {
            max-width: 480px;
            margin: 0 auto;
            background-color: #F9F5EF;
            border: 1px solid #E6DED2;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          }
          .logo {
            font-family: Georgia, serif;
            font-size: 24px;
            font-weight: 900;
            margin-bottom: 30px;
            text-align: center;
            letter-spacing: -0.5px;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .otp-container {
            text-align: center;
            margin: 30px 0;
          }
          .otp {
            display: inline-block;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #1F1A17;
            background-color: #F4EDE2;
            padding: 14px 28px;
            border-radius: 6px;
            border: 1px solid #E6DED2;
            font-family: monospace;
          }
          .footer {
            border-top: 1px solid #E6DED2;
            margin-top: 30px;
            padding-top: 20px;
            font-size: 11px;
            color: #6B6258;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">FounderBrief</div>
          <p>Hello,</p>
          <p>We received a request to reset your FounderBrief password.</p>
          <p>Your verification code is:</p>
          <div class="otp-container">
            <div class="otp">${otp}</div>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <div class="footer">
            <strong>FounderBrief</strong><br>
            The smartest startup insights in 5 minutes.
          </div>
        </div>
      </body>
      </html>
    `;

    // Log the OTP in the server terminal for easy development testing
    console.log(`\n===================================`);
    console.log(`[PASSWORD RESET OTP]`);
    console.log(`Email: ${normalizedEmail}`);
    console.log(`Code:  ${otp}`);
    console.log(`===================================\n`);

    const emailRes = await sendEmail({
      to: normalizedEmail,
      subject: 'Reset Your FounderBrief Password',
      html: emailHtml,
    });

    if (!emailRes.success) {
      console.error('Failed to send email via Resend:', emailRes.error);
      // Fallback for local testing without an active Resend API key
      if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({
          success: true,
          message: "Dev Mode: Resend API key is missing. Code printed to your terminal log.",
        });
      }
      return NextResponse.json(
        { error: 'Email service error. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

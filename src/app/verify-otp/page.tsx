'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyOTPFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otpVal, setOtpVal] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto focus the first box on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otpVal];
    // Keep only the last character and verify it's a digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    newOtp[index] = cleaned;
    setOtpVal(newOtp);

    // Auto move to next input if filled
    if (cleaned && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpVal[index] && index > 0) {
        // Clear previous box and focus it
        const newOtp = [...otpVal];
        newOtp[index - 1] = '';
        setOtpVal(newOtp);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpVal(digits);
      inputRefs[5].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fullOtp = otpVal.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      setSuccess('Verification successful!');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(fullOtp)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code.');
      }

      setSuccess('A new verification code has been sent!');
      setTimeLeft(600); // Reset timer to 10 minutes
      setOtpVal(Array(6).fill('')); // Clear inputs
      if (inputRefs[0].current) {
        inputRefs[0].current.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] px-6 py-12 sm:py-16 bg-background border border-border rounded-lg shadow-sm">
      {/* Editorial Header */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground leading-tight">
          Verify Your Email
        </h1>
        <p className="text-sm font-medium text-muted">
          We&apos;ve sent a 6-digit verification code to
        </p>
        <p className="text-xs font-bold text-foreground truncate select-all px-2 bg-surface py-1 rounded inline-block">
          {email}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OTP Input Segmented Layout */}
        <div className="flex justify-between items-center gap-2">
          {otpVal.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 bg-surface border border-border rounded-lg text-center text-xl font-bold font-mono focus:outline-none focus:border-muted text-foreground transition-colors"
            />
          ))}
        </div>

        {/* Timer block */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted font-medium select-none">Code Expiration</span>
          <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Actions buttons */}
        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || otpVal.join('').length !== 6}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              disabled={timeLeft > 0 || resending}
              onClick={handleResend}
              className="text-muted hover:text-foreground hover:underline transition-all disabled:opacity-50 disabled:no-underline font-bold text-xs cursor-pointer"
            >
              {resending ? 'Sending Code...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </form>

      {/* Bottom Link */}
      <div className="mt-8 pt-6 border-t border-border text-center text-xs font-medium text-muted">
        <Link href="/login" className="text-foreground hover:underline font-bold transition-all">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      {/* Brand logo at top */}
      <div className="mb-8 select-none">
        <Link href="/" className="flex items-center space-x-2 group">
          <img
            src="/deven-logo.png"
            alt="Deven Logo"
            className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <span className="font-serif font-black text-3xl tracking-tight text-foreground">
            Deven
          </span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[440px] px-6 py-12 bg-background border border-border rounded-lg shadow-sm text-center font-serif text-muted">
          Loading verification details...
        </div>
      }>
        <VerifyOTPFormContent />
      </Suspense>
    </div>
  );
}

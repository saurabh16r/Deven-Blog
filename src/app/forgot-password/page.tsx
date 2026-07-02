'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEmailNotFound(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404 && data.code === 'EMAIL_NOT_FOUND') {
          setEmailNotFound(true);
        }
        throw new Error(data.error || 'Failed to request verification code.');
      }

      setSuccess(data.message || "✅ OTP sent successfully. We've sent a verification code to your email address.");
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again in a few moments.');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="w-full max-w-[440px] px-6 py-12 sm:py-16 bg-background border border-border rounded-lg shadow-sm">
        {/* Editorial Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-3xl font-serif font-black tracking-tight text-foreground leading-tight">
            Forgot your password?
          </h1>
          <p className="text-sm font-medium text-muted">
            Enter your email address and we&apos;ll send you a one-time verification code.
          </p>
        </div>

        {error && !emailNotFound && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailNotFound) {
                  setEmailNotFound(false);
                  setError('');
                }
              }}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted/50 text-sm focus:outline-none focus:border-muted transition-colors"
            />
            {emailNotFound && (
              <div className="mt-3 text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed border border-red-500/20 bg-red-500/5 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          {emailNotFound ? (
            <div className="space-y-3 pt-1">
              <Link
                href="/signup"
                className="w-full text-center block py-2.5 px-4 bg-[#FFC247] text-black hover:bg-[#FFC247]/90 font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="w-full text-center block py-2.5 px-4 border border-border hover:bg-surface text-foreground font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking...
                </span>
              ) : (
                'Send OTP'
              )}
            </button>
          )}
        </form>

        {/* Bottom Link */}
        {!emailNotFound && (
          <div className="mt-8 pt-6 border-t border-border text-center text-xs font-medium text-muted">
            <Link href="/login" className="text-foreground hover:underline font-bold transition-all">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

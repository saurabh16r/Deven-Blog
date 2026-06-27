'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Handle URL errors (e.g. Google OAuth failure)
  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      if (err === 'OAuthSignin' || err === 'OAuthCallback') {
        setError('Could not sign in with Google. Please try again.');
      } else {
        setError(err);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="w-full max-w-[440px] px-6 py-12 sm:py-16 bg-background border border-border rounded-lg shadow-sm">
      {/* Editorial Header */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-sm font-medium text-muted">
          Continue reading founder insights.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded text-center">
          {error}
        </div>
      )}

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border hover:bg-surface text-foreground font-semibold text-sm rounded-lg transition-colors cursor-pointer"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-border"></div>
        <span className="px-3 text-xs uppercase font-extrabold tracking-wider text-muted select-none">
          OR
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted/50 text-sm focus:outline-none focus:border-muted transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted/50 text-sm focus:outline-none focus:border-muted transition-colors"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <label className="flex items-center gap-2 text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-primary h-3.5 w-3.5 border-border rounded"
            />
            <span>Remember Me</span>
          </label>
          <button
            type="button"
            onClick={() => setError('Password reset instructions will be sent to your email.')}
            className="text-muted hover:text-foreground hover:underline transition-all"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer flex items-center justify-center"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Bottom Link */}
      <div className="mt-8 pt-6 border-t border-border text-center text-xs font-medium text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-foreground hover:underline font-bold transition-all">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      {/* Brand logo at top */}
      <div className="mb-8">
        <Link href="/" className="font-serif font-black text-2xl tracking-tight text-foreground">
          Deven
        </Link>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[440px] px-6 py-12 bg-background border border-border rounded-lg shadow-sm text-center font-serif text-muted">
          Loading...
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Check, Lock, Loader2, AlertCircle } from 'lucide-react';
import { pricingConfig } from '@/lib/pricingConfig';
import Link from 'next/link';

interface PaywallCardProps {
  slug: string;
  onPaymentSuccess?: () => void;
}

export default function PaywallCard({ slug, onPaymentSuccess }: PaywallCardProps) {
  const { data: session, status, update } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  
  const callbackUrl = `/articles/${slug}?login=1`;
  const monthlyPlan = pricingConfig.plans.monthly;

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  const handleRazorpayUpgrade = async () => {
    if (typeof window === 'undefined') return;

    if (!(window as any).Razorpay) {
      setUpgradeError('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setIsUpgrading(true);
    setUpgradeError('');

    try {
      const options = {
        key: 'rzp_test_FBPremium999', // Valid-looking dummy key for Razorpay sandbox
        amount: monthlyPlan.price * 100, // Amount in paise
        currency: monthlyPlan.currency,
        name: 'Deven',
        description: 'Deven Premium Subscription',
        image: '/logo.png',
        handler: async function (response: any) {
          try {
            const res = await fetch('/api/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || 'Failed to complete subscription.');
            }

            // Success: refresh NextAuth session token
            await update();

            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          } catch (err: any) {
            setUpgradeError(err.message || 'Verification failed. Please contact support.');
            setIsUpgrading(false);
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#D8A21A', // brand gold
        },
        modal: {
          ondismiss: function () {
            setIsUpgrading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setUpgradeError('Could not initialize Razorpay checkout.');
      setIsUpgrading(false);
    }
  };

  const benefits = [
    'Unlimited Articles',
    'AI Executive Briefings',
    'Audio Articles',
    'Weekly Founder Reports',
    'Early Access',
  ];

  const isFreePlanUser = status === 'authenticated' && session?.user?.plan === 'free';

  return (
    <div className="my-10 border border-primary bg-surface/30 rounded-lg overflow-hidden max-w-lg mx-auto shadow-sm animate-fade-in relative z-10 font-sans">
      {/* Paywall Header */}
      <div className="bg-primary/10 border-b border-primary/20 p-6 text-center space-y-2 select-none">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-[#D8A21A] dark:text-primary border border-primary/30">
          <Lock className="h-4.5 w-4.5" />
        </div>
        <h3 className="font-serif font-black text-xl text-foreground flex items-center justify-center gap-1.5 mt-2">
          {isFreePlanUser ? '🔒 Continue Reading' : 'Continue Reading'}
        </h3>
        <p className="text-xs text-muted font-medium max-w-sm mx-auto leading-relaxed">
          {isFreePlanUser
            ? "You've reached your 5 free FounderBrief articles. Upgrade to Premium to continue reading this article and unlock unlimited founder insights."
            : "You've reached your 5 free FounderBrief articles. Continue reading this article instantly and unlock every founder briefing."}
        </p>
      </div>

      {/* Paywall Content */}
      <div className="p-6 bg-background space-y-6">
        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 font-medium text-foreground select-none">
              <Check className="h-3.5 w-3.5 text-[#2E8B57] dark:text-green-500 shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Pricing indicator */}
        <div className="text-center pt-2 border-t border-border select-none">
          <span className="text-xs font-bold text-muted uppercase tracking-wider block">Membership Plan</span>
          <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
            <span className="text-2xl font-serif font-black text-foreground">
              {monthlyPlan.currencySymbol}{monthlyPlan.price}
            </span>
            <span className="text-xs text-muted font-semibold">/ {monthlyPlan.interval}</span>
          </div>
        </div>

        {upgradeError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{upgradeError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isFreePlanUser ? (
            <>
              {/* Premium upgrade checkout button */}
              <button
                onClick={handleRazorpayUpgrade}
                disabled={isUpgrading}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-xs tracking-wide rounded-lg transition-colors cursor-pointer"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Upgrade to Premium</span>
                )}
              </button>
              <div className="text-center text-[10px] font-semibold text-muted select-none">
                Cancel anytime. Secure payments powered by Razorpay.
              </div>
            </>
          ) : (
            <>
              {/* Google signup/login */}
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-xs tracking-wide rounded-lg transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    opacity="0.9"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    opacity="0.8"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    opacity="0.9"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Email signup */}
              <Link
                href={`/signup?callbackUrl=${callbackUrl}`}
                className="w-full text-center block py-2.5 border border-border hover:bg-surface text-foreground font-bold text-xs tracking-wide rounded-lg transition-colors cursor-pointer"
              >
                Continue with Email
              </Link>

              {/* Bottom signin link */}
              <div className="text-center text-xs font-semibold text-muted pt-2 select-none">
                Already have an account?{' '}
                <Link href={`/login?callbackUrl=${callbackUrl}`} className="text-foreground hover:underline font-bold transition-all">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

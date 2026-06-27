'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionClientProps {
  initialPlan: string;
  initialStatus: string;
  endDate?: string | null;
}

export default function SubscriptionClient({ initialPlan, initialStatus, endDate }: SubscriptionClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isPremium = initialPlan === 'premium' && (initialStatus === 'active' || initialStatus === 'cancelled');

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Premium subscription? you will lose unlimited access immediately.')) {
      return;
    }

    setLoading(false);
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/subscribe/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to cancel subscription.');
      } else {
        setSuccess('Subscription cancelled successfully.');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Unlimited Articles & Archive access',
    'AI Executive Briefings & summaries',
    'Audio Articles (TTS narrated voice reads)',
    'Weekly Premium Founder Reports',
    'Exclusive interviews & metrics breakdowns'
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded text-center flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded text-center">
          {success}
        </div>
      )}

      {/* Plan Status Banner */}
      <div className="border border-border p-6 rounded-lg bg-surface/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            Current Plan
          </span>
          <div className="text-xl font-serif font-black text-foreground capitalize mt-0.5">
            {initialPlan} membership
          </div>
          <p className="text-xs text-muted font-medium mt-1">
            Status: <span className="font-bold">{initialStatus === 'active' ? 'Active' : initialStatus === 'cancelled' ? 'Cancelled (Expiring)' : 'Free tier (Limited access)'}</span>
          </p>
          {isPremium && endDate && (
            <p className="text-[10px] text-muted font-semibold mt-1">
              Expiration Date: {endDate}
            </p>
          )}
        </div>
        
        {isPremium && initialStatus === 'active' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg">
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Premium Verified</span>
          </div>
        )}
      </div>

      {/* Premium Card / Upgrade Info */}
      {!isPremium ? (
        <div className="border border-primary rounded-lg overflow-hidden shadow-sm">
          {/* Card Header Banner */}
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-8 space-y-2">
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-foreground">
              Unlock Deven Premium
            </h2>
            <p className="text-sm font-medium text-muted">
              Get unlimited access to advanced briefings, case studies, and insights.
            </p>
          </div>

          {/* Card Content */}
          <div className="p-6 sm:p-8 bg-background space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-muted block">
                WHAT IS INCLUDED
              </span>
              <ul className="space-y-3.5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-[#2E8B57] dark:text-green-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & Upgrade CTA */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-black text-foreground">₹299</span>
                  <span className="text-muted text-xs font-semibold">/ month</span>
                </div>
                <p className="text-xs text-muted font-medium mt-1">
                  Cancel anytime. Secure transactions.
                </p>
              </div>

              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-bold tracking-wide rounded-lg transition-all cursor-pointer text-center"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border p-6 rounded-lg bg-surface/20 space-y-4">
          <h3 className="font-serif font-black text-lg text-foreground">
            Thank you for being a Premium Member!
          </h3>
          <p className="text-sm text-muted leading-relaxed font-medium">
            You currently have active premium access to all article read-aloud options, unlimited briefs, and weekly reports.
          </p>
          
          {initialStatus === 'active' && (
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {loading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

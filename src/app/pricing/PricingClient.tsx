'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';
import { pricingConfig } from '@/lib/pricingConfig';

export default function PricingClient() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const monthlyPlan = pricingConfig.plans.monthly;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (status !== 'authenticated') {
      router.push('/login?callbackUrl=/pricing');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay payment SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Initiate order creation on backend
      const orderRes = await fetch('/api/subscribe/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || 'Failed to initiate order. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Configure Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Deven Premium',
        description: 'Monthly premium subscription for founder briefings',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
        },
        theme: {
          color: '#FFC247', // matching Deven primary yellow theme
        },
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await fetch('/api/subscribe/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setError(verifyData.error || 'Payment verification failed.');
            } else {
              setSuccess('Thank you! Your payment was verified and account upgraded successfully.');
              // Refresh session token so header badges/access updates
              await update();
              router.refresh();
              setTimeout(() => {
                router.push('/profile');
              }, 1500);
            }
          } catch (err) {
            setError('An error occurred during payment verification.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      setError('An error occurred during payment processing.');
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'What is Deven Premium?',
      a: 'Premium gives you full access to our entire catalog of founder briefings, advanced AI-generated executive summaries, audio narration player options, and custom weekly insights reports.'
    },
    {
      q: 'Can I cancel my subscription?',
      a: 'Yes, you can cancel your subscription at any time directly from your profile account settings page. No questions asked.'
    },
    {
      q: 'Do you offer a trial period?',
      a: 'We provide 2 free articles to every visitor. This acts as a trial to let you see the depth and value of our briefings before subscribing.'
    },
    {
      q: 'What payment methods do you support?',
      a: 'We support all major credit cards, debit cards, UPI payments, and popular net banking options through our secure payment gateway.'
    }
  ];

  return (
    <div className="max-w-[640px] mx-auto space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-[1.15] text-foreground">
          Deven Premium
        </h1>
        <p className="text-sm font-medium text-muted max-w-md mx-auto">
          Actionable startup insights, curated tools, and growth guides delivered directly to your inbox.
        </p>
      </div>

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

      {/* Subscription Card */}
      <div className="border border-border rounded-lg overflow-hidden bg-surface/30">
        <div className="p-6 sm:p-8 bg-surface/50 border-b border-border space-y-2">
          <div className="flex justify-between items-baseline">
            <h2 className="font-serif font-black text-xl text-foreground">
              {monthlyPlan.name.split(' - ')[0]}
            </h2>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-serif font-black text-foreground">
                {monthlyPlan.currencySymbol}{monthlyPlan.price}
              </span>
              <span className="text-[11px] font-semibold text-muted">/ {monthlyPlan.interval}</span>
            </div>
          </div>
          <p className="text-xs text-muted font-medium">
            curated for builders, product managers, and founders looking to level up.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-background">
          <ul className="space-y-3.5">
            {pricingConfig.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-[#2E8B57] dark:text-green-500 shrink-0 mt-0.5" />
                <span className="font-medium text-foreground/90">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          >
            {loading ? 'Processing...' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6 pt-6 border-t border-border">
        <div className="text-center">
          <h2 className="font-serif font-black text-xl text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted mt-1">
            Answers to common questions about our membership model.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="font-serif font-bold text-sm text-foreground flex gap-1.5 items-start">
                <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-muted font-medium leading-relaxed pl-5.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

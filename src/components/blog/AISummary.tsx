'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles, Lock, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AISummaryProps {
  summaryText: string;
  enabled: boolean;
  isPremium?: boolean;
  slug?: string;
}

export default function AISummary({ summaryText, enabled, isPremium: initialPremium, slug }: AISummaryProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [fetchedSummary, setFetchedSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync isPremium dynamically
  const isPremium = initialPremium || (status === 'authenticated' && session?.user?.plan === 'premium');

  useEffect(() => {
    if (isPremium && !summaryText && !fetchedSummary && !loading && slug) {
      setLoading(true);
      fetch(`/api/summary?slug=${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch summary');
          return res.json();
        })
        .then((data) => {
          if (data.summary) {
            setFetchedSummary(data.summary);
          }
        })
        .catch((err) => console.error('Error fetching summary:', err))
        .finally(() => setLoading(false));
    }
  }, [isPremium, summaryText, fetchedSummary, loading, slug]);

  if (!enabled) return null;

  // Render Premium Upgrade Card for Free Users
  if (!isPremium) {
    return (
      <div className="mb-8 w-full border border-primary/20 dark:border-[#2C2C2F] rounded-lg bg-surface/30 dark:bg-[#171717]/60 overflow-hidden font-sans p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-4.5 w-4.5 text-[#FFC247] fill-[#FFC247]" />
            <span className="font-serif font-black text-sm sm:text-base tracking-wide text-foreground">
              AI Executive Briefing
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FFC247] text-black">
              👑 Premium
            </span>
          </div>
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface border border-border text-muted shrink-0 select-none">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </div>

        <p className="text-xs text-muted leading-relaxed font-medium">
          Unlock AI-powered executive summaries that help you understand every article in under one minute.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {status === 'authenticated' ? (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#FFC247] text-black hover:bg-[#FFC247]/90 font-bold text-xs rounded-lg transition-colors cursor-pointer select-none"
            >
              Upgrade to Premium
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=/pricing"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#FFC247] text-black hover:bg-[#FFC247]/90 font-bold text-xs rounded-lg transition-colors cursor-pointer select-none"
            >
              Sign In & Upgrade
            </Link>
          )}
          <span className="text-[10px] font-semibold text-muted select-none">
            Included with FounderBrief Premium.
          </span>
        </div>
      </div>
    );
  }

  const activeSummary = summaryText || fetchedSummary;

  if (loading) {
    return (
      <div className="mb-8 w-full border border-border dark:border-[#2C2C2F] rounded-lg bg-background dark:bg-[#171717] p-5 flex items-center justify-center space-x-2 text-muted text-xs font-semibold font-sans select-none">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading AI briefing...</span>
      </div>
    );
  }

  if (!activeSummary) return null;

  // Parse lines to pull bullets cleanly
  const lines = activeSummary
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 3);

  // If first line is a title, isolate it
  const hasTitle = lines[0] && !lines[0].startsWith('•') && !lines[0].startsWith('-') && !lines[0].startsWith('*');
  const displayTitle = hasTitle ? lines[0] : 'Key Takeaways';
  const bullets = hasTitle ? lines.slice(1) : lines;

  const cleanBullets = bullets.map(b => b.replace(/^[•\-\*]\s*/, ''));

  return (
    <div className="mb-8 w-full border border-border dark:border-[#2C2C2F] rounded-lg bg-background dark:bg-[#171717] overflow-hidden">
      {/* Header Button Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors focus:outline-hidden cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <Sparkles className="h-4 w-4 text-primary fill-primary animate-pulse" />
          <span className="font-serif font-black text-sm sm:text-base tracking-wide text-foreground">
            AI Executive Briefing
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FFC247]/10 text-[#FFC247] border border-[#FFC247]/30 select-none">
            👑 Premium
          </span>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className="h-4.5 w-4.5 text-muted" />
          ) : (
            <ChevronDown className="h-4.5 w-4.5 text-muted" />
          )}
        </div>
      </button>

      {/* Bullet List Container */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="px-6 py-5 bg-background dark:bg-[#171717] border-t border-border dark:border-[#2C2C2F] space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-muted">
                {displayTitle}
              </h4>
              <ul className="space-y-3.5">
                {cleanBullets.map((bullet, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-start text-sm sm:text-base text-foreground dark:text-[#D4D4D4] leading-relaxed font-sans"
                  >
                    {/* Neutral bullet indicator */}
                    <span className="mr-3 text-muted select-none font-bold">
                      —
                    </span>
                    <span>{bullet}</span>
                  </motion.li>
                ))}
                {cleanBullets.length === 0 && (
                  <li className="text-sm text-muted italic flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Summary is currently empty. Regenerate in admin settings if needed.</span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

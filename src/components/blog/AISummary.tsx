'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

interface AISummaryProps {
  summaryText: string;
  enabled: boolean;
}

export default function AISummary({ summaryText, enabled }: AISummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!enabled || !summaryText) return null;

  // Parse lines to pull bullets cleanly
  const lines = summaryText
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
          {/* Sparkles icon uses brand yellow accent as permitted in specs */}
          <Sparkles className="h-4 w-4 text-primary fill-primary" />
          <span className="font-serif font-black text-sm sm:text-base tracking-wide text-foreground">
            AI Executive Briefing
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

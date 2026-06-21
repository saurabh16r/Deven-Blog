'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

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

  // If first line is a title like "Key Takeaways", we can isolate it
  const hasTitle = lines[0] && !lines[0].startsWith('•') && !lines[0].startsWith('-') && !lines[0].startsWith('*');
  const displayTitle = hasTitle ? lines[0] : 'Key Takeaways';
  const bullets = hasTitle ? lines.slice(1) : lines;

  const cleanBullets = bullets.map(b => b.replace(/^[•\-\*]\s*/, ''));

  return (
    <div className="mb-8 w-full border border-primary/25 rounded-xl overflow-hidden shadow-xs bg-surface/50">
      {/* Header Button Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors focus:outline-hidden cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-sans font-extrabold text-sm sm:text-base tracking-wide text-foreground flex items-center gap-1.5">
            ✨ AI Summary Key Takeaways
          </span>
        </div>
        <div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 py-5 bg-background/50 border-t border-border space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-primary">
                {displayTitle}
              </h4>
              <ul className="space-y-3">
                {cleanBullets.map((bullet, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start text-sm sm:text-base text-foreground/90 leading-relaxed font-sans"
                  >
                    {/* Unique yellow bullet indicator */}
                    <span className="mr-3 h-5 w-5 flex-shrink-0 text-primary flex items-center justify-center font-bold">
                      ✦
                    </span>
                    <span>{bullet}</span>
                  </motion.li>
                ))}
                {cleanBullets.length === 0 && (
                  <li className="text-sm text-muted-foreground italic flex items-center space-x-2">
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

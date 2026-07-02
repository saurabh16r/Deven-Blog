'use client';

import React, { useState } from 'react';
import { Sparkles, Headphones, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PremiumReadingTools() {
  const { data: session, status } = useSession();
  const [isHoveredCTA, setIsHoveredCTA] = useState(false);

  const pricingUrl = status === 'authenticated' ? '/pricing' : '/login?callbackUrl=/pricing';

  return (
    <div 
      className="mb-8 w-full rounded-2xl bg-[#1F1A17] dark:bg-[#181818] p-5 space-y-4 hover:border-white/15 transition-all duration-300 font-sans text-white max-w-[760px] mx-auto border"
      style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
    >
      {/* SECTION 1 — Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base select-none">✨</span>
          <h3 className="font-serif font-black text-sm sm:text-base tracking-wide text-white">
            Premium Reading Tools
          </h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FFC247] text-black tracking-wider uppercase select-none">
          Premium Feature
        </span>
      </div>
      <p className="text-xs text-neutral-400 font-normal leading-relaxed">
        Unlock exclusive tools that help you consume articles faster and more efficiently.
      </p>

      {/* SECTION 2 — Features */}
      <div className="space-y-3.5 pt-1.5">
        {/* Feature 1 */}
        <div className="group/row flex items-center justify-between p-2.5 -mx-2.5 rounded-xl hover:bg-white/3 transition-colors duration-200">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0 text-[#FFC247]">
              <Sparkles className="h-4 w-4 fill-[#FFC247]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-sans font-semibold text-xs text-white">
                AI Executive Brief
              </h4>
              <p className="font-sans font-normal text-[11px] text-neutral-400 leading-normal max-w-sm sm:max-w-xl">
                Understand this article in one minute with an AI-generated executive summary.
              </p>
            </div>
          </div>
          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 shrink-0 select-none">
            <Lock className="h-3 w-3" />
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="border-t border-white/8" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Feature 2 */}
        <div className="group/row flex items-center justify-between p-2.5 -mx-2.5 rounded-xl hover:bg-white/3 transition-colors duration-200">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0 text-[#FFC247]">
              <Headphones className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-sans font-semibold text-xs text-white">
                Audio Article
              </h4>
              <p className="font-sans font-normal text-[11px] text-neutral-400 leading-normal max-w-sm sm:max-w-xl">
                Listen to a professionally narrated version of this article.
              </p>
            </div>
          </div>
          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 shrink-0 select-none">
            <Lock className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* SECTION 3 — CTA */}
      <div className="flex justify-end pt-2">
        <Link
          href={pricingUrl}
          onMouseEnter={() => setIsHoveredCTA(true)}
          onMouseLeave={() => setIsHoveredCTA(false)}
          className="inline-flex items-center space-x-1 text-[#FFC247] hover:text-[#ffd685] font-sans font-bold text-xs transition-colors cursor-pointer select-none"
        >
          <span>Unlock Premium</span>
          <ArrowRight
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isHoveredCTA ? 'translate-x-1.5' : 'translate-x-0'
            }`}
          />
        </Link>
      </div>
    </div>
  );
}

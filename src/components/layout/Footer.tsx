'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNewsletterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('newsletter-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#newsletter-section';
    }
  };

  return (
    <footer className="bg-background dark:bg-[#111111] text-foreground dark:text-[#9A9A9A] border-t border-border dark:border-[#2C2C2F] mt-auto py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        {/* Centered Serif Logo */}
        <div className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-foreground select-none">
          Deven
        </div>

        {/* Flat navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-semibold">
          <Link href="/privacy" className="text-[#6B6258] dark:text-[#D4D4D4] hover:text-[#1F1A17] dark:hover:text-[#FFC247] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[#6B6258] dark:text-[#D4D4D4] hover:text-[#1F1A17] dark:hover:text-[#FFC247] transition-colors">
            Terms of Service
          </Link>
          <a href="mailto:hello@deven.com" className="text-[#6B6258] dark:text-[#D4D4D4] hover:text-[#1F1A17] dark:hover:text-[#FFC247] transition-colors">
            Contact
          </a>
          <a href="#newsletter-section" onClick={handleNewsletterClick} className="text-[#6B6258] dark:text-[#D4D4D4] hover:text-[#1F1A17] dark:hover:text-[#FFC247] transition-colors">
            Newsletter
          </a>
        </div>

        {/* Divider line */}
        <div className="w-16 h-[1px] bg-border mx-auto" />

        {/* Copyright details */}
        <div className="space-y-1 text-xs text-muted">
          <p>&copy; {currentYear} Deven Editorial. All rights reserved.</p>
          <p className="font-medium text-[10px] tracking-wide uppercase opacity-75">Dedicated to the founders of tomorrow.</p>
        </div>

        {/* Social Icons (X and LinkedIn) */}
        <div className="flex justify-center items-center gap-6 pt-2">
          {/* X (formerly Twitter) icon */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-foreground transition-colors"
            aria-label="X / Twitter"
          >
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* LinkedIn icon */}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

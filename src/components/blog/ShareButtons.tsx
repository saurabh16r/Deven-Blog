'use client';

import React, { useState, useEffect } from 'react';
import { Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTwitterUrl = () => {
    if (!mounted || typeof window === 'undefined') return '#';
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Read "${title}" on Deven: `
    )}&url=${encodeURIComponent(window.location.href)}`;
  };

  const getLinkedinUrl = () => {
    if (!mounted || typeof window === 'undefined') return '#';
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.href
    )}`;
  };

  return (
    <div className="flex flex-col space-y-4">
      <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">
        Share insight
      </span>
      <div className="flex items-center gap-2.5">
        {/* Twitter Share */}
        <a
          href={getTwitterUrl()}
          target="_blank"
          rel="noreferrer"
          className="h-10 w-10 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors bg-card"
          title="Share on Twitter"
        >
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        {/* LinkedIn Share */}
        <a
          href={getLinkedinUrl()}
          target="_blank"
          rel="noreferrer"
          className="h-10 w-10 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors bg-card"
          title="Share on LinkedIn"
        >
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </a>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="h-10 w-10 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors bg-card cursor-pointer"
          title="Copy Link"
        >
          {copied ? (
            <Check className="h-4.5 w-4.5 text-green-500" />
          ) : (
            <Link2 className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}


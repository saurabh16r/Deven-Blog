'use client';

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface BookmarkButtonProps {
  articleId: string;
  initialBookmarked: boolean;
  premiumStyle?: boolean;
}

export default function BookmarkButton({ articleId, initialBookmarked, premiumStyle = false }: BookmarkButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleBookmarkToggle = async () => {
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const buttonClasses = premiumStyle
    ? `flex items-center justify-center h-[42px] w-[42px] rounded-full border transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] cursor-pointer ${
        bookmarked
          ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
          : 'border-border text-muted hover:text-foreground hover:bg-surface hover:border-muted/30'
      }`
    : `p-2 border rounded-full transition-colors cursor-pointer ${
        bookmarked 
          ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
          : 'border-border text-muted hover:text-foreground hover:bg-surface'
      }`;

  return (
    <button 
      onClick={handleBookmarkToggle}
      disabled={loading}
      className={buttonClasses}
      title={bookmarked ? "Remove bookmark" : "Bookmark briefing"}
    >
      <Bookmark className={`h-4 w-4 stroke-[1.5] ${bookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}

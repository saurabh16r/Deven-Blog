'use client';

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface BookmarkButtonProps {
  articleId: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ articleId, initialBookmarked }: BookmarkButtonProps) {
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

  return (
    <button 
      onClick={handleBookmarkToggle}
      disabled={loading}
      className={`p-2 border rounded-full transition-colors cursor-pointer ${
        bookmarked 
          ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
          : 'border-border text-muted hover:text-foreground hover:bg-surface'
      }`}
      title={bookmarked ? "Remove bookmark" : "Bookmark briefing"}
    >
      <Bookmark className={`h-4 w-4 stroke-[1.5] ${bookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}

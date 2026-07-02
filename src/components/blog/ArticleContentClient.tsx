'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AudioPlayer from '@/components/blog/AudioPlayer';
import PaywallCard from '@/components/blog/PaywallCard';
import { injectHeadingIds } from '@/lib/utils';

interface ArticleContentClientProps {
  slug: string;
  initialLocked: boolean;
  freeContent: string;
  blurredContent: string;
  audioUrl: string;
  audioEnabled: boolean;
  isPremium: boolean;
}

export default function ArticleContentClient({
  slug,
  initialLocked,
  freeContent,
  blurredContent,
  audioUrl,
  audioEnabled,
  isPremium,
}: ArticleContentClientProps) {
  const { data: session, status } = useSession();
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [content, setContent] = useState(freeContent);
  const [loading, setLoading] = useState(false);

  // Sync state if user is premium or becomes premium
  useEffect(() => {
    if (status === 'authenticated' && (session?.user?.plan === 'premium' || session?.user?.plan === 'pro')) {
      if (isLocked) {
        unlockArticle();
      }
    }
  }, [session, status]);

  const unlockArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${slug}/content`);
      if (res.ok) {
        const data = await res.json();
        const fullContentWithIds = injectHeadingIds(data.content);
        setContent(fullContentWithIds);
        setIsLocked(false);
      } else {
        console.error('Failed to fetch premium content');
      }
    } catch (err) {
      console.error('Error fetching premium content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    unlockArticle();
  };

  return (
    <div className="relative font-sans">
      {/* Audio player */}
      {audioEnabled && (
        <AudioPlayer audioUrl={audioUrl} isPreviewOnly={isLocked} isPremium={isPremium} slug={slug} />
      )}

      {/* Article text body */}
      <div
        className="ProseMirror editorial-text text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: isLocked ? content : content }}
      />

      {isLocked && (
        <>
          {/* Inline Paywall Card */}
          <PaywallCard slug={slug} onPaymentSuccess={handlePaymentSuccess} />

          {/* Blurred Content Teaser (Scrambled & Locked) */}
          <div className="relative max-h-[320px] overflow-hidden select-none pointer-events-none mb-12">
            <div
              className="ProseMirror editorial-text text-foreground/90 leading-relaxed filter blur-[6px] opacity-25"
              dangerouslySetInnerHTML={{ __html: blurredContent }}
            />
            {/* Fading Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none z-10" />
          </div>
        </>
      )}
    </div>
  );
}

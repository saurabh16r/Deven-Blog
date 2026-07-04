'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface HistoryTrackerProps {
  articleId: string;
  slug: string;
}

export default function HistoryTracker({ articleId, slug }: HistoryTrackerProps) {
  const { status } = useSession();
  const lastLoggedPercent = useRef<number>(0);
  
  // Clear visitor read slugs cookie when user logs in (becomes authenticated)
  useEffect(() => {
    if (status === 'authenticated') {
      document.cookie = 'fb_read_slugs=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, [status]);
  
  // Track read slugs client-side for visitors
  useEffect(() => {
    if (status === 'unauthenticated') {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const setCookie = (name: string, value: string, days = 365) => {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
      };

      const rawSlugs = getCookie('fb_read_slugs');
      let slugs: string[] = [];
      try {
        if (rawSlugs) {
          slugs = JSON.parse(decodeURIComponent(rawSlugs));
        }
      } catch (e) {
        slugs = [];
      }

      if (!slugs.includes(slug)) {
        slugs.push(slug);
        setCookie('fb_read_slugs', encodeURIComponent(JSON.stringify(slugs)));
      }
    }
  }, [status, slug]);

  // Log reading progress for authenticated users
  useEffect(() => {
    if (status !== 'authenticated') return;

    let timeoutId: NodeJS.Timeout;
    
    const logHistory = async (percentage: number) => {
      if (percentage <= lastLoggedPercent.current) return;
      lastLoggedPercent.current = percentage;

      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleId, readPercentage: percentage }),
        });
      } catch (err) {
        console.error('Error logging reading history:', err);
      }
    };

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        
        const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
        
        // Log at milestones
        let milestone = 0;
        if (scrollPercent >= 90) milestone = 100;
        else if (scrollPercent >= 75) milestone = 75;
        else if (scrollPercent >= 50) milestone = 50;
        else if (scrollPercent >= 25) milestone = 25;
        else if (scrollPercent >= 10) milestone = 10;

        if (milestone > lastLoggedPercent.current) {
          logHistory(milestone);
        }
      }, 500); // Debounce
    };

    window.addEventListener('scroll', handleScroll);
    // Log initial view progress
    logHistory(10);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [status, articleId]);

  return null;
}

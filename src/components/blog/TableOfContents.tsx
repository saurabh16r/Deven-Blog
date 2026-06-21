'use client';

import React, { useState, useEffect } from 'react';
import { slugify } from '@/lib/utils';

interface HeaderItem {
  id: string;
  text: string;
}

interface TableOfContentsProps {
  htmlContent: string;
}

export default function TableOfContents({ htmlContent }: TableOfContentsProps) {
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Parse headers out of HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const h2Elements = doc.querySelectorAll('h2');
    
    const items: HeaderItem[] = [];
    h2Elements.forEach((el) => {
      const text = el.textContent || el.innerText || '';
      const id = slugify(text);
      items.push({ id, text });
    });
    setHeaders(items);
  }, [htmlContent]);

  useEffect(() => {
    if (headers.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Offset for navbar

      let currentActiveId = '';
      for (const header of headers) {
        const element = document.getElementById(header.id);
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            currentActiveId = header.id;
          }
        }
      }

      // Fallback to first heading if scrolled high
      if (!currentActiveId && headers[0]) {
        currentActiveId = headers[0].id;
      }
      
      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call to set active header
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headers]);

  const handleHeadingClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Navbar offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (headers.length === 0) return null;

  return (
    <nav className="space-y-4">
      <h3 className="text-xs uppercase font-extrabold tracking-widest text-foreground border-b border-border pb-2">
        Table of Contents
      </h3>
      <ul className="space-y-3">
        {headers.map((header) => (
          <li key={header.id}>
            <a
              href={`#${header.id}`}
              onClick={(e) => handleHeadingClick(e, header.id)}
              className={`block text-sm font-semibold transition-all leading-tight border-l-2 pl-3 ${
                activeId === header.id
                  ? 'text-primary border-primary pl-4 font-bold'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {header.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

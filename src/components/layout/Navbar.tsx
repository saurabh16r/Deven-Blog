'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import { Menu, X, Sun, Moon, Zap } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles' },
    { name: 'Categories', href: '/#categories' },
    { name: 'About', href: '#about' }
  ];

  const handleCTAClick = (e: React.MouseEvent) => {
    const element = document.getElementById('newsletter-section');
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const isHome = pathname === '/';

  // Transparent / Dark Glass on Home, Standard Theme-Aware on other pages
  const headerClass = isHome
    ? scrolled
      ? 'bg-black/75 backdrop-blur-md border-b border-white/10 shadow-lg text-white'
      : 'bg-transparent text-white'
    : scrolled
      ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm text-foreground'
      : 'bg-transparent text-foreground';

  const linkClass = (href: string) => {
    const isActive = pathname === href || (href.startsWith('/#') && pathname === '/');
    if (isHome) {
      return isActive
        ? 'text-primary font-bold text-sm tracking-wide transition-all'
        : 'text-white/80 hover:text-primary font-medium text-sm tracking-wide transition-colors duration-200';
    } else {
      return isActive
        ? 'text-primary font-bold text-sm tracking-wide transition-all'
        : 'text-muted-foreground hover:text-primary font-medium text-sm tracking-wide transition-colors duration-200';
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${headerClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="h-8 w-8 rounded-lg bg-primary text-black flex items-center justify-center font-black text-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
                D
              </span>
              <span className="font-sans font-extrabold text-xl tracking-tight text-current sm:text-2xl transition-all duration-200">
                Deven<span className="text-primary font-bold">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer hover:scale-105 duration-200 ${
                isHome
                  ? 'border-white/10 hover:bg-white/10 text-white'
                  : 'border-border hover:bg-surface text-foreground'
              }`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <a
              href="#newsletter-section"
              onClick={handleCTAClick}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-extrabold bg-primary text-black hover:bg-primary/95 transition-all rounded-lg shadow-md hover:scale-[1.02] active:scale-[0.98] duration-200"
            >
              Get Weekly Insights
            </a>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isHome
                  ? 'border-white/10 hover:bg-white/10 text-white'
                  : 'border-border hover:bg-surface text-foreground'
              }`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                isHome ? 'hover:bg-white/10' : 'hover:bg-surface'
              }`}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className={`md:hidden border-b transition-all duration-200 px-4 pt-2 pb-6 space-y-3 ${
          isHome
            ? 'bg-black/95 border-white/10 text-white'
            : 'bg-background border-border text-foreground'
        }`}>
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-semibold transition-all ${
                  pathname === link.href
                    ? 'text-primary bg-white/5'
                    : isHome
                      ? 'text-white/80 hover:bg-white/5 hover:text-primary'
                      : 'text-muted-foreground hover:bg-surface hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="#newsletter-section"
              onClick={handleCTAClick}
              className="w-full text-center px-4 py-3 text-base font-bold bg-primary text-black hover:bg-primary/95 transition-all rounded-lg shadow-md block"
            >
              Get Weekly Insights
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

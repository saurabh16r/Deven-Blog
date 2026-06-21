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
    { name: 'Admin', href: '/admin' }
  ];

  const handleCTAClick = (e: React.MouseEvent) => {
    const element = document.getElementById('newsletter-section');
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-lg bg-primary text-black flex items-center justify-center font-bold text-lg shadow-sm">
                F
              </span>
              <span className="font-sans font-extrabold text-xl tracking-tight text-foreground sm:text-2xl">
                Founder<span className="text-primary font-bold">Brief</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface border border-border text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <a
              href="#newsletter-section"
              onClick={handleCTAClick}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold bg-primary text-black hover:bg-primary/95 transition-all rounded-md shadow-xs"
            >
              Get Weekly Insights
            </a>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface border border-border text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-surface text-foreground transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 transition-all duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-semibold hover:bg-surface hover:text-primary transition-colors ${
                  pathname === link.href ? 'text-primary bg-surface/50' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="#newsletter-section"
              onClick={handleCTAClick}
              className="w-full text-center px-4 py-3 text-base font-bold bg-primary text-black hover:bg-primary/95 transition-all rounded-md shadow-xs block"
            >
              Get Weekly Insights
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

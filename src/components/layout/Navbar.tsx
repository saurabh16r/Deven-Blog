'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Articles', href: '/articles' },
    { name: 'Categories', href: '/#categories' },
    { name: 'About', href: '/#about' }
  ];

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (pathname === '/') {
      const element = document.getElementById('newsletter-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/#newsletter-section');
    }
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/articles?focus=search');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo on Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <img
                src="/deven-logo.png"
                alt="Deven Logo"
                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-serif font-black text-2xl tracking-tight text-foreground transition-all duration-200">
                Deven
              </span>
            </Link>
          </div>

          {/* Center/Right Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href.startsWith('/#') && pathname === '/');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-[#6B6258] hover:text-[#1F1A17] dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Search Icon */}
            <button
              onClick={handleSearchClick}
              className="p-2 text-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
              aria-label="Search articles"
            >
              <Search className="h-4.5 w-4.5 stroke-[1.5]" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 stroke-[1.5]" /> : <Moon className="h-4.5 w-4.5 stroke-[1.5]" />}
            </button>

            {/* Subscribe / Profile Dropdown action */}
            {status === 'authenticated' && session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center justify-center h-9 w-9 rounded-full overflow-hidden focus:outline-none cursor-pointer border ${
                    session.user.plan === 'premium' 
                      ? 'border-primary bg-primary/20 ring-2 ring-primary/20' 
                      : 'border-border bg-primary/20 text-foreground'
                  }`}
                  aria-label="User menu"
                >
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt={session.user.name || ''} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs uppercase font-serif select-none">
                      {getInitials(session.user.name)}
                    </span>
                  )}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-md py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-border font-semibold text-xs text-muted uppercase tracking-wider select-none truncate flex items-center justify-between gap-1.5">
                      <span className="truncate">{session.user.name || 'User'}</span>
                      {session.user.plan === 'premium' && (
                        <span className="bg-primary/20 text-[#D8A21A] dark:text-primary border border-primary/30 px-1 rounded text-[8px] font-black uppercase shrink-0">
                          Premium
                        </span>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[#6B6258] hover:text-[#1F1A17] dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] hover:bg-surface transition-colors font-medium"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/profile/history"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[#6B6258] hover:text-[#1F1A17] dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] hover:bg-surface transition-colors font-medium"
                    >
                      Reading History
                    </Link>
                    <Link
                      href="/profile/bookmarks"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[#6B6258] hover:text-[#1F1A17] dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] hover:bg-surface transition-colors font-medium"
                    >
                      Bookmarks
                    </Link>
                    <Link
                      href="/profile/subscription"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[#6B6258] hover:text-[#1F1A17] dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] hover:bg-surface transition-colors font-medium"
                    >
                      Subscription
                    </Link>
                    <Link
                      href="/profile/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-[#6B6258] hover:text-[#1F1A17] dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] hover:bg-surface transition-colors font-medium"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-surface transition-colors cursor-pointer border-t border-border mt-1 font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="#newsletter-section"
                onClick={handleSubscribeClick}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-all rounded-lg cursor-pointer"
              >
                Subscribe
              </a>
            )}
          </div>

          {/* Mobile Menu Action Block */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={handleSearchClick}
              className="p-2 text-muted hover:text-foreground cursor-pointer"
              aria-label="Search articles"
            >
              <Search className="h-4.5 w-4.5 stroke-[1.5]" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-foreground cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 stroke-[1.5]" /> : <Moon className="h-4.5 w-4.5 stroke-[1.5]" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted hover:text-foreground cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-base font-semibold text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {status === 'authenticated' && session?.user ? (
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                <div className="px-3 text-xs uppercase font-extrabold tracking-widest text-muted select-none flex items-center gap-2">
                  <span>Account ({session.user.name})</span>
                  {session.user.plan === 'premium' && (
                    <span className="bg-primary/20 text-[#D8A21A] dark:text-primary border border-primary/30 px-1 py-0.5 rounded text-[8px] font-black uppercase inline-block">
                      Premium
                    </span>
                  )}
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile/history"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  Reading History
                </Link>
                <Link
                  href="/profile/bookmarks"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  Bookmarks
                </Link>
                <Link
                  href="/profile/subscription"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  Subscription
                </Link>
                <Link
                  href="/profile/settings"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full text-left block px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-surface rounded-md transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="#newsletter-section"
                onClick={handleSubscribeClick}
                className="w-full text-center px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg block"
              >
                Subscribe
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


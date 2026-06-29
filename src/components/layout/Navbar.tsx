'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Menu, X, Sun, Moon, Search, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  const navLinks = [
    { name: 'Articles', href: '/articles' },
    { name: 'Categories', href: '/#categories' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/#about' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/articles?search=${encodeURIComponent(searchQuery)}`);
      setSearchExpanded(false);
      setSearchQuery('');
    }
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

  const getNavLinkClass = (href: string) => {
    const isActive = pathname === href || (href.startsWith('/#') && pathname === '/');
    return `text-sm font-semibold tracking-wide transition-all duration-200 ease-in-out relative py-1 ${
      isActive
        ? 'text-primary border-b-2 border-primary pb-0.5'
        : 'text-muted hover:text-foreground'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start items-center">
            <Link href="/" className="flex items-center space-x-1.5 group select-none">
              <img
                src="/deven-logo.png"
                alt="Deven Logo"
                className="h-9.5 w-9.5 object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-serif font-black text-2xl tracking-tight text-foreground transition-all duration-200">
                Deven
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={getNavLinkClass(link.href)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-5 justify-end flex-1">
            
            {/* Search Toggle Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className={`flex items-center overflow-hidden transition-all duration-300 rounded-lg bg-surface border ${
                searchExpanded ? 'w-40 lg:w-60 px-3 py-1.5 opacity-100 border-border' : 'w-0 opacity-0 border-transparent'
              }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    setTimeout(() => setSearchExpanded(false), 200);
                  }}
                  placeholder="Search articles..."
                  className="w-full bg-transparent text-xs focus:outline-hidden text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchExpanded(!searchExpanded)}
                className="p-2 text-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer shrink-0"
                aria-label="Search articles"
              >
                <Search className="h-4.5 w-4.5 stroke-[1.5]" />
              </button>
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-foreground hover:scale-105 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 stroke-[1.5]" /> : <Moon className="h-4.5 w-4.5 stroke-[1.5]" />}
            </button>

            {/* Authentication States */}
            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center space-x-4">
                
                {/* Upgrade Button (Free User only) */}
                {session.user.plan !== 'premium' && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center p-2 lg:px-4 lg:py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-all rounded-lg cursor-pointer"
                    aria-label="Upgrade"
                    title="Upgrade to Premium"
                  >
                    <Sparkles className="h-4 w-4 lg:hidden" />
                    <span className="hidden lg:inline">Upgrade</span>
                  </Link>
                )}

                {/* Profile Dropdown Action */}
                <div className="relative font-sans" ref={dropdownRef}>
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
                        className="block px-4 py-2 text-muted hover:text-foreground hover:bg-surface transition-colors font-medium"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/profile/history"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-muted hover:text-foreground hover:bg-surface transition-colors font-medium"
                      >
                        Reading History
                      </Link>
                      <Link
                        href="/profile/bookmarks"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-muted hover:text-foreground hover:bg-surface transition-colors font-medium"
                      >
                        Bookmarks
                      </Link>
                      <Link
                        href="/profile/subscription"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-muted hover:text-foreground hover:bg-surface transition-colors font-medium"
                      >
                        Subscription
                      </Link>
                      <Link
                        href="/profile/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-muted hover:text-foreground hover:bg-surface transition-colors font-medium"
                      >
                        Settings
                      </Link>
                      {session.user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-primary hover:bg-surface transition-colors font-semibold border-t border-border mt-1"
                        >
                          Admin Panel
                        </Link>
                      )}
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
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Sign In */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center p-2 lg:px-4 lg:py-2 text-sm font-semibold text-muted hover:text-foreground border border-transparent hover:border-border rounded-lg transition-colors cursor-pointer"
                  aria-label="Sign In"
                  title="Sign In"
                >
                  <LogIn className="h-4.5 w-4.5 lg:hidden" />
                  <span className="hidden lg:inline">Sign In</span>
                </Link>

                {/* Create Account */}
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center p-2 lg:px-4 lg:py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-all rounded-lg cursor-pointer"
                  aria-label="Create Account"
                  title="Create Account"
                >
                  <UserPlus className="h-4.5 w-4.5 lg:hidden" />
                  <span className="hidden lg:inline">Create Account</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu action controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => {
                router.push('/articles?focus=search');
              }}
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

      {/* Mobile menu container */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 font-sans">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href.startsWith('/#') && pathname === '/');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 text-base font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'text-primary bg-surface-hover/20'
                      : 'text-muted hover:text-foreground hover:bg-surface'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {status === 'authenticated' && session?.user ? (
              <div className="border-t border-border pt-4 mt-4 space-y-2">
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
                  Profile
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
                
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-primary hover:bg-surface rounded-md transition-colors border border-primary/20"
                  >
                    Admin Panel
                  </Link>
                )}

                {session.user.plan !== 'premium' && (
                  <Link
                    href="/pricing"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg block mt-4"
                  >
                    Upgrade
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full text-left block px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-surface rounded-md transition-colors cursor-pointer border-t border-border mt-3"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-border pt-4 mt-4 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold border border-border text-foreground hover:bg-surface transition-colors rounded-lg block"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors rounded-lg block"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

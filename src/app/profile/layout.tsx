'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  LayoutDashboard, 
  History, 
  Bookmark, 
  CreditCard, 
  Settings, 
  LogOut,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Collapse sidebar by default on tablet (768px <= width < 1024px)
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarLinks = [
    { name: 'Dashboard', href: '/profile', icon: LayoutDashboard, mobileName: 'Dashboard' },
    { name: 'Reading History', href: '/profile/history', icon: History, mobileName: 'History' },
    { name: 'Bookmarks', href: '/profile/bookmarks', icon: Bookmark, mobileName: 'Bookmarks' },
    { name: 'Subscription', href: '/profile/subscription', icon: CreditCard, mobileName: 'Subscription' },
    { name: 'Account Settings', href: '/profile/settings', icon: Settings, mobileName: 'Settings' },
  ];

  const activeLink = sidebarLinks.find(link => pathname === link.href) || sidebarLinks[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* Top Navbar: Hide on mobile, show on tablet and desktop */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Sticky Navigation: Sticky at the top on mobile, hidden on tablet and desktop */}
      <div className="sticky top-0 z-40 bg-background md:hidden border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)]">
        {/* Compact Mobile Header */}
        <div className="flex items-center justify-between h-14 px-4 bg-background">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>Back to Home</span>
          </Link>
          <span className="font-serif font-black text-sm tracking-tight text-foreground">
            {activeLink.name}
          </span>
        </div>
        
        {/* Horizontally Scrollable Tab Bar */}
        <div className="overflow-x-auto scrollbar-none border-t border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.04)] px-2 bg-background">
          <div className="flex items-center gap-2 min-w-max py-1.5">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative transition-all ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <span className="relative z-10">{link.mobileName}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-sm" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar Navigation: Hidden on mobile, shown on tablet/desktop */}
          <aside className={`hidden md:block transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} shrink-0 relative`}>
            <div className={`border border-border rounded-lg bg-background p-3.5 space-y-1 sticky top-24 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-full'}`}>
              
              {/* Sidebar Links */}
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isCollapsed ? link.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-[#6B6258] hover:text-[#1F1A17] hover:bg-surface dark:text-[#D4D4D4] dark:hover:text-[#FAFAF9] dark:hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 stroke-[1.5] shrink-0" />
                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                  </Link>
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                title={isCollapsed ? 'Logout' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-surface dark:hover:bg-surface-hover transition-all cursor-pointer text-left border-t border-border mt-2 pt-3 ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <LogOut className="h-4.5 w-4.5 stroke-[1.5] shrink-0" />
                {!isCollapsed && <span className="truncate">Logout</span>}
              </button>

              {/* Sidebar Collapse Toggle Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full border border-border bg-background hover:bg-surface transition-colors shadow-sm cursor-pointer z-10 hidden md:flex"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-muted" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5 text-muted" />
                )}
              </button>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="flex-grow min-w-0">
            <div className="border-none md:border md:border-border md:rounded-lg bg-transparent md:bg-background p-0 md:p-10 min-h-0 md:min-h-[480px]">
              {children}
            </div>
          </main>

        </div>

        {/* Mobile Logout Button at the bottom of the page */}
        <div className="md:hidden flex flex-col items-center mt-12 mb-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted hover:text-foreground transition-colors cursor-pointer border border-border rounded-lg bg-surface/30"
          >
            <LogOut className="h-4 w-4 stroke-[1.5]" />
            <span>Logout</span>
          </button>
        </div>

      </div>

      <Footer />

      {/* Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm p-6 bg-background border border-border rounded-xl shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="font-serif font-black text-xl text-foreground">
              Confirm Logout
            </h3>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to log out of your FounderBrief account?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-bold text-muted hover:text-foreground border border-border hover:bg-surface rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
